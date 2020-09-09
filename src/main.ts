import getFavoriteFolders from "./modules/getFavoriteFolders"
import readdirp from "readdirp"
import { getDocumentsFolder } from "platform-folders"
import path from "path"
import { asyncMap } from "./modules/asyncHelpers"
import { FavoriteFolder } from "./modules/getFavoriteFolders"
import Rekordbox from "./models/Rekordbox"
import { promises as fs } from "fs"
import { PlaylistNode, StructNode } from "./models/Node"
import Track from "./models/Track"
import id3 from "node-id3"
import slash from "slash"
import cliProgress from "cli-progress"

const isFile = (line: string) => {
  const info = path.parse(line)
  return info.ext !== ""
}

const isNotComment = (line: string) => {
  return !line.startsWith("#")
}

const getNativePlaylistRoot = (favoriteFolders: FavoriteFolder[]) => {
  const hasFavNamedPlaylists = favoriteFolders.find(f => f.relativeFolder.endsWith("Playlists"))
  const nativePlaylistRoot = hasFavNamedPlaylists ? "VDJ-Playlists" : "Playlists"

  if (hasFavNamedPlaylists && favoriteFolders.find(f => f.relativeFolder.endsWith("VDJ-Playlists"))) {
    throw new Error("Playlist name collision (rename one of your fav folders from Playlists or VDJ-Playlists")
  }

  return nativePlaylistRoot
}

const attachTrackLine = (trackLine: string, playlist: PlaylistNode, playlistFileInfo: path.ParsedPath) => {
  const absoluteFilePath = path.resolve(playlistFileInfo.dir, trackLine)

  let title: string
  let artist: string
  let size: number

  let id3Info = null

  try {
    // TODO: Caching
    id3Info = id3.read(absoluteFilePath)
    title = id3Info.title
    artist = id3Info.artist
    size = id3Info.size || 0
  } catch (error) {
    const info = path.parse(trackLine)
    const result = info.name.match(/\s*(.+)\s*-\s*(.+)\s*/)

    if (result === null) {
      throw new Error("Couldn't extract artist - title from this trackLine")
    }

    title = result[2]
    artist = result[1]
    size = 0
  }

  const location = "file://localhost/" + slash(absoluteFilePath)
  const track = new Track(title, artist, size, location)
  playlist.addTrack(track)

  if (id3Info) {
    track.album = id3Info.album
    track.averageBpm = id3Info.bpm
    track.comments = id3Info.comment?.text || ""
    track.composer = id3Info.composer

    track.genre = id3Info.genre
    // TODO track.grouping = id3Info.contentGroup richtig so?
    track.label = id3Info.publisher
    // TODO ??? track.mix
    track.remixer = id3Info.remixArtist
    // TODO ??? track.tonality = id3Info.initialKey
    track.totalTime = id3Info.length // TODO richtiges format?
    track.trackNumber = parseInt(id3Info.trackNumber, 0)
    track.year = id3Info.year
  }

  return track
}

const getParentSegments = ({ path: pathProp, relativeFolder }: PlaylistFile) => {
  const mergedPath = path.join(relativeFolder, pathProp)
  const info = path.parse(mergedPath)
  return info.dir.split(path.sep).filter(s => s)
}

const createAndGetParentNode = (parentSegments: string[], previousNode: StructNode): StructNode => {
  if (parentSegments.length < 1) {
    return previousNode
  }

  const currentSegment = parentSegments[0]

  let structNode = previousNode.childNodes.find(n => n.name === currentSegment) as StructNode

  if (!structNode) {
    structNode = new StructNode(currentSegment, 0, 0)
    previousNode.childNodes.push(structNode)
  }

  return createAndGetParentNode(parentSegments.slice(1), structNode)
}

type PlaylistFile = readdirp.EntryInfo & {
  relativeFolder: string
}

const flattenArray = <T>(arr: T[][]) =>
  arr.reduce((prev, curr) => prev.concat(curr), [])

;(async () => {
  console.log("Getting favorite folders...")
  const favoriteFolders = await getFavoriteFolders()

  const nativePlaylistRoot = getNativePlaylistRoot(favoriteFolders)

  const vdjPlaylistsFolder: FavoriteFolder = {
    fullPath: path.join(getDocumentsFolder(), "Playlists"),
    relativeFolder: nativePlaylistRoot
  }

  const playlistLocations = [...favoriteFolders, vdjPlaylistsFolder]

  console.log("Getting playlist files...")
  const playlistFileBar = new cliProgress.SingleBar({})
  playlistFileBar.start(playlistLocations.length, 0)

  const playlistFilesNested = await asyncMap(playlistLocations, fav => {
    return readdirp.promise(fav.fullPath, { fileFilter: ["*.m3u", "*.m3u8"] })
      .then(array => {
        playlistFileBar.increment()
        return array.map((entry): PlaylistFile => ({
          ...entry,
          relativeFolder: fav.relativeFolder
        }))
      })
    }
  )

  playlistFileBar.stop()

  const playlistFiles = flattenArray(playlistFilesNested)

  const rekordbox = new Rekordbox()

  console.log("Creating Rekordbox model...")
  const modelBar = new cliProgress.SingleBar({})
  modelBar.start(playlistFiles.length, 0)

  for (const playlistFile of playlistFiles) {
    const playlistFileInfo = path.parse(playlistFile.fullPath)

    const contents = await fs.readFile(playlistFile.fullPath, { encoding: "utf-8" })

    const trackLines = contents.split("\n")
      .filter(isNotComment)
      .filter(isFile)

    const playlist = new PlaylistNode(playlistFileInfo.name, 1, 0, rekordbox)

    for (const trackLine of trackLines) {
      try {
        attachTrackLine(trackLine, playlist, playlistFileInfo)
      } catch (error) {
        console.error(error)
      }
    }

    const parentSegments = getParentSegments(playlistFile)

    const parentNode = createAndGetParentNode(parentSegments, rekordbox.rootNode)
    parentNode.childNodes.push(playlist)

    modelBar.increment()
  }
  modelBar.stop()

  const target = "./build/rekordbox.xml"

  console.log("Generating XML and writing...")
  await fs.writeFile(target, rekordbox.getXML())
  console.log("Written to " + target)
  process.exit()
})()