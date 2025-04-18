import { Room } from '../../domain/models/Room'
import { Participant } from '../../domain/models/Participant'

/**
 * Room service that coordinates between domain model and infrastructure
 */
export class RoomService {
  constructor(streamRepository) {
    this.streamRepository = streamRepository
    this.currentRoom = null
    this.currentParticipant = null
  }

  /**
   * Creates a new room and joins as the owner
   * @returns {Promise<Room>} The created room
   */
  async createRoom() {
    // Create local participant if none exists
    if (!this.currentParticipant) {
      this.currentParticipant = Participant.createNew()
    }

    // Create room domain object
    const room = Room.createNew(this.currentParticipant.id)

    // Add self as first participant
    room.addParticipant(this.currentParticipant)

    // Store room in repository
    await this.streamRepository.createStream(room.id)

    // Save current room reference
    this.currentRoom = room

    return room
  }

  /**
   * Joins an existing room
   * @param {string} roomId - Room identifier to join
   * @returns {Promise<Room>} The joined room
   */
  async joinRoom(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required')
    }

    // Create local participant if none exists
    if (!this.currentParticipant) {
      this.currentParticipant = Participant.createNew()
    }

    // Get room data from repository
    const streamData = await this.streamRepository.getStream(roomId)

    // Create room domain object
    const room = new Room(roomId, streamData.owner)

    // Add self as participant
    room.addParticipant(this.currentParticipant)

    // Save current room reference
    this.currentRoom = room

    return room
  }

  /**
   * Leaves the current room
   * @returns {Promise<boolean>} Success status
   */
  async leaveRoom() {
    if (!this.currentRoom) {
      return false
    }

    // If current user is owner, delete the room
    if (this.currentRoom.isOwner(this.currentParticipant?.id)) {
      await this.streamRepository.deleteStream(this.currentRoom.id)
    }

    // Reset room state
    this.currentRoom = null
    return true
  }

  /**
   * Gets the current room
   * @returns {Room|null} Current room or null
   */
  getCurrentRoom() {
    return this.currentRoom
  }

  /**
   * Gets the current participant
   * @returns {Participant|null} Current participant or null
   */
  getCurrentParticipant() {
    return this.currentParticipant
  }
}
