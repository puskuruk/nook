# MVVM Architecture

This diagram illustrates how the Model-View-ViewModel (MVVM) pattern is implemented in the application.

```mermaid
graph TD;
    subgraph "View Layer"
        AppVue["App.vue"]
        GifSelector["GifSelector.vue"]
        style AppVue fill:#f9d5e5,stroke:#333
        style GifSelector fill:#f9d5e5,stroke:#333
    end
    
    subgraph "ViewModel Layer"
        RVM["RoomViewModel"]
        style RVM fill:#d3f0ee,stroke:#333
    end
    
    subgraph "Model Layer"
        subgraph "Domain Layer"
            Room["Room"]
            ParticipantObj["Participant"]
            style Room fill:#d5f5e3,stroke:#333
            style ParticipantObj fill:#d5f5e3,stroke:#333
        end
        
        subgraph "Application Layer"
            RS["RoomService"]
            MS["MediaService"]
            style RS fill:#aec6cf,stroke:#333
            style MS fill:#aec6cf,stroke:#333
        end
        
        subgraph "Infrastructure Layer"
            SR["StreamRepository"]
            WHIP["WHIPClient"]
            WHEP["WHEPClient"]
            style SR fill:#eeeeee,stroke:#333
            style WHIP fill:#eeeeee,stroke:#333
            style WHEP fill:#eeeeee,stroke:#333
        end
    end
    
    %% View to ViewModel connections
    AppVue--"Data Binding"-->RVM
    AppVue--"Events"-->RVM
    GifSelector--"@gif-selected"-->AppVue
    
    %% ViewModel to Model connections
    RVM--"Uses"-->RS
    RVM--"Uses"-->MS
    
    %% Model connections
    RS--"Uses"-->SR
    RS--"Creates/Manages"-->Room
    RS--"Creates/Manages"-->ParticipantObj
    MS--"Uses"-->WHIP
    MS--"Uses"-->WHEP
    
    %% Data flow
    User--"Input"-->AppVue
    RVM--"Reactive State"-->AppVue
    API--"HTTP"-->SR
    RTCServer--"WebRTC"-->WHIP
    RTCServer--"WebRTC"-->WHEP
    
    %% External entities
    User[User]
    API[Stream API]
    RTCServer[WebRTC Server]
    style User fill:#f5f5f5,stroke:#333
    style API fill:#f5f5f5,stroke:#333
    style RTCServer fill:#f5f5f5,stroke:#333
```

## MVVM Pattern Implementation

In this application:

1. **View Layer**
   - Contains UI components (Vue components)
   - Binds to properties exposed by the ViewModel
   - Forwards user actions to the ViewModel
   - Has no knowledge of the Model layer

2. **ViewModel Layer**
   - Exposes data and commands for the View
   - Encapsulates presentation logic
   - Converts Model data to View-friendly format
   - Uses reactive properties (Vue's ref/reactive) for data binding

3. **Model Layer**
   - **Domain**: Pure business logic (Room, Participant)
   - **Application**: Coordinates use cases (Services)
   - **Infrastructure**: External interactions (Repositories, WebRTC clients)

## Data Flow

1. **User Input** → **View** → **ViewModel** → **Model** → External systems
2. **External Data** → **Model** → **ViewModel** → **View** → **User**

This architecture enables:
- Clean separation of concerns
- Testability of each layer in isolation
- Maintainability of the codebase
- Reusability of components 