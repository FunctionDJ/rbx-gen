import TruePath from "../classes/TruePath"
import xml2js from "xml2js"
import { asyncMap } from "../functions/asyncHelpers"
import { promises as fs } from "fs"

class Infos {
  constructor(
    public readonly firstSeen: Date,
    public readonly cover: number,
    public readonly songLength?: number,
    public readonly firstPlay?: Date,
    public readonly bitrate?: number,
    public readonly playCount?: number
  ) {}
}

class Scan {
  constructor(
    public readonly version: number,
    public readonly bpm: number,
    public readonly altBpm?: number,
    public readonly volume?: number,
    public readonly key?: string,
    public readonly flag?: number
  ) {}
}

class Poi {
  constructor(
    public readonly type: string,
    public readonly pos?: number,
    public readonly name?: string,
    public readonly num?: number,
    public readonly bpm?: number
  ) {}
}

class Tags {
  constructor(
    public readonly flag: number,
    public readonly bpm?: number,
    public readonly year?: number,
    public readonly author?: string,
    public readonly title?: string,
    public readonly genre?: string,
    public readonly remix?: string,
    public readonly stars?: number,
    public readonly album?: string
  ) {}
}

const getInt = (input?: string) => input ? parseInt(input, 10) : undefined
const getFloat = (input?: string) => input ? parseFloat(input) : undefined

const getDateFromVDJDate = (input: string) => new Date(parseInt(input, 10) * 1000)

class Song {
  public readonly filePath: TruePath
  public readonly fileSize?: number
  public readonly tags: Tags
  public readonly infos: Infos
  public readonly comment?: string
  public readonly scan?: Scan
  public readonly pois: Poi[] = []

  constructor(songXML: VDJ_DB_XML["VirtualDJ_Database"]["Song"][0]) {
    this.filePath = new TruePath(songXML.$.FilePath)

    if (songXML.$.FileSize) {
      this.fileSize = parseInt(songXML.$.FileSize, 10)
    }

    const tagsData = songXML.Tags[0].$
    this.tags = new Tags(
      parseInt(tagsData.Flag, 10),
      getFloat(tagsData.Bpm),
      getInt(tagsData.Year),
      tagsData.Author,
      tagsData.Title,
      tagsData.Genre,
      tagsData.Remix,
      getInt(tagsData.Stars),
      tagsData.Album
    )

    const infosData = songXML.Infos[0].$
    this.infos = new Infos(
      getDateFromVDJDate(infosData.FirstSeen),
      parseInt(infosData.Cover, 10),
      getFloat(infosData.SongLength),
      infosData.FirstPlay ? getDateFromVDJDate(infosData.FirstPlay) : undefined,
      getInt(infosData.Bitrate),
      getInt(infosData.PlayCount)
    )

    if (songXML.Comment) {
      this.comment = songXML.Comment._
    }

    if (songXML.Scan) {
      const scanData = songXML.Scan[0].$
      this.scan = new Scan(
        parseInt(scanData.Version, 10),
        parseFloat(scanData.Bpm),
        getFloat(scanData.AltBpm),
        getFloat(scanData.Volume),
        scanData.Key,
        getInt(scanData.Flag)
      )
    }

    this.pois = songXML.Poi?.map(p =>
      new Poi(
        p.$.Type,
        getFloat(p.$.Pos),
        p.$.Name,
        getInt(p.$.Num),
        getFloat(p.$.Bpm)
      )
    ) ?? []
  }
}

type VDJ_DB_XML = {
  VirtualDJ_Database: {
    $: {
      Version: string
    }
    Song: [
      {
        $: {
          FilePath: string
          FileSize?: string
          Flag: string
        }
        Tags: [
          {
            $: {
              Flag: string // int / bitmask?
              Bpm?: string // float
              Year?: string
              Author?: string
              Title?: string
              Genre?: string
              Remix?: string
              Album?: string
              Label?: string
              TrackNumber?: string // int
              Stars?: string // int
              Key?: string // harmonic key string like "Dm" or "F"
            }
          }
        ]
        Infos: [
          {
            $: {
              FirstSeen: string // unix timestamp, needs *1000 for new Date()
              Cover: string // int, maybe bitmask?
              SongLength?: string // float, length in seconds
              FirstPlay?: string // date see above
              Bitrate?: string // int like 320
              PlayCount?: string // int
            }
          }
        ]
        Scan?: [
          {
            $: {
              Version: string
              Bpm: string
              AltBpm?: string
              Volume?: string
              Key?: string
              Flag?: string
            }
          }
        ]
        Poi?: [
          {
            $: {
              Pos?: string
              Type: "automix" | "remix" | "beatgrid"
              Name?: string
              Num?: string
              Bpm?: string
              Point?: string
            }
          }
        ]
        Comment?: {
          _: string
        }
      }
    ]
  }
}

export class Database {
  constructor(
    public readonly version: number,
    public readonly songs: Map<TruePath, Song>
  ) {}
}

export default class VirtualDJ {
  private constructor() {}

  private static databases: Database[] = []
  private static masterbase?: Database

  public static async readDatabases(databaseFilePaths: TruePath[]) {
    const xmlStrings = await asyncMap(databaseFilePaths, filePath => fs.readFile(String(filePath), { encoding: "utf-8" }))
    this.databases = await asyncMap(xmlStrings, x => this.getDatabaseFromXML(x))
    return this.databases
  }

  public static getDatabases() {
    return this.databases
  }

  public static getMasterbase() {
    if (!this.masterbase) {
      const songs = new Map<TruePath, Song>()

      for (const database of this.databases) {
        for (const [filePath, song] of database.songs) {
          songs.set(filePath, song)
        }
      }

      this.masterbase = new Database(this.databases[0].version, songs)
    }

    return this.masterbase
  }

  public static async getDatabaseFromXML(xml: string): Promise<Database> {
    const xmlModel = await xml2js.parseStringPromise(xml, {
      explicitArray: true
    }) as VDJ_DB_XML

    const songs = new Map<TruePath, Song>()

    for (const songXML of xmlModel.VirtualDJ_Database.Song) {
      songs.set(new TruePath(songXML.$.FilePath), new Song(songXML))
    }

    const version = parseFloat(xmlModel.VirtualDJ_Database.$.Version)
    
    return new Database(version, songs)
  }
}