# Metro Route Finder

A dynamic, full-stack application built to help users find the shortest, most efficient metro route between any two stations within a given transit network (e.g., Delhi-NCR).

## 🚀 Features
- **Accurate Route Calculation**: Powered by Dijkstra's shortest path algorithm on the backend.
- **Searchable Dropdowns**: Easy-to-use station search implemented via `react-select`.
- **Beautiful UI**: Modern, glass-morphism inspired, completely responsive design.
- **Vertical Route Timeline**: A highly visual, step-by-step schematic showing exact line changes, directions, and transfer stations.

## 📁 Project Structure
The application has been modularized and cleanly separated into frontend and backend workspaces:

### Root Repository
- `package.json` - Root scripts designed to start both workspaces concurrently.

### Client (`/client`)
- **React App** scaffolded via Vite.
- Includes `react-select` for advanced form handling.
- Defines `.config` settings that proxy API backend requests to the server without CORS issues on dev.

### Server (`/server`)
- **Express / Node.js** API.
- `/src/data`: Holds the transit network graph data.
- `/src/utils`: Contains algorithmic logic like Dijkstra's algorithm for route mapping.
- `/src/app.js` & `index.js`: Standard REST endpoint definitions.

### Documentation (`/docs`)
- Dedicated directory outlining requirements (`prd.md`) and global project context (`readme.md`).

## 🛠️ How to run locally
Ensure you are using a modern version of Node.js.

### 1. Installation
Install all root, client, and server dependencies.
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Start servers concurrently
From the root directory, simply run:
```bash
npm run dev
```

This starts the **Backend API** at `http://localhost:3001` and the **Frontend App** at `http://localhost:5173`. Open your web browser to the frontend URL to start finding routes!

## 🧪 Algorithms Used
This project calculates paths using a weighted **Dijkstra's shortest path algorithm**. The edge weights correspond to travel times between connected metro hubs.
