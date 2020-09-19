import path from "path"
import { trackData } from "../models/Track"
import createCacher from "../functions/createCacher"
import id3 from "node-id3"
import { promises as fs, Stats } from "fs"
import { Database as VDJDatabase } from "../models/VirtualDJ"
import TruePath from "../classes/TruePath"

const getID3Data = createCacher<id3.Tags|null>(async absolutePath => {
  try {
    return id3.read(absolutePath)
  } catch (e) {
    return null
  }
})

const getStat = createCacher<Stats|null>(absolutePath => fs.stat(absolutePath).catch(() => null))

export default async (filePath: TruePath, vdjDatabase: VDJDatabase): Promise<trackData> => {
  const absolutePath = String(filePath)
  const id3Data = await getID3Data(absolutePath)

  const fileInfo = path.parse(absolutePath)

  const parsedInfoResult = fileInfo.name.trim().match(/\s*(.+)[\s_]*-[\s_]*(.+)\s*/)

  const parsedTitle = parsedInfoResult?.[2] ?? fileInfo.name
  const parsedArtist = parsedInfoResult?.[1] ?? ""

  const dbEntry = vdjDatabase.songs.get(filePath)

  return {
    absolutePath,
    album: dbEntry?.tags.album ?? "", // TODO id3 fallback
    artist: dbEntry?.tags.author ?? parsedArtist,
    averageBpm: parseFloat(String(id3Data?.bpm ?? 0)), // id3Data.bpm can actually be a string
    bitRate: dbEntry?.infos.bitrate ?? 0,
    comments: dbEntry?.comment ?? id3Data?.comment?.text ?? "",
    composer: id3Data?.composer ?? "",
    dateAdded: dbEntry?.infos.firstSeen ?? new Date(),
    discNumber: 0, // TODO ?
    extension: fileInfo.ext.slice(1),
    genre: id3Data?.genre ?? "",
    grouping: "", // id3Data?.contentGroup ?? "", // TODO is this correct?
    label: id3Data?.publisher ?? "",
    mix: "", // TODO idk what this is, maybe the remix field from VDJ?
    name: id3Data?.title ?? parsedTitle,
    playCount: dbEntry?.infos.playCount ?? 0,
    rating: dbEntry?.tags.stars ?? 0,
    remixer: id3Data?.remixArtist ?? "",
    sampleRate: 44100, // TODO where can we get this data from? it's not in the VDJ DB nor in the id3's
    size: id3Data?.size ?? (await getStat(absolutePath))?.size ?? 0, // TODO correct, but maybe pull from db?
    tonality: dbEntry?.scan?.key ?? id3Data?.initialKey ?? "",
    totalTime: id3Data?.time ?? "", // TODO correct?
    trackNumber: parseInt(id3Data?.trackNumber ?? "0", 0) as number,
    year: id3Data?.year ?? (new Date()).getFullYear()
  }
}