import Track from "./Track"
import Rekordbox from "./Rekordbox"

export abstract class Node {
  public readonly name: string
  public readonly type: number = 0
  public readonly count: number = 0

  constructor(name: string) {
    this.name = name
  }

  getXMLReady(): any {}
}

export class StructNode extends Node {
  public childNodes: Node[] = []
  public readonly type = 0

  getXMLReady() {
    return {
      $: {
        Type: this.type,
        Name: this.name,
        Count: this.childNodes.length
      },
      NODE: this.childNodes.map(c => c.getXMLReady())
    }
  }
}

export class PlaylistNode extends Node {
  public readonly keyType: number = 0
  public readonly tracks: Track[] = []
  private rekordbox: Rekordbox
  public readonly type = 1

  constructor(name: string, rekordbox: Rekordbox) {
    super(name)
    this.rekordbox = rekordbox
  }

  addTrack(track: Track) {
    this.rekordbox.addTrack(track)
    this.tracks.push(track)
  }

  getXMLReady() {
    return {
      $: {
        Name: this.name,
        Type: this.type,
        KeyType: this.keyType,
        Entries: this.tracks.length
      },
      TRACK: this.tracks.map(t => ({
        $: {
          Key: t.id
        }
      }))
    }
  }
}