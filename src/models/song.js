export class BeatSong {
  constructor() {
    this._version = "1.0.0"
    this._beatsPerMinute = 120
    this._beatsPerBar = 16
    this._noteJumpSpeed = 0
    this._shuffle = 0
    this._shufflePeriod = 0
    this._events = []
    this._notes = []
    this._obstacles = []
  }
}
