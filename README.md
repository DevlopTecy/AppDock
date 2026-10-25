# AppDock

> A sleek, high-performance Windows application and URL dock launcher built with React, TypeScript, and Electron.

---

## Overview

**AppDock** is a modern, customizable desktop dock designed for Windows. It provides fast access to your favorite applications, web links, folders, and system tools with smooth animations, screen-edge snapping, auto-hide, category groups, and dynamic widgets.

---

## Key Features

- **Multi-Edge Snapping**: Dock smoothly to the top, bottom, left, or right edges of your display.
- **Auto-Hide & Edge Tabs**: Seamlessly slides off-screen when inactive, leaving subtle edge tabs for instant invocation.
- **Application & URL Launcher**: Pin native executables, shortcuts (`.lnk`), and web URLs with automatic icon/favicon extraction.
- **Quick System Scanner**: Automatically scan Start Menu and Windows directories for installed software.
- **Custom Groups & Tags**: Organize items into categorized groups with custom icons and color tags.
- **Desktop Modules & Widgets**: Built-in modules including live weather, clock, and quick system stats.
- **Theming & Personalization**: Multiple visual themes (including Dark, Glassmorphism, and custom aesthetic themes) with adjustable opacity, blur, and scale.
- **Local-First & Lightweight**: Instant startup, minimal memory footprint, and 100% offline-ready local storage.

---

## Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) (Node.js + Chromium)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Packaging**: [electron-builder](https://www.electron.build/)

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Windows OS**: Windows 10 / 11

### Installation

```bash
# Clone the repository
git clone https://github.com/DevlopTecy/AppDock.git
cd AppDock

# Install dependencies
npm install
```

### Launching the Desktop App

To launch the compiled desktop application directly:
```bash
npm start
# or
npm run electron:start
```

### Development

Run the frontend in Vite dev mode:
```bash
npm run dev
```

Run the complete Electron desktop app with live reload:
```bash
npm run dev:electron
```

### Running Tests

Execute the automated test suite:
```bash
npm test
```

### Building for Production

Compile TypeScript and build the web bundle:
```bash
npm run build
```

Package the native Windows installer (`.exe` NSIS installer):
```bash
npm run dist
```
The resulting executable will be generated inside the `release/` directory.

---

## Project Structure

```
Project 5_AppDock/
├── electron/              # Electron main process, preload scripts, and native bridges
│   ├── main.cjs           # Window management, IPC handlers, tray, shortcuts
│   ├── preload.cjs        # Context bridge exposing secure desktop APIs
│   └── media-helper.ps1   # PowerShell helper scripts for native system queries
├── src/                   # React frontend application
│   ├── components/        # Dock UI, Modals, AppGrid, Settings, and Modules
│   ├── types/             # TypeScript interfaces and state models
│   ├── utils/             # Storage, icon extractors, dock bounds calculations
│   ├── App.tsx            # Root application layout and dock container
│   ├── main.tsx           # React DOM mounting entry point
│   └── index.css          # Theme variables, glass effects, animations
├── tests/                 # Unit and integration test suites
├── build/                 # Production icons and packaging resources
└── public/                # Static assets, themes, and sound clips
```

---

## License

This project is licensed under the [MIT License](LICENSE).
