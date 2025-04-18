/**
 * WebRTC HTTP Egress Protocol (WHEP) client for consuming streams
 */
export class WHEPClient {
  constructor() {
    this.peerConnection = null
    this.endpoint = null
    this.videoElement = null
    this.etag = null
  }

  /**
   * Initializes and starts the WHEP client
   * @param {string} endpoint - WHEP server endpoint URL
   * @param {HTMLVideoElement} videoElement - Video element to attach stream to
   * @returns {Promise<RTCPeerConnection>} The peer connection
   */
  async start(endpoint, videoElement) {
    if (!endpoint) {
      throw new Error('WHEP endpoint URL is required')
    }

    if (!videoElement) {
      throw new Error('Video element is required')
    }

    this.endpoint = endpoint
    this.videoElement = videoElement

    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }]
      })

      // Add track handlers for incoming streams
      this.peerConnection.ontrack = event => {
        if (this.videoElement && event.streams && event.streams[0]) {
          this.videoElement.srcObject = event.streams[0]
        }
      }

      // Create and set local description (offer)
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await this.peerConnection.setLocalDescription(offer)

      // Wait for ICE gathering to complete
      await this._waitForIceGatheringComplete()

      // Send offer to WHEP endpoint
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
   * Stops the WHEP client and cleans up resources
   */
  async stop() {
    if (this.peerConnection && this.endpoint && this.etag) {
      try {
        // Send DELETE request to WHEP endpoint
        await fetch(this.endpoint, {
          method: 'DELETE',
          headers: { 'If-Match': this.etag }
        })
      } catch (err) {
        console.error('Error deleting WHEP session:', err)
      }
    }

    // Clear video element
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject
      stream.getTracks().forEach(track => track.stop())
      this.videoElement.srcObject = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Reset state
    this.endpoint = null
    this.etag = null
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
   * Sends the offer to the WHEP endpoint
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
      throw new Error(`WHEP request failed: ${response.status} ${response.statusText}`)
    }

    return response
  }
}
