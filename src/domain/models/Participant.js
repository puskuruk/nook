/**
 * Participant domain model representing a user in a video call
 */
export class Participant {
  constructor(id, displayName) {
    this.id = id
    this.displayName = displayName || id
    this.isScreenSharing = false
    this.gifUrl = null
    this.connected = false
  }

  setGif(gifUrl) {
    if (!gifUrl) {
      return false
    }

    this.gifUrl = gifUrl
    return true
  }

  setScreenSharing(isSharing) {
    this.isScreenSharing = !!isSharing
    return this.isScreenSharing
  }

  setConnected(status) {
    this.connected = !!status
    return this.connected
  }

  static createNew() {
    const id = `user-${Math.random().toString(36).substring(7)}`
    return new Participant(id)
  }
}
