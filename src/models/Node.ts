import Track from "./Track"
import Rekordbox from "./Rekordbox"

export abstract class Node {
  public readonly name: string
  public readonly type: number = 0
  public readonly count: number = 0

  constructor(name: string, type: number) {
    this.name = name
    this.type = type
  }

  getXMLReady(): any {}
}

export class StructNode extends Node {
  public readonly count: number
  public childNodes: Node[] = []

  constructor(name: string, type: number, count: number) {
    super(name, type)
    this.count = count
  }

  getXMLReady() {
    return {
      $: {
        Type: this.type,
        Name: this.name,
        Count: this.count
      },
      NODE: this.childNodes.map(c => c.getXMLReady())
    }
  }
}

export class PlaylistNode extends Node {
  public readonly keyType: number
  public readonly tracks: Track[] = []
  private rekordbox: Rekordbox

  constructor(name: string, type: number, keyType: number, rekordbox: Rekordbox) {
    super(name, type)
    this.keyType = keyType
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