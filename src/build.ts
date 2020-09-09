import xml2js from "xml2js"
import { promises as fs } from "fs"

const builder = new xml2js.Builder({
  renderOpts: {
    pretty: true
  }
})

const xml = builder.buildObject({
  DJ_PLAYLISTS: {
    $: { Version: "1.0.0" },
    PRODUCT: {
      $: {
        Name: "rekordbox",
        Version: "5.6.0",
        Company: "Pioneer DJ"
      }
    },
    COLLECTION: {
      $: { Entries: 163 },
      TRACK: [
        {
          $: {
            TrackID: 1,
            Name: "NOISE",
            Artist: "",
            Composer: "",
            Album: "",
            Grouping: "",
            Genre: "",
            Kind: "WAV File",
            Size: "1515258",
            TotalTime: 5,
            DiscNumber: 0,
            TrackNumber: 0,
            Year: 0,
            AverageBpm: "0.00",
            DateAdded: "2020-09-05",
            BitRate: "2116",
            SampleRate: "44100",
            Comments: "",
            PlayCount: 0,
            Rating: 0,
            Location: "file://localhost/C:/Users/roman/Music/PioneerDJ/Sampler/OSC_SAMPLER(2)/PRESET%20ONESHOT/SINEWAVE.wav",
            Remixer: "",
            Tonality: "",
            Label: "",
            Mix: ""
          }
        }
      ]
    },
    PLAYLISTS: {
      NODE: {
        $: {
          Type: 0,
          Name: "ROOT",
          Count: 2
        },
        NODE: [
          {
            $: { Name: "EDM", Type: 0, Count: 3 },
            NODE: {
              $: { Name: "Bass House POG", Type: 1, KeyType: 0, Entries: 39 },
              TRACK: [
                { $: { Key: 61 } }
              ]
            }
          }
        ]
      }
    }
  }
})

fs.writeFile("./rekordbox.xml", xml)