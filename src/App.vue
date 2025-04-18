<script setup>
import './polyfills'
import './reset.css'
import './index.css'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import GifSelector from './components/GifSelector.vue'

// Import services and viewmodels directly
import { StreamRepository } from './infrastructure/repositories/StreamRepository'
import { RoomService } from './application/services/RoomService'
import { MediaService } from './application/services/MediaService'
import { RoomViewModel } from './presentation/viewmodels/RoomViewModel'

// Create instances directly
const streamRepository = new StreamRepository()
const roomService = new RoomService(streamRepository)
const mediaService = new MediaService()
const roomViewModel = new RoomViewModel(roomService, mediaService)

// Local refs
const localVideo = ref(null)
const remoteVideo = ref(null)
const wrapper = ref(null)
const isScreenSharing = ref(false)

// Destructure reactive properties from the view model
const { 
  isConnected,
  isCreatingRoom,
  isJoiningRoom,
  roomId,
  joinRoomInput,
  showOverlay,
  error,
  participants,
  participantGifs,
  participantCount
} = roomViewModel

// Window control functions
function startDrag() {
  if (window?.electron?.startDrag) {
    window.electron.startDrag()
  }
}

function stopDrag() {
  if (window?.electron?.stopDrag) {
    window.electron.stopDrag()
  }
}

// Update aspect ratio when participant count changes
watch(participantCount, count => {
  updateAspectRatio(count)
})

async function updateAspectRatio(count) {
  if (window?.electron?.setAspectRatio) {
    await window.electron.setAspectRatio(Math.max(count, 2))
  }
}

// GIF selection
function handleGifSelected(gifUrl) {
  roomViewModel.setGif(gifUrl)
}

// Screen sharing toggle
async function toggleScreenSharing() {
  if (isScreenSharing.value) {
    stopScreenSharing()
  } else {
    startScreenSharing()
  }
}

async function startScreenSharing() {
  try {
    await mediaService.startScreenSharing()
    isScreenSharing.value = true
  } catch (err) {
    console.error('Error starting screen sharing:', err)
  }
}

async function stopScreenSharing() {
  try {
    await mediaService.stopScreenSharing()
    isScreenSharing.value = false
  } catch (err) {
    console.error('Error stopping screen sharing:', err)
  }
}

// Set initial aspect ratio when component mounts
onMounted(() => {
  updateAspectRatio(2)
})

// Clean up when component unmounts
onUnmounted(() => {
  if (isConnected.value) {
    roomViewModel.leaveRoom()
  }
})
</script>

<template>
  <div class="app-container" ref="wrapper">
    <div class="title-bar" @mousedown="startDrag" @mouseup="stopDrag">
      <div class="title">Nook</div>
    </div>

    <!-- Room creation/join overlay -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h1>Welcome to Nook</h1>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <div class="action-buttons">
          <button 
            @click="roomViewModel.createRoom()" 
            :disabled="isCreatingRoom" 
            class="primary-button"
          >
            {{ isCreatingRoom ? 'Creating...' : 'Create Room' }}
          </button>
          
          <div class="or-divider">or</div>
          
          <div class="join-room-form">
            <input 
              v-model="joinRoomInput" 
              placeholder="Enter room ID" 
              class="room-input"
            />
            <button 
              @click="roomViewModel.joinRoom()" 
              :disabled="isJoiningRoom" 
              class="secondary-button"
            >
              {{ isJoiningRoom ? 'Joining...' : 'Join Room' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main app when connected -->
    <div v-else class="video-container">
      <!-- Local video -->
      <div class="avatar-container local">
        <video ref="localVideo" autoplay playsinline muted class="video-element"></video>
        <img v-if="participantGifs.get(roomViewModel.currentParticipant?.id)" 
             :src="participantGifs.get(roomViewModel.currentParticipant?.id)" 
             class="avatar-gif" />
      </div>
      
      <!-- Remote participants -->
      <div v-for="[id, participant] in participants" :key="id" class="avatar-container remote">
        <video :id="`video-${id}`" autoplay playsinline class="video-element"></video>
        <img v-if="participantGifs.get(id)" :src="participantGifs.get(id)" class="avatar-gif" />
      </div>
      
      <!-- Controls -->
      <div class="controls">
        <button @click="toggleScreenSharing" class="control-button">
          {{ isScreenSharing ? 'Stop Sharing' : 'Share Screen' }}
        </button>
        
        <GifSelector @gif-selected="handleGifSelected" />
        
        <button @click="roomViewModel.leaveRoom()" class="control-button leave-button">
          Leave
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  overflow: hidden;
}

.title-bar {
  height: 30px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  padding: 0 12px;
  -webkit-app-region: drag;
}

.title {
  color: white;
  font-size: 14px;
}

.overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.overlay-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.error-message {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.or-divider {
  color: white;
  margin: 8px 0;
}

.join-room-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-input {
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
}

.primary-button, .secondary-button {
  padding: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background: #4CAF50;
  color: white;
}

.secondary-button {
  background: #2196F3;
  color: white;
}

.video-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px;
  flex: 1;
  position: relative;
}

.avatar-container {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-container.local {
  width: 200px;
  height: 200px;
  z-index: 1;
}

.avatar-container.remote {
  width: 200px;
  height: 200px;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-gif {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80%;
  max-height: 80%;
  z-index: 2;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 5;
}

.control-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.leave-button {
  background: #f44336;
}
</style>
