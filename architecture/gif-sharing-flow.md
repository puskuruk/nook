# GIF Sharing Flow

This diagram illustrates the flow of selecting and sharing GIFs with other participants.

```mermaid
sequenceDiagram
    actor User
    participant AppVue as App.vue
    participant GifSelector as GifSelector.vue
    participant RVM as RoomViewModel
    participant WHIP as WHIPClient
    participant RemoteUser as Remote User
    participant ParticipantObj as Participant
    User->>AppVue: Click GIF selector
    AppVue->>GifSelector: Open selector
    User->>GifSelector: Select a GIF
    GifSelector->>AppVue: @gif-selected(gifUrl)
    AppVue->>RVM: setGif(gifUrl)
    
    RVM->>ParticipantObj: setGif(gifUrl)
    
    RVM->>RVM: participantGifs.set(participantId, gifUrl)
    
    RVM->>RVM: _sendGifUpdate(participantId, gifUrl)
    RVM->>WHIP: sendMessage(message)
    
    Note over WHIP: Message format: {type: 'gif', sender: id, url: gifUrl}
    WHIP->>RemoteUser: Send via WebRTC data channel
    
    RemoteUser->>RemoteUser: Receive data channel message
    RemoteUser->>RemoteUser: Parse message
    RemoteUser->>RemoteUser: If type=='gif', update participantGifs
    RemoteUser->>RemoteUser: Display GIF over video
```

The diagram shows:
1. User interaction with the GIF selector component
2. How the selected GIF is processed through the view model
3. How the domain model is updated
4. How the GIF information is shared through WebRTC data channels
5. How remote users receive and display the GIF

This flow demonstrates the clean separation between UI components, application logic, and communication infrastructure while using the WebRTC data channel for real-time communication. 