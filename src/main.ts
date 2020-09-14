import getFavoriteFolders from "./modules/getFavoriteFolders"
import readdirp from "readdirp"
import { getDocumentsFolder } from "platform-folders"
import path from "path"
import { asyncMap } from "./functions/asyncHelpers"
import { FavoriteFolder } from "./modules/getFavoriteFolders"
import Rekordbox from "./models/Rekordbox"
import { promises as fs } from "fs"
import { PlaylistNode, StructNode } from "./models/Node"
import Track from "./models/Track"
import cliProgress from "cli-progress"
import sleep from "./functions/sleep"
import getNativePlaylistRoot from "./modules/getNativePlaylistRoot"
import getTrackData from "./modules/getTrackData"
import flattenArray from "./functions/flattenArray"

const isFile = (line: string) => {
  const info = path.parse(line)
  return info.ext !== ""
}

const isNotComment = (line: string) => {
  return !line.startsWith("#")
}

const attachTrackLine = async (trackLine: string, playlist: PlaylistNode, playlistFileInfo: path.ParsedPath) => {
  const absoluteFilePath = path.resolve(playlistFileInfo.dir, trackLine)

  const track = new Track(await getTrackData(absoluteFilePath))

  playlist.addTrack(track)
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
    structNode = new StructNode(currentSegment)
    previousNode.childNodes.push(structNode)
  }

  return createAndGetParentNode(parentSegments.slice(1), structNode)
}

type PlaylistFile = readdirp.EntryInfo & {
  relativeFolder: string
}

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
      .map(l => l.trim())
      .filter(isNotComment)
      .filter(isFile)

    const playlist = new PlaylistNode(playlistFileInfo.name, rekordbox)

    for (const trackLine of trackLines) {
      try {
        await attachTrackLine(trackLine, playlist, playlistFileInfo)
      } catch (error) {
        console.error(error)
        debugger
      }
    }

    const parentSegments = getParentSegments(playlistFile)

    const parentNode = createAndGetParentNode(parentSegments, rekordbox.rootNode)
    parentNode.childNodes.push(playlist)

    await sleep(3)
    modelBar.increment()
  }
  modelBar.stop()

  const target = "./build/rekordbox.xml"

  console.log("Generating XML and writing...")
  await fs.writeFile(target, rekordbox.getXML())
  console.log("Written to " + target)
  process.exit()
})()