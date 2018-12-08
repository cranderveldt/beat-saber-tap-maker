export class BeatSong {
  constructor(init = {}) {
    this._version = init._version || "1.0.0"
    this._beatsPerMinute = init._beatsPerMinute || 120
    this._beatsPerBar = init._beatsPerBar || 16
    this._noteJumpSpeed = init._noteJumpSpeed || 10
    this._shuffle = init._shuffle || 0
    this._shufflePeriod = init._shufflePeriod || 0.5
    this._events = init._events || []
    this._notes = init._notes || []
    this._obstacles = init._obstacles || []
  }
}
