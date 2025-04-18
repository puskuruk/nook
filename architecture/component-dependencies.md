# Component Dependencies

This diagram illustrates the dependencies between the main components of the application.

```mermaid
graph TD;
    subgraph "Presentation Layer"
        App["App.vue"]
        RVM["RoomViewModel"]
    end
    
    subgraph "Application Layer"
        RS["RoomService"]
        MS["MediaService"]
    end
    
    subgraph "Infrastructure Layer"
        SR["StreamRepository"]
        WHIP["WHIPClient"]
        WHEP["WHEPClient"]
    end
    
    subgraph "Domain Layer"
        Room["Room"]
        Participant["Participant"]
    end
    
    %% Direct dependencies
    App-->RVM
    RVM-->RS
    RVM-->MS
    MS-->WHIP
    MS-->WHEP
    RS-->SR
    RS-->Room
    RS-->Participant
    
    %% Instantiation flow
    App--"creates"-->SR
    App--"creates"-->RS
    App--"creates"-->MS
    App--"creates"-->RVM
    
    %% Usage relationships
    WHIP-."uses".->Room
    WHEP-."uses".->Room
    
    classDef presentation fill:#f9d5e5,stroke:#333,stroke-width:2px
    classDef application fill:#d3f0ee,stroke:#333,stroke-width:2px
    classDef infrastructure fill:#eeeeee,stroke:#333,stroke-width:2px
    classDef domain fill:#d5f5e3,stroke:#333,stroke-width:2px
    
    class App,RVM presentation
    class RS,MS application
    class SR,WHIP,WHEP infrastructure
    class Room,Participant domain
```

The diagram shows:
- How components are organized into layers
- Direct dependencies between components (solid arrows)
- Instantiation relationships (dashed arrows)
- Usage relationships (dotted arrows)

Each layer is color-coded for clarity:
- Presentation layer (pink)
- Application layer (light blue)
- Infrastructure layer (light gray)
- Domain layer (light green) 