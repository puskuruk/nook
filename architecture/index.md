# Nook Architecture Documentation

This directory contains architecture diagrams and documentation for the Nook application. The diagrams use Mermaid.js to visually represent different aspects of the application architecture.

## Overview

The Nook application follows the MVVM (Model-View-ViewModel) architecture pattern with Domain-Driven Design principles. The codebase is organized into clear layers with well-defined responsibilities.

## Diagram Index

### Architecture Patterns
- [MVVM Architecture](mvvm-architecture.md) - Overview of the MVVM pattern implementation
- [Component Dependencies](component-dependencies.md) - Component dependency diagram

### User Flows
- [Create Room Flow](create-room-flow.md) - Sequence diagram for room creation
- [Join Room Flow](join-room-flow.md) - Sequence diagram for joining a room
- [Leave Room Flow](leave-room-flow.md) - Sequence diagram for leaving a room
- [Screen Sharing Flow](screen-sharing-flow.md) - Sequence diagram for screen sharing
- [GIF Sharing Flow](gif-sharing-flow.md) - Sequence diagram for GIF sharing

## Viewing the Diagrams

These Mermaid diagrams can be viewed in several ways:

1. **GitHub Markdown rendering** - GitHub automatically renders Mermaid diagrams in markdown files
2. **VS Code** - Install the "Markdown Preview Mermaid Support" extension
3. **Mermaid Live Editor** - Copy the diagram code to https://mermaid.live/
4. **Browser extensions** - Various browser extensions can render Mermaid diagrams

## Architecture Principles

The application architecture follows these principles:

1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Single Responsibility** - Each class has one reason to change
3. **Early Returns** - Methods exit early when validation fails
4. **Explicit Dependencies** - Dependencies are clearly defined
5. **Domain-Driven Design** - Business logic is encapsulated in domain models
6. **MVVM Pattern** - View, ViewModel and Model layers are clearly separated 