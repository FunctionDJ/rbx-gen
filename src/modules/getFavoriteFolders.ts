import volumes from "./vdjVolumes"
import { promises as fs } from "fs"
import path from "path"
import xml2js from "xml2js"
import { asyncMap } from "../functions/asyncHelpers"

export type FavoriteFolder = {
  fullPath: string
  relativeFolder: string
}

export type FolderFile = {
  path: string
  folder: string
}

export default async (): Promise<FavoriteFolder[]> => {
  const allvdjFolderFiles: FolderFile[] = await (await volumes).reduce(async (prev: Promise<FolderFile[]>, folder) => {
    const dirents = await fs.readdir(path.join(folder, "Folders"), {
      withFileTypes: true
    })

    const favFolders = dirents
      .filter(d => d.isFile())
      .filter(d => d.name.endsWith(".vdjfolder"))
      .map(d => ({
        path: path.join(folder, "Folders", d.name),
        folder: path.parse(d.name).name
      }))

    return (await prev).concat(favFolders)
  }, Promise.resolve([]))

  const modelGroups = await asyncMap<FolderFile, [any, string]>(allvdjFolderFiles, async ({ path, folder }) => {
    const content = await fs.readFile(path, { encoding: "utf-8" })
    const xmlModel = await xml2js.parseStringPromise(content)
    return [xmlModel, folder]
  })

  return modelGroups
    .filter(g => g[0].FavoriteFolder)
    .map(g => ({
      fullPath: g[0].FavoriteFolder.$.path,
      relativeFolder: g[1]
    }))
}