# Create Room Flow

This diagram illustrates the sequence of operations when a user creates a new room.

```mermaid
sequenceDiagram
    actor User
    participant AppVue as App.vue
    participant RVM as RoomViewModel
    participant RS as RoomService
    participant MS as MediaService
    participant SR as StreamRepository
    participant WHIP as WHIPClient
    participant API as Stream API
    participant Room as Room
    participant ParticipantObj as Participant

    User->>AppVue: Click "Create Room"
    AppVue->>RVM: createRoom()
    
    RVM->>RS: createRoom()
    RS->>ParticipantObj: createNew()
    Note over RS,ParticipantObj: Creates a new participant with random ID
    
    RS->>Room: createNew(participantId)
    Note over RS,Room: Creates a new room with random ID
    
    RS->>SR: createStream(roomId)
    SR->>API: POST /stream {roomName: roomId}
    API-->>SR: Return stream data & endpoints
    SR-->>RS: Return stream data
    RS-->>RVM: Return room object
    
    RVM->>RVM: _initializeMedia(true)
    RVM->>MS: getLocalStream()
    MS-->>RVM: Return media stream
    
    RVM->>SR: getStream(roomId)
    SR-->>RVM: Return stream data
    
    RVM->>WHIP: new WHIPClient()
    RVM->>WHIP: start(endpoint, mediaStream)
    WHIP->>API: POST to WHIP endpoint
    API-->>WHIP: Return SDP answer
    WHIP-->>RVM: Return peer connection
    
    RVM->>AppVue: Update isConnected = true
    RVM->>AppVue: Update showOverlay = false
    
    RVM->>AppVue: writeToClipboard(roomId)
    AppVue-->>User: Room created & ID copied to clipboard
```

The diagram shows:
1. User initiates room creation
2. Domain objects (Room and Participant) are created
3. API interaction to create a stream
4. Media stream initialization
5. WebRTC connection setup with WHIP
6. UI updates and clipboard copying

This flow demonstrates how the application layers interact while maintaining separation of concerns. 