export default class Tempo {
  public inizio: number
  public bpm: number
  public metro: string
  public battito: number

  getXMLReady() {
    return {
      $: {
        Inizio: this.inizio,
        Bpm: this.bpm.toFixed(2),
        Metro: this.metro,
        Battito: this.battito // TODO usually 1, but sometimes 2, 3, 4, translated "beat", not sure what this is
      }
    }    
  }
}