# Join Room Flow

This diagram illustrates the sequence of operations when a user joins an existing room.

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
    participant Room as Room
    participant ParticipantObj as Participant

    User->>AppVue: Enter Room ID
    User->>AppVue: Click "Join Room"
    AppVue->>RVM: joinRoom(roomId)
    
    Note over RVM: Check if room ID is provided
    
    RVM->>RS: joinRoom(roomId)
    RS->>ParticipantObj: createNew()
    Note over RS,ParticipantObj: Creates a new participant with random ID
    
    RS->>SR: getStream(roomId)
    SR->>API: GET /stream/{roomId}
    API-->>SR: Return stream data & endpoints
    SR-->>RS: Return stream data
    
    RS->>Room: new Room(roomId, ownerId)
    RS->>Room: addParticipant(participant)
    RS-->>RVM: Return room object
    
    RVM->>RVM: _initializeMedia(false)
    RVM->>MS: getLocalStream()
    MS-->>RVM: Return media stream
    
    RVM->>SR: getStream(roomId)
    SR-->>RVM: Return stream data
    
    RVM->>WHIP: new WHIPClient()
    RVM->>WHIP: start(publishEndpoint, mediaStream)
    WHIP->>API: POST to WHIP endpoint
    API-->>WHIP: Return SDP answer
    WHIP-->>RVM: Return peer connection
    
    RVM->>MS: connectToRemoteStream(viewEndpoint, videoElement)
    MS->>WHEP: new WHEPClient()
    MS->>WHEP: start(viewEndpoint, videoElement)
    WHEP->>API: POST to WHEP endpoint
    API-->>WHEP: Return SDP answer
    WHEP-->>MS: Return peer connection
    MS-->>RVM: Stream connected
    
    RVM->>AppVue: Update isConnected = true
    RVM->>AppVue: Update showOverlay = false
    AppVue-->>User: Joined room successfully
```

The diagram shows:
1. User enters a room ID and initiates joining
2. Input validation
3. Domain object creation for the local participant
4. API interaction to get stream information
5. Room object creation with the participant
6. Media stream initialization
7. WebRTC connection setup for both publishing (WHIP) and viewing (WHEP)
8. UI updates

This flow demonstrates the separation between UI interaction, domain logic, and external services. 