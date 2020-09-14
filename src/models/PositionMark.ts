class Color {
  constructor(
    public readonly red: number,
    public readonly green: number,
    public readonly blue: number
  ) {}
}

export abstract class PositionMark {
  public name: string = ""
  public readonly type: number
  public color?: Color

  constructor(
    public readonly start: number,
    public readonly num: number // 0 => A
  ) {}

  getXMLReady(): any {
    const obj = {
      $: {
        Name: this.name,
        Type: this.type,
        Start: this.start,
        Num: this.num
      }
    } as any // TODO not good

    if (this.color) {
      obj.$.Red = this.color.red
      obj.$.Green = this.color.green
      obj.$.Blue = this.color.blue
    }

    return obj
  }
}

export class CueMark extends PositionMark {
  public readonly type = 0
}

export class CueLoopMark extends PositionMark {
  public readonly type = 4

  constructor(start: number, public readonly end: number, num: number) {
    super(start, num)
  }

  getXMLReady() {
    const parent = super.getXMLReady()
    parent.$.End = this.end
    return parent
  }
}