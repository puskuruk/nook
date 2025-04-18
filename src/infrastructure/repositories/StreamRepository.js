/**
 * Repository for stream-related data access
 */
export class StreamRepository {
  constructor(baseUrl = '/stream') {
    this.baseUrl = baseUrl
  }

  /**
   * Creates a new stream
   * @param {string} roomId - Room identifier
   * @returns {Promise<Object>} Stream data including endpoints
   */
  async createStream(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: roomId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create stream')
    }

    return response.json()
  }

  /**
   * Gets stream information
   * @param {string} roomId - Room identifier
   * @returns {Promise<Object>} Stream data including endpoints
   */
  async getStream(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required')
    }

    const response = await fetch(`${this.baseUrl}/${roomId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Room not found')
      }
      throw new Error('Failed to get stream')
    }

    return response.json()
  }

  /**
   * Deletes a stream
   * @param {string} roomId - Room identifier to delete
   * @returns {Promise<Object>} Success status
   */
  async deleteStream(roomId) {
    if (!roomId) {
      throw new Error('Room ID is required')
    }

    const response = await fetch(`${this.baseUrl}/${roomId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete stream')
    }

    return response.json()
  }
}
