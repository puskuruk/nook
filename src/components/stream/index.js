/**
 * Stream components module
 * Provides WebRTC utilities for the application
 */

import { WHIPClient, WHEPClient } from '../../infrastructure/webrtc'

// Export stream utilities
export const StreamUtils = {
  WHIPClient,
  WHEPClient,
  isWebRTCSupported: () => {
    return typeof RTCPeerConnection !== 'undefined'
  }
} 