# Screen Sharing Flow

This diagram illustrates how screen sharing is implemented in the application.

```mermaid
sequenceDiagram
    actor User
    participant AppVue as App.vue
    participant MS as MediaService
    participant WHIP as WHIPClient
    participant Browser as Browser API

    User->>AppVue: Click "Share Screen"
    AppVue->>AppVue: toggleScreenSharing()
    AppVue->>MS: startScreenSharing()
    
    MS->>Browser: getDisplayMedia()
    Browser->>User: Show screen selection dialog
    User->>Browser: Select screen to share
    Browser-->>MS: Return screen capture stream
    
    MS->>WHIP: Get video sender
    MS->>WHIP: Replace video track
    
    MS-->>AppVue: Return success
    AppVue->>AppVue: Update isScreenSharing = true
    AppVue-->>User: Show "Stop Sharing" button
    
    Note over User,Browser: User can stop sharing via browser UI
    Browser->>MS: track.onended event
    MS->>MS: stopScreenSharing()
    
    User->>AppVue: Click "Stop Sharing"
    AppVue->>MS: stopScreenSharing()
    
    MS->>Browser: Stop all tracks in screenShareStream
    MS->>WHIP: Get video sender
    MS->>WHIP: Replace with original camera track
    
    MS-->>AppVue: Return success
    AppVue->>AppVue: Update isScreenSharing = false
    AppVue-->>User: Show "Share Screen" button
```

This diagram shows:
1. How the user initiates screen sharing
2. How the browser's screen capture API is used
3. How the WebRTC video track is replaced with the screen capture
4. How stopping screen sharing works (both via app UI and browser UI)
5. How the original video track is restored when sharing ends

The screen sharing feature demonstrates how the application cleanly separates UI concerns from media handling logic. 