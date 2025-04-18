/**
 * WebRTC HTTP Ingest Protocol (WHIP) client for publishing streams
 */
export class WHIPClient {
  constructor() {
    this.peerConnection = null
    this.endpoint = null
    this.etag = null
    this.mediaStream = null
    this.dataChannel = null
    this._onDataChannelMessage = null
  }

  /**
   * Sets callback for data channel messages
   * @param {Function} callback - Function to call when messages arrive
   */
  setOnDataChannelMessage(callback) {
    this._onDataChannelMessage = callback
  }

  /**
   * Initializes and starts the WHIP client
   * @param {string} endpoint - WHIP server endpoint URL
   * @param {MediaStream} mediaStream - Media stream to publish
   * @returns {Promise<RTCPeerConnection>} The peer connection
   */
  async start(endpoint, mediaStream) {
    if (!endpoint) {
      throw new Error('WHIP endpoint URL is required')
    }

    if (!mediaStream) {
      throw new Error('Media stream is required')
    }

    this.endpoint = endpoint
    this.mediaStream = mediaStream

    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }]
      })

      // Add all tracks from the media stream
      this.mediaStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.mediaStream)
      })

      // Create data channel
      this.dataChannel = this.peerConnection.createDataChannel('nook-data-channel', {
        ordered: true
      })

      this._setupDataChannel()

      // Create and set local description
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)

      // Wait for ICE gathering to complete
      await this._waitForIceGatheringComplete()

      // Send offer to WHIP endpoint
      const response = await this._sendOffer()

      // Set remote description from response
      const sdp = await response.text()
      await this.peerConnection.setRemoteDescription({ type: 'answer', sdp })

      // Store ETag for later deletion
      this.etag = response.headers.get('ETag')

      return this.peerConnection
    } catch (err) {
      this.stop()
      throw err
    }
  }

  /**
   * Stops the WHIP client and cleans up resources
   */
  async stop() {
    if (this.peerConnection && this.endpoint && this.etag) {
      try {
        // Send DELETE request to WHIP endpoint
        await fetch(this.endpoint, {
          method: 'DELETE',
          headers: { 'If-Match': this.etag }
        })
      } catch (err) {
        console.error('Error deleting WHIP session:', err)
      }
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Reset state
    this.endpoint = null
    this.etag = null
    this.dataChannel = null
  }

  /**
   * Sends a message through the data channel
   * @param {Object} data - Data to send
   * @returns {boolean} Success status
   */
  sendMessage(data) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false
    }

    try {
      this.dataChannel.send(JSON.stringify(data))
      return true
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }

  /**
   * Sets up the data channel event handlers
   * @private
   */
  _setupDataChannel() {
    if (!this.dataChannel) return

    this.dataChannel.onopen = () => {
      console.log('Data channel opened')
    }

    this.dataChannel.onclose = () => {
      console.log('Data channel closed')
    }

    this.dataChannel.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        if (this._onDataChannelMessage) {
          this._onDataChannelMessage(data)
        }
      } catch (err) {
        console.error('Error handling data channel message:', err)
      }
    }
  }

  /**
   * Waits for ICE gathering to complete
   * @private
   * @returns {Promise<void>} Promise that resolves when ICE gathering is complete
   */
  _waitForIceGatheringComplete() {
    return new Promise(resolve => {
      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve()
        return
      }

      const checkState = () => {
        if (this.peerConnection.iceGatheringState === 'complete') {
          this.peerConnection.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }
      }

      this.peerConnection.addEventListener('icegatheringstatechange', checkState)

      // Set a timeout just in case
      setTimeout(resolve, 5000)
    })
  }

  /**
   * Sends the offer to the WHIP endpoint
   * @private
   * @returns {Promise<Response>} Fetch response
   */
  async _sendOffer() {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        Accept: 'application/sdp'
      },
      body: this.peerConnection.localDescription.sdp
    })

    if (!response.ok) {
      throw new Error(`WHIP request failed: ${response.status} ${response.statusText}`)
    }

    return response
  }
}
