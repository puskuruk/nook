# Nook - Refactored Architecture

This document outlines the refactored architecture of the Nook application, applying MVVM, clean code principles, and Domain-Driven Design.

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```
src/
├── domain/         # Domain models and business logic
├── application/    # Application services and use cases
├── infrastructure/ # External dependencies and implementations
├── presentation/   # UI components and view models
└── App.vue         # Main application component
```

## Domain Layer

Contains pure business logic and domain models that represent core concepts:

- `Room`: Represents a video meeting room
- `Participant`: Represents a user in a video call

These models encapsulate business rules and maintain their own state, independent of UI or infrastructure concerns.

## Application Layer

Coordinates between the domain and infrastructure layers:

- `RoomService`: Handles room creation, joining, and leaving
- `MediaService`: Manages media streams and WebRTC connections

These services implement use cases by orchestrating domain objects and infrastructure services.

## Infrastructure Layer

Handles external dependencies and technical concerns:

- `StreamRepository`: Data access for stream-related operations
- `WHIPClient`: WebRTC HTTP Ingest Protocol client for publishing streams
- `WHEPClient`: WebRTC HTTP Egress Protocol client for consuming streams

## Presentation Layer

Implements the UI using the MVVM pattern:

- `RoomViewModel`: Exposes reactive state and methods for the UI
- Vue components: Bind to view models and render the UI

## Component Integration

Services and view models are instantiated directly in the App.vue component with explicit dependencies:

```javascript
// Create instances with explicit dependencies
const streamRepository = new StreamRepository()
const roomService = new RoomService(streamRepository)
const mediaService = new MediaService()
const roomViewModel = new RoomViewModel(roomService, mediaService)
```

This approach maintains clear dependencies while keeping the implementation simple and straightforward.

## Benefits of the Refactored Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Domain logic is isolated and easier to test
3. **Maintainability**: Changes in one area have minimal impact on others
4. **Scalability**: New features can be added without changing existing code
5. **Simplicity**: Clean and consistent structure makes code easier to understand

## Key Design Principles Applied

1. **Single Responsibility Principle**: Each class has one reason to change
2. **Early Returns**: Methods exit early when validation fails
3. **Explicit Dependencies**: Services declare their dependencies in constructors
4. **Immutability**: Domain entities maintain their internal state
5. **Encapsulation**: Implementation details are hidden behind clear interfaces
6. **MVVM Pattern**: View Models mediate between the View and Model layers 