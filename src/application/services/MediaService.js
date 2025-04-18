import { WHIPClient } from '../../infrastructure/webrtc/WHIPClient'
import { WHEPClient } from '../../infrastructure/webrtc/WHEPClient'

/**
 * Service for managing media streams and WebRTC connections
 */
export class MediaService {
  constructor() {
    this.localStream = null
    this.whipClient = null
    this.whepClient = null
    this.dataChannel = null
    this.isScreenSharing = false
    this.screenShareStream = null
  }

  /**
   * Gets the local video device stream
   * @returns {Promise<MediaStream>} Local media stream
   */
  async getLocalStream() {
    if (this.localStream) {
      return this.localStream
    }

    try {
      const constraints = {
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error('Error getting local stream:', error)
      throw new Error('Failed to access camera and microphone')
    }
  }

  /**
   * Starts screen sharing
   * @returns {Promise<MediaStream>} Screen share stream
   */
  async startScreenSharing() {
    if (this.isScreenSharing) {
      return this.screenShareStream
    }

    try {
      const displayMediaOptions = {
        video: {
          cursor: 'always'
        },
        audio: false
      }

      this.screenShareStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      this.isScreenSharing = true

      // Handle stream ending (user stops sharing)
      this.screenShareStream.getVideoTracks()[0].onended = () => {
        this.stopScreenSharing()
      }

      // Replace video track in WHIP client if active
      if (this.whipClient && this.whipClient.peerConnection) {
        const videoTrack = this.screenShareStream.getVideoTracks()[0]
        const senders = this.whipClient.peerConnection.getSenders()
        const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video')

        if (videoSender) {
          await videoSender.replaceTrack(videoTrack)
        }
      }

      return this.screenShareStream
    } catch (error) {
      console.error('Error starting screen sharing:', error)
      throw new Error('Failed to start screen sharing')
    }
  }

  /**
   * Stops screen sharing
   */
  async stopScreenSharing() {
    if (!this.isScreenSharing || !this.screenShareStream) {
      return
    }

    // Stop all tracks
    this.screenShareStream.getTracks().forEach(track => track.stop())

    // Replace with original video track if WHIP client is active
    if (this.whipClient && this.whipClient.peerConnection && this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        const senders = this.whipClient.peerConnection.getSenders()
        const videoSender = senders.find(sender => sender.track.kind === 'video')

        if (videoSender) {
          await videoSender.replaceTrack(videoTrack)
        }
      }
    }

    this.screenShareStream = null
    this.isScreenSharing = false
  }

  /**
   * Connects to a remote stream
   * @param {string} endpoint - WHEP endpoint URL
   * @param {HTMLVideoElement} videoElement - Video element to attach stream to
   * @returns {Promise<void>}
   */
  async connectToRemoteStream(endpoint, videoElement) {
    if (!endpoint || !videoElement) {
      return
    }

    // Clean up existing WHEP client
    if (this.whepClient) {
      await this.whepClient.stop()
    }

    // Create and start new WHEP client
    this.whepClient = new WHEPClient()
    await this.whepClient.start(endpoint, videoElement)
  }

  /**
   * Cleans up media resources
   */
  cleanup() {
    // Stop screen sharing if active
    if (this.isScreenSharing) {
      this.stopScreenSharing()
    }

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    // Clean up WHIP client
    if (this.whipClient) {
      this.whipClient.stop()
      this.whipClient = null
    }

    // Clean up WHEP client
    if (this.whepClient) {
      this.whepClient.stop()
      this.whepClient = null
    }
  }
}
