# Sunshade

Interactive event map for the UIC campus. Add, filter, and view events on a Mapbox map. Events can only be created at UIC building locations.

## Features

- **Map** – Mapbox map with event markers; click markers to see details
- **Add events** – Form with UIC building search (name or address); only campus locations allowed
- **Filter events** – By date (All, Today, This week, Next week, This month, Pick a date) and distance
- **Past events** – Separate section listing past events
- **Use my location** – Get your location for distance calculations
- **Edit & delete** – Edit events in a modal; delete with Yes/No confirmation

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Mapbox token:
   - Create `.env.local` in the project root
   - Add: `NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token`

3. Run the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout, metadata, Inter font
│   ├── page.tsx      # Main page: state + component wiring
│   └── globals.css   # Tailwind, Mapbox CSS, design tokens
├── components/
│   ├── HeaderBar.tsx     # App title, token notice
│   ├── EventForm.tsx     # Add-event form + UIC building search
│   ├── EventsMap.tsx     # Mapbox map, markers, search, filter, "Use my location"
│   ├── EventsFilter.tsx  # Date + distance filters (dropdown or inline)
│   ├── EventsList.tsx    # Event cards with distance + edit button
│   └── EventModal.tsx    # Event details modal, edit form, delete with confirmation
└── lib/
    ├── types.ts       # LngLat, MapEvent, FilterMode, etc.
    ├── geo.ts         # Haversine distance (miles)
    ├── geocode.ts     # Mapbox geocoding for UIC buildings
    ├── filters.ts     # Event filtering by date and distance
    └── uicBuildings.ts # UIC campus building list with addresses
```

## Components

| Component | Purpose |
|-----------|---------|
| **HeaderBar** | Top header with app title; shows token setup notice when Mapbox token is missing |
| **EventForm** | Add-event form; location field searches UIC buildings by name or address |
| **EventsMap** | Mapbox map, event markers with popups, search bar, "Use my location", filter dropdown |
| **EventsFilter** | Date filters (All, Today, This week, …) and distance slider |
| **EventsList** | List of event cards with distance from reference point and edit button |
| **EventModal** | View/edit event details; delete with Yes/No confirmation |

## Lib modules

| File | Purpose |
|------|---------|
| **types.ts** | Shared types: `LngLat`, `MapEvent`, `FilterMode`, `PickScope`, etc. |
| **geo.ts** | `haversineMiles(a, b)` – distance between two coordinates in miles |
| **geocode.ts** | `geocodeBuilding()` – Mapbox geocoding for UIC building names/addresses |
| **filters.ts** | `filterEvents()` – filter by date range and distance; `getFilterModeLabel()` |
| **uicBuildings.ts** | UIC building list with full addresses; `searchUicBuildings()`, `isUicBuilding()` |

## Data

- **Events** – Stored in React state only (in-memory). To persist, add a backend (Firebase, API + DB, etc.).
- **UIC buildings** – From UIC FIMWeb Campus Visitor Map; addresses for East Campus (60607), West Campus (60612), Law (60604), and 5525 Pulaski (60632).

## Requirements

- Node.js 18+
- Mapbox account and public token

## Environment

- `NEXT_PUBLIC_MAPBOX_TOKEN` – Mapbox public access token (required for map and geocoding)

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Run production build
