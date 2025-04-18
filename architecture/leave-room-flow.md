# Leave Room Flow

This diagram illustrates the sequence of operations when a user leaves a room.

```mermaid
sequenceDiagram
    actor User
    participant AppVue as App.vue
    participant RVM as RoomViewModel
    participant RS as RoomService
    participant MS as MediaService
    participant SR as StreamRepository
    participant WHIP as WHIPClient
    participant WHEP as WHEPClient
    participant API as Stream API

    User->>AppVue: Click "Leave" button
    AppVue->>RVM: leaveRoom()
    
    RVM->>MS: cleanup()
    
    MS->>MS: stopScreenSharing()
    
    MS->>MS: Stop all localStream tracks
    
    MS->>MS: Close dataChannel
    
    MS->>WHIP: stop()
    WHIP->>API: DELETE to WHIP endpoint with ETag
    WHIP->>WHIP: Close peer connection
    
    MS->>WHEP: stop()
    WHEP->>API: DELETE to WHEP endpoint with ETag
    WHEP->>WHEP: Close peer connection
    
    RVM->>RS: leaveRoom()
    
    Note over RS: Check if current user is room owner
    RS->>SR: deleteStream(roomId)
    SR->>API: DELETE /stream/{roomId}
    API-->>SR: Return success
    SR-->>RS: Return success
    
    RS->>RS: currentRoom = null
    RS-->>RVM: Return success
    
    RVM->>RVM: Clear participants Map
    RVM->>RVM: Clear participantGifs Map
    RVM->>RVM: isConnected = false
    RVM->>RVM: showOverlay = true
    RVM->>RVM: Reset input fields and error
    
    RVM-->>AppVue: State updated
    AppVue-->>User: Show room creation/join overlay
```

The diagram shows:
1. User initiates leaving a room
2. Media resources cleanup (streams, WebRTC connections)
3. Domain layer handling of leaving the room
4. API interaction to delete the stream if the user is the owner
5. UI state reset
6. Application returns to initial state

This flow demonstrates clean resource management and proper cleanup when a user leaves the room, preventing memory leaks and ensuring streams are properly terminated. 