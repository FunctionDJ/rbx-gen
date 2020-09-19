import path from "path"

export default class TruePath {
  private info: path.ParsedPath

  constructor(pathLike: string) {
    this.info = path.parse(pathLike)
  }

  toString() {
    return path.format(this.info)
  }
}