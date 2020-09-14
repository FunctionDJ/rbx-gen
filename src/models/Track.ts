import slash from "slash"
import { PositionMark } from "./PositionMark"
import Tempo from "./Tempo"

export type trackData = {
  name: string
  artist: string
  composer: string
  album: string // default ""
  grouping: string // default ""
  genre: string // default ""
  extension: string
  size: number // file size in bytes
  totalTime: string // track length in seconds
  discNumber: number // default 0
  trackNumber: number // default 0
  year: number // "YYYY"
  averageBpm: number // "128.00"
  dateAdded: Date // "YYYY-MM-DD"
  bitRate: number // 320, 128 ...
  sampleRate: number // 44100, 48000
  comments: string // default ""
  playCount: number // default 0
  rating: number // default 0
  absolutePath: string
  remixer: string // default ""
  tonality: string // default: "", submediant, e.g. "Ebm", "Gm", "F#m"
  label: string
  mix: string // TODO what for?
}

export default class Track {
  public id: number|undefined = undefined
  
  private trackData: trackData

  public tempos: Tempo[] = []
  public positionMarks: PositionMark[] = []

  constructor(trackData: trackData) {
    this.trackData = trackData

    // this.genre = id3Data.genre
    // // TODO this.grouping = id3Info.contentGroup richtig so?
    // this.label = id3Data.publisher
    // // TODO ??? this.mix
    // this.remixer = id3Data.remixArtist
    // // TODO ??? this.tonality = id3Info.initialKey
    // this.totalTime = id3Data.length // TODO richtiges format?
    // this.trackNumber = parseInt(id3Data.trackNumber, 0)
    // this.year = id3Data.year
  }

  get kind() {
    return this.trackData.extension.toUpperCase() + " File"
  }

  get location() {
    return "file://localhost/" + slash(this.trackData.absolutePath)
      .replace(/\s/g, "%20")
  }

  get paddedBPM() {
    if (typeof this.trackData.averageBpm !== "number") {
      console.log(this.trackData.averageBpm)
      debugger
    }
    return this.trackData.averageBpm.toFixed(2)
  }

  get formattedDate() {
    const date = this.trackData.dateAdded
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // why do they start counting at 0...
    const day = date.getDate() // why do they make "getDay" return the name, and "getDate" get the day number...
    return `${year}-${month}-${day}`
  }

  getXMLReady() {
    return {
      $: {
        TrackID: this.id,
        Name: this.trackData.name,
        Artist: this.trackData.artist,
        Composer: this.trackData.composer,
        Album: this.trackData.album,
        Grouping: this.trackData.grouping,
        Genre: this.trackData.genre,
        Kind: this.kind,
        Size: this.trackData.size,
        TotalTime: this.trackData.totalTime,
        DiscNumber: this.trackData.discNumber,
        TrackNumber: this.trackData.trackNumber,
        Year: this.trackData.year,
        AverageBpm: this.paddedBPM,
        DateAdded: this.formattedDate,
        BitRate: this.trackData.bitRate,
        SampleRate: this.trackData.sampleRate,
        Comments: this.trackData.comments,
        PlayCount: this.trackData.playCount,
        Rating: this.trackData.rating,
        Location: this.location,
        Remixer: this.trackData.remixer,
        Tonality: this.trackData.tonality,
        Label: this.trackData.label,
        Mix: this.trackData.mix
      },
      TEMPO: this.tempos.map(t => t.getXMLReady()),
      POSITION_MARK: this.positionMarks.map(p => p.getXMLReady())
    }
  }
}