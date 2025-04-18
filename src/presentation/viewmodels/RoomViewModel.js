import { ref, computed, reactive } from 'vue'
import { WHIPClient } from '../../infrastructure/webrtc/WHIPClient'

/**
 * ViewModel for room-related functionality
 */
export class RoomViewModel {
  constructor(roomService, mediaService) {
    // Services
    this.roomService = roomService
    this.mediaService = mediaService

    // Reactive state
    this.isConnected = ref(false)
    this.isCreatingRoom = ref(false)
    this.isJoiningRoom = ref(false)
    this.roomId = ref('')
    this.joinRoomInput = ref('')
    this.showOverlay = ref(true)
    this.error = ref('')
    this.participants = reactive(new Map())
    this.participantGifs = reactive(new Map())

    // Computed properties
    this.participantCount = computed(() => {
      return this.participants.size || 1
    })

    this.currentParticipant = computed(() => {
      return this.roomService.getCurrentParticipant()
    })
  }

  /**
   * Creates a new room
   * @returns {Promise<void>}
   */
  async createRoom() {
    if (this.isCreatingRoom.value) return

    try {
      this.isCreatingRoom.value = true
      this.error.value = ''

      // Create room via service
      const room = await this.roomService.createRoom()
      this.roomId.value = room.id

      // Initialize media
      await this._initializeMedia(true)

      // Update UI state
      this.isConnected.value = true
      this.showOverlay.value = false

      // Copy room ID to clipboard
      if (window?.electron?.writeToClipboard) {
        await window.electron.writeToClipboard(room.id)
      }
    } catch (err) {
      this.error.value = 'Failed to create room'
      console.error(err)
    } finally {
      this.isCreatingRoom.value = false
    }
  }

  /**
   * Joins an existing room
   * @returns {Promise<void>}
   */
  async joinRoom() {
    if (this.isJoiningRoom.value) return

    if (!this.joinRoomInput.value) {
      this.error.value = 'Please enter a room ID'
      return
    }

    try {
      this.isJoiningRoom.value = true
      this.error.value = ''

      // Join room via service
      const room = await this.roomService.joinRoom(this.joinRoomInput.value)
      this.roomId.value = room.id

      // Initialize media
      await this._initializeMedia(false)

      // Update UI state
      this.isConnected.value = true
      this.showOverlay.value = false
    } catch (err) {
      this.error.value = 'Failed to join room'
      console.error(err)
    } finally {
      this.isJoiningRoom.value = false
    }
  }

  /**
   * Leaves the current room
   * @returns {Promise<void>}
   */
  async leaveRoom() {
    try {
      // Clean up media first
      this.mediaService.cleanup()

      // Leave room via service
      await this.roomService.leaveRoom()

      // Reset UI state
      this.participants.clear()
      this.participantGifs.clear()
      this.isConnected.value = false
      this.showOverlay.value = true
      this.roomId.value = ''
      this.joinRoomInput.value = ''
      this.error.value = ''
    } catch (err) {
      console.error('Error leaving room:', err)
    }
  }

  /**
   * Sets a GIF for the current participant
   * @param {string} gifUrl - URL of the GIF to set
   */
  setGif(gifUrl) {
    if (!gifUrl || !this.currentParticipant.value) {
      return
    }

    const participant = this.currentParticipant.value
    participant.setGif(gifUrl)

    // Update local state
    this.participantGifs.set(participant.id, gifUrl)

    // Send to other participants
    this._sendGifUpdate(participant.id, gifUrl)
  }

  /**
   * Initializes media for a room
   * @private
   * @param {boolean} isCreator - Whether this user created the room
   * @returns {Promise<void>}
   */
  async _initializeMedia(isCreator) {
    try {
      // Get local media stream
      const localStream = await this.mediaService.getLocalStream()

      // Set local video element source
      const localVideo = document.querySelector('video.video-element')
      if (localVideo) {
        localVideo.srcObject = localStream
      }

      // Get stream data from the repository
      const streamData = await this.roomService.streamRepository.getStream(this.roomId.value)

      // Initialize WHIP client for publishing
      const whipClient = new WHIPClient()
      this.mediaService.whipClient = whipClient

      // Set up data channel message handler
      whipClient.setOnDataChannelMessage(data => {
        if (data.type === 'gif') {
          this.participantGifs.set(data.sender, data.url)
        }
      })

      // Start WHIP client
      await whipClient.start(streamData.rtcPublishEndpoint, localStream)

      // Store data channel reference
      this.mediaService.dataChannel = whipClient.dataChannel
    } catch (err) {
      console.error('Error initializing media:', err)
      throw new Error('Failed to initialize media')
    }
  }

  /**
   * Sends a GIF update to other participants
   * @private
   * @param {string} senderId - ID of the sender
   * @param {string} gifUrl - URL of the GIF
   */
  _sendGifUpdate(senderId, gifUrl) {
    if (!this.mediaService.dataChannel) {
      return
    }

    const message = {
      type: 'gif',
      sender: senderId,
      url: gifUrl
    }

    try {
      this.mediaService.whipClient.sendMessage(message)
    } catch (err) {
      console.error('Error sending GIF update:', err)
    }
  }
}
