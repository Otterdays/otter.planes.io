# 🗺️ Otter Planes World Map

> The complete cartographic reference for Otter City and surrounding regions.

---

## World Overview

| Property | Value |
|----------|-------|
| **World Size** | 30,000 × 30,000 units |
| **Playable Radius** | ~10,000 units from center |
| **Mountain Border** | r=10,000 to r=13,000 |
| **Coordinate System** | X = East/West, Z = North/South, Y = Altitude |

---

## 🗺️ City Map

```
                         NORTH (-Z)
                            ↑
        ════════════════════════════════════════════
        ║              ⛰️ MOUNTAIN RING ⛰️           ║
        ║  ╔═════════════════════════════════════╗  ║
        ║  ║                                     ║  ║
        ║  ║   📡 RADIO          ⛰️ MT. DORP     ║  ║
        ║  ║   TOWERS            (2000,-1500)    ║  ║
        ║  ║   (-800,-600)       ↑400m height    ║  ║
        ║  ║                                     ║  ║
        ║  ║                                     ║  ║
        ║  ║     ┌─────── AIRPORT ────────┐      ║  ║
        ║  ║     │  ══════════════════════│      ║  ║
        ║  ║     │  ↑ RUNWAY 09/27 (200m) │      ║  ║
        ║  ║     │                        │      ║  ║
 WEST   ║  ║     │ ⛽    🗼    🏢        │     ║  ║   EAST
 (-X) ←─║  ║     │Fuel Tower Terminal     │      ║  ║─→ (+X)
        ║  ║     │        🛖🛖🛖 Hangars │     ║  ║
        ║  ║     └────────────────────────┘      ║  ║
        ║  ║                                     ║  ║
        ║  ║                                     ║  ║
        ║  ║ 🔭 OVERLOOK  🏠 LIGHTHOUSE  🌬️ WIND ║  ║
        ║  ║ (-1200,+1200) (-1500,+1500) (+1000) ║  ║
        ║  ║                                     ║  ║
        ║  ╚═════════════════════════════════════╝  ║
        ║              ⛰️ MOUNTAIN RING ⛰️           ║
        ════════════════════════════════════════════
                            ↓
                         SOUTH (+Z)
```

---

## 📍 Location Registry

### ✈️ Airport District (Origin Area)

| Location | Position (X, Y, Z) | Icon | Description |
|----------|-------------------|------|-------------|
| Main Runway | [0, 0, 0] | ✈️ | 200m × 5m, headings 09/27 |
| Control Tower | [40, 0, -15] | 🗼 | ATC, 35m height, radar |
| Terminal | [40, 0, 20] | 🏢 | Passenger terminal, 3 gates |
| Hangar A | [60, 0, -30] | 🛖 | Aircraft storage |
| Hangar B | [80, 0, -30] | 🛖 | Aircraft storage |
| Hangar C | [100, 0, -30] | 🛖 | Aircraft storage |
| Static Planes | [65-105, 0, -15] | 🛩️ | Parked aircraft display |

### 🏔️ Natural Landmarks

| Location | Position (X, Y, Z) | Icon | Description |
|----------|-------------------|------|-------------|
| MT. DORP | [2000, 0, -1500] | ⛰️ | Main mountain, ~400m, Hollywood sign |
| Scenic Overlook | [-1200, 0, 1200] | 🔭 | Hilltop viewpoint, telescope, bench |
| Mountain Border | r=10,000 | 🏔️ | 168 peaks, 3 concentric rings |

### 🎈 Atmospheric Objects

| Location | Orbit Radius | Icon | Description |
|----------|-------------|------|-------------|
| Blimp "OTTER" | r=300, alt=150 | 🎈 | Red advertising blimp |
| Blimp "PLANES" | r=400, alt=200 | 🎈 | Blue advertising blimp |
| Blimp "FLY!" | r=250, alt=120 | 🎈 | Green advertising blimp |

---

## 🧭 Navigation Reference

### Cardinal Directions
- **North**: -Z direction
- **South**: +Z direction  
- **East**: +X direction
- **West**: -X direction

### Altitude Reference
- **Ground Level**: Y = 0
- **Clouds**: Y = 400-800
- **Blimps**: Y = 120-200
- **Mountain Peaks**: Y = 300-700

### Distance Scale
- 1 unit ≈ 1 meter
- Runway length: 200 units = 200m
- World radius: 10,000 units = 10km

---

## 📊 Zone Classification

### 🟢 Green Zone (Safe)
- Airport complex (r < 500)
- Open meadows
- Low-altitude flight areas

### 🟡 Yellow Zone (Caution)
- Near mountain border (r > 8,000)
- High-altitude areas (Y > 600)
- Blimp orbits

### 🔴 Red Zone (Boundary)
- Beyond mountain ring (r > 10,000)
- Into mountain peaks

---

## 📐 World Boundaries

```
Mountain Border Configuration:
├── Row 1: 48 peaks at r=10,000
├── Row 2: 56 peaks at r=11,500 (offset)
├── Row 3: 64 peaks at r=13,000 (offset)
└── Gap Fillers: 40 random peaks between rows

Peak Heights: 300-800m
Snow Cap: Peaks > 550m or 40% random
```

---

## 🔮 Implemented Structures

### ✅ Completed Additions (2026-01-07)
- [x] Fuel Station (-50, 0, 15) - Refueling facility with pumps and truck
- [x] Weather Station (150, 0, -100) - Observatory with radar dome
- [x] Lighthouse (-1500, 0, 1500) - 60m beacon tower with rotating light
- [x] Wind Farm (1000, 0, 1500) - 7 rotating wind turbines
- [x] Radio Towers (-800, 0, -600) - 3 lattice towers with blinking lights
- [x] Helipad (80, 0, 40) - Landing pad with parked helicopter
- [x] Water Tower (200, 0, 100) - Classic sphere tower with "OTTER CITY"
- [x] Road Network - Connecting all major landmarks
- [x] Crystal Lake (-2500, 2500) - Beach resort with dock, umbrellas, volleyball
- [x] Downtown (3000, -3000) - City skyline with Otter City Tower
- [x] Scenic Overlook (-1200, 1200) - Hilltop viewpoint with telescope and bench

---

*Last Updated: 2026-03-15*
*Cartographer: Antigravity AI*
