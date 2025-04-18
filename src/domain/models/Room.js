/**
 * Room domain model representing a video meeting room
 */
export class Room {
  constructor(id, owner) {
    this.id = id
    this.owner = owner
    this.participants = new Map()
    this.created = new Date()
  }

  addParticipant(participant) {
    if (!participant || !participant.id) {
      return false
    }

    this.participants.set(participant.id, participant)
    return true
  }

  removeParticipant(participantId) {
    if (!participantId) {
      return false
    }

    return this.participants.delete(participantId)
  }

  getParticipantCount() {
    return this.participants.size
  }

  isOwner(participantId) {
    return this.owner === participantId
  }

  static createNew(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required to create a room')
    }

    const roomId = `room-${Math.random().toString(36).substring(7)}`
    return new Room(roomId, ownerId)
  }
}
