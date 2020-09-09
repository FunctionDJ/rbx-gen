import { promises as fs } from "fs"
import path from "path"
import { getDocumentsFolder } from "platform-folders"

const volumesPromise: Promise<string[]> = new Promise(async res => {
  const alphabet = Array(26)
    .fill(1)
    .map((_, i) => String.fromCharCode(65 + i))
  
  const drivesPromises = alphabet.map(async letter => {
    try {
      await fs.access(letter + ":")
      return letter
    } catch (error) {
      return null
    }
  })
  
  const volumes = (await Promise.all(drivesPromises))
    .filter(p => p)

  const vdjVolumesPromises = volumes.map(async letter => {
    try {
      const possibleLocation = path.join(letter + ":", "VirtualDJ")
      await fs.access(possibleLocation)
      return possibleLocation
    } catch (error) {
      return null
    }
  })

  const vdjVolumes = (await Promise.all(vdjVolumesPromises))
    .filter(p => p !== null)

  vdjVolumes.push(path.join(getDocumentsFolder(), "VirtualDJ"))

  res(vdjVolumes)
})

export default volumesPromise