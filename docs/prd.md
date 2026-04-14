# Product Requirements Document (PRD)

## 1. Product Overview

**Name**: Metro Route Finder
**Description**: A full-stack web application designed to help commuters find the shortest, most efficient metro route between any two stations within the Delhi-NCR transit network.

## 2. Objectives

- Provide users with an instantaneous and accurate route calculation.
- Display the total estimated travel time and total number of stops.
- Visually represent the journey, clearly indicating line transfers, platform direction, and stations.
- Offer a modern, beautiful, and accessible user interface inspired by actual transit schematics.

## 3. Target Audience

- Daily commuters and tourists navigating the metro system who need quick, reliable directions without complex navigation steps.

## 4. Key Features & Requirements

### 4.1 Search Interface

- **Station Selection**: Searchable dropdown menus (via `react-select`) for both "From Station" and "To Station".
- **Validation**: The system must prevent users from selecting the same station for both origin and destination.
- **Action**: A primary call-to-action button to trigger the search query.

### 4.2 Route Calculation Engine (Backend)

- **Algorithm**: Implement Dijkstra's algorithm to compute the shortest weighted path.
- **Weights**: Edge weights should represent the time duration between contiguous stations.
- **Data Model**: A graph-based representation mapping stations, lines, and traversal times.

### 4.3 Journey Details

- Metrics block showing **Total Time** (mins) and **Total Stops**.
- Text-based step-by-step instructions listing line changes and stop counts.

### 4.4 Vertical Route Timeline

- A vertical timeline visualization of the journey.
- Line segments colored dynamically depending on the current line.
- A descriptive sidebar per segment that indicates the line direction (e.g., "Towards Dilshad Garden").

## 5. Technical Architecture

- **Frontend**: React.js (via Vite) with standard CSS modules.
- **Backend**: Node.js & Express.js.
- **Integration**: REST API (`/api/stations`, `/api/route`).
- **Data**: Static JSON/JS objects representing the transit graph.

## 6. Future Scope

- Live train timings integration.
- Fare calculation based on entry/exit stations.
- Mobile application wrapping.
