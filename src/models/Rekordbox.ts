import Track from "./Track"
import { StructNode } from "./Node"
import xml2js from "xml2js"

export default class Rekordbox {
  public readonly name = "rekordbox"
  public readonly version = "5.6.0"
  public readonly company = "Pioneer DJ"

  public readonly tracks: Track[] = []
  public readonly rootNode: StructNode

  addTrack(track: Track) {
    this.tracks.push(track)
    track.id = this.tracks.length
  }

  constructor() {
    this.rootNode = new StructNode("ROOT")
  }

  getXML() {
    const builder = new xml2js.Builder({
      rootName: "DJ_PLAYLISTS"
    })

    const rootNodeXMLReady = this.rootNode.getXMLReady()
    
    const djPlaylists = {
      $: {
        Version: "1.0.0"
      },
      PRODUCT: {
        $: {
          Name: this.name,
          Version: this.version,
          Company: this.company
        }
      },
      COLLECTION: {
        $: {
          Entries: this.tracks.length
        },
        TRACK: this.tracks.map(track => track.getXMLReady())
      },
      PLAYLISTS: {
        NODE: rootNodeXMLReady
      }
    }

    return builder.buildObject(djPlaylists)
  }
}