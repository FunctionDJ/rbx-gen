import { FavoriteFolder } from "./getFavoriteFolders"

export default (favoriteFolders: FavoriteFolder[]) => {
  const hasFavNamedPlaylists = favoriteFolders.find(f => f.relativeFolder.endsWith("Playlists"))
  const nativePlaylistRoot = hasFavNamedPlaylists ? "VDJ-Playlists" : "Playlists"

  if (hasFavNamedPlaylists && favoriteFolders.find(f => f.relativeFolder.endsWith("VDJ-Playlists"))) {
    throw new Error("Playlist name collision (rename one of your fav folders from Playlists or VDJ-Playlists")
  }

  return nativePlaylistRoot
}