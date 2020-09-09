import slash from "slash"

enum Kind {
  "WAV File"
}

export default class Track {
  public id: number

  public readonly name: string = ""
  public readonly artist: string = ""
  public composer: string = ""
  public album: string = ""
  public grouping: string = ""
  public genre: string = ""
  public kind: Kind = Kind["WAV File"]
  public readonly size: number = 0
  public totalTime: number = 0
  public discNumber: number = 0
  public trackNumber: number = 0
  public year: number = 0
  public averageBpm: number = 0.0
  public dateAdded: Date
  public bitRate: string = "" // TODO ??
  public sampleRate: number = 44100
  public comments: string = ""
  public playCount: number = 0
  public rating: number = 0
  public readonly location: string
  public remixer: string = ""
  public tonality: string = ""
  public label: string = ""
  public mix: string = ""

  constructor(name: string, artist: string, size: number, location: string) {
    this.name = name
    this.artist = artist
    this.size = size
    this.location = location
    this.dateAdded = new Date()
  }

  getXMLReady() {
    const xmlLocation = slash(this.location).replace(/\s/g, "%20")

    return {
      $: {
        TrackID: this.id,
        Name: this.name,
        Artist: this.artist,
        Composer: this.composer,
        Album: this.album,
        Grouping: this.grouping,
        Genre: this.genre,
        Kind: this.kind,
        Size: this.size,
        TotalTime: this.totalTime,
        DiscNumber: this.discNumber,
        TrackNumber: this.trackNumber,
        Year: this.year,
        AverageBpm: this.averageBpm,
        DateAdded: this.dateAdded,
        BitRate: this.bitRate,
        SampleRate: this.sampleRate,
        Comments: this.comments,
        PlayCount: this.playCount,
        Rating: this.rating,
        Location: xmlLocation,
        Remixer: this.remixer,
        Tonality: this.tonality,
        Label: this.label,
        Mix: this.mix
      }
    }
  }
}