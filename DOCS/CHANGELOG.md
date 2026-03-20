<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **GPT Plane** (Special category): OpenAI-themed AI interceptor with glowing token ring cockpit, emerald circuits, twin engines. Stats: Speed 92, Agility 84, Durability 82.
- **HUD Nearest POI Indicator**: Shows distance and bearing to closest landmark (e.g. "MT. DORP 2.3km NE"). Throttled updates for performance.
- **Scenic Overlook** (position: -1200, 0, 1200): Hilltop viewpoint with wooden platform, railing, bench, and telescope. Road connection from airport.
- **Testing:** `client/src/config/worldLocations.test.ts` — bounds, unique POI ids, road segment shape, registry helpers
- **Tooling:** Root `package.json` with `npm test` / `test:watch` / `test:coverage` delegating to client Vitest
- **License:** MIT `LICENSE` at repository root (matches README badge)
- **Crystal Lake & Beach Resort** (position: -2500, 2500):
  - Natural organic-shaped lake with reflective water
  - Sandy beach surrounding the lake
  - Beach umbrellas (5) and towels (3)
  - Wooden dock/pier with small boat
  - Palm trees (5) around the beach
  - Lifeguard tower with orange cabin
  - Beach chairs with metal legs
  - Beach volleyball court with net
  - Floating buoys in water (red/orange)
  - Shallow water edge with lighter blue
- **Downtown City District** (position: 3000, -3000):
  - ~50 procedurally generated skyscrapers
  - Otter City Tower - 310m iconic landmark with spire
  - Central park plaza with fountain
  - Park trees (8) around plaza
  - Park benches (4) 
  - Main street grid with crosswalks
  - Street lights along roads
  - Parked cars (6) on streets
  - Glass facade buildings with window reflections
  - Rooftop antennas with blinking aviation lights
- **Cloud Fly-Through Effect**:
  - Immersive fog when flying through cloud layer (350-850 altitude)
  - Gradual fog density increase toward cloud core
  - White-out effect at maximum density
  - Smooth transitions entering/exiting clouds

### Changed
- **TypeScript Build**: Fixed unused variable/import errors (OtherPlane, Plane, Roads, gameStore, LOD.test, StructureInstancing.test). Fixed test setup `this` typing for getContext mock.
- **Vitest:** Quieter default output (removed informational `console.log` from optimization tests); micro-benchmark time budgets widened slightly for shared runners
- **Docs:** `DOCS/SUMMARY.md`, `DOCS/SBOM.md`, `DOCS/SCRATCHPAD.md` — status, SBOM test deps, session log
- **README:** GitHub-oriented layout (quick start, tests, correct clone URL, project doc links)
- **Grass Texture Upgrade**: Real seamless grass texture from Three.js examples (150×150 repeat)
- **Mipmap Filtering**: LinearMipMapNearestFilter eliminates texture flickering at low altitude
- **Camera**: Added near plane (1 unit) and snap threshold for stable rendering
- **World Locations**: Added Crystal Lake and Downtown POIs to registry
- **Road Network**: Added roads connecting to Lake and Downtown

## [0.5.1] - 2026-01-08
### Added
- **Ultimate Plane Builder System**:
  - 10 part categories with 60+ total parts:
    - **Fuselage** (6): Standard, Sleek, Heavy, Compact, Aerobatic, Cargo
    - **Wings** (6): Straight, Swept, Delta, Biplane, Forward-Swept, Variable
    - **Tail** (6): Standard, Twin, V-Tail, Flying Wing, T-Tail, Cruciform
    - **Engine** (6): Propeller, Jet, Twin-Jet, Rocket, Turboprop, Quad-Jet
    - **Nose** (6): Rounded, Pointed, Flat, Radar Dome, Glass, Shark Mouth
    - **Wingtips** (6): Standard, Winglets, Raked, Fuel Tanks, Missiles, Lights
    - **Landing Gear** (6): Retractable, Fixed, Floats, Skids, Tricycle, Taildragger
    - **Cockpit** (6): Bubble, Enclosed, Tandem, Side-by-Side, Fighter, Bomber
    - **Decals** (7): None, Stripes, Flames, Camo, Racing, Military, Custom
    - **Accessories** (6): None, Antenna, Pitot Tube, Exhaust, Vortex Gen, Intakes
  - **Real-time Stats System**: Speed, Agility, Durability bars (0-100) calculated from all parts
  - **Tab-based Navigation**: Structure, Aerodynamics, Powerplant, Details, Colors, Saved
  - **Save/Load System**: localStorage persistence for custom plane designs
  - **16 Color Presets**: Classic Red, Stealth, Sky Blue, Sunset, Forest, Ocean, Coral, Retro, Midnight, Arctic, Gold, Military, Racing, Purple Haze, Vaporwave, Cyberpunk
  - **Randomize Button**: Generate random builds for inspiration
  - **Premium UI**: JetBrains Mono font, animated glow effects, glassmorphism, responsive grid
  - **Enhanced 3D Preview**: Live rendering with all parts, proper materials, environment lighting, auto-rotate camera

### Changed
- **Plane Builder**: Complete redesign from basic 4-part system to comprehensive 10-category customization
- **UI/UX**: Modern tab interface replacing single-scroll panel, improved visual hierarchy

## [0.5.0] - 2026-01-07
### Added
- **World Expansion - New Structures**:
  - Fuel Station: Refueling facility with pumps, office, and fuel truck
  - Weather Station: Observatory dome with radar, anemometer, solar panels
  - Lighthouse: 60m red/white striped tower with rotating beacon light
  - Wind Farm: 7 rotating wind turbines with maintenance building
  - Radio Towers: 3 lattice communication towers with blinking warning lights
  - Helipad: Landing pad with H marking, lights, parked helicopter, wind sock
  - Water Tower: Classic spherical tower with "OTTER CITY" branding
- **Road Network**: Asphalt roads with lane markings connecting all landmarks
  - Main ring road around airport
  - Highways to Wind Farm, Lighthouse, Mountain, Radio Towers
  - Scenic loop roads along eastern and western perimeter
  - Airport internal taxiways and access roads
- **Minimap System**:
  - Corner minimap display (top-right)
  - 3 size modes: Small (150px), Medium (250px), Large (400px)
  - Fullscreen map overlay with legend
  - Player arrow indicator (rotates with heading)
  - POI markers for all structures
  - Mountain border ring visualization
  - Glassmorphism styling with smooth transitions
- **Keybinds**:
  - `M` key: Toggle fullscreen map
  - `U` key: Cycle minimap size (Small → Medium → Large → Small)
- **Location System**: Central registry (`worldLocations.ts`) with all POI coordinates
- **World Documentation**: Comprehensive `WORLD_MAP.md` with ASCII map, coordinate registry

### Changed
- **Settings Panel**: Added Keybinds section showing Flight Controls and UI Controls
- **WorldManager**: Reorganized into logical groups (airport, infrastructure, landmarks, nature)

### Engineering Improvements
- **Unified KeybindManager** (`systems/KeybindManager.ts`):
  - Centralized keybind handling with singleton manager
  - React hooks: `useKeybindAction()`, `useKeybindDisplay()`, `useKeybind()`
  - LocalStorage persistence for custom keybinds
  - Auto-initialization on app start
- **Modular Plane Components** (`components/planes/`):
  - Shared components: `Propeller`, `BlinkingLight`, `ControlSurface`, `LandingGear`
  - Centralized types: `PlaneVariant`, `PlaneColors`, `ControlInputs`
  - Barrel exports via `index.ts`
  - Prepares for future splitting of 2000-line PlaneModel.tsx

## [0.4.0] - 2026-01-08
### Added
- **Performance Optimizations**:
  - Frame-rate independent camera smoothing (exponential decay formula)
  - Object pooling for THREE.Vector3 objects (eliminated allocations in hot paths)
  - Throttled Zustand store updates (30fps for state, 20fps for HUD/network)
  - FPS counter component with ring buffer averaging (last 60 frames)
  - Cloud instance matrix optimization (updates every 3rd frame instead of every frame)
  - Network update throttling (20 packets/sec instead of 60)
- **Graphics Quality System**: Low/Medium/High presets with shadow map size, antialiasing, pixel ratio controls
- **New Biplane Models**:
  - Sopwith Camel (British WWI): Rotary engine, twin Vickers guns, distinctive hump, V-strut landing gear
  - SPAD XIII (French WWI): Fastest Allied fighter, streamlined design, Hispano-Suiza engine, I-strut design
- **Blinking Navigation Lights**: Smooth sine-wave modulated lights on all biplane wingtips and tails
- **Plane Selection Enhancements**:
  - Category filter tabs (All, WWI, WWII, Jets, Civil)
  - Enlarged preview window (520x400px)
  - Smart plane scaling for large aircraft (Boeing 747: 45%, B-2: 55%)

### Changed
- **Camera System**: Delta-time independent smoothing eliminates jerkiness at variable framerates
- **Physics Updates**: Reduced React re-renders from 180+/sec to ~50/sec
- **Grass Texture**: Reduced repeat from 200 to 80, added explicit mipmap filtering
- **Runway Height**: Raised from 0.01 to 0.08 units to prevent z-fighting with terrain
- **Plane Selection**: Navigation arrows now cycle through filtered category only

### Fixed
- **Camera Jerkiness**: Frame-rate independent lerping ensures smooth movement at any FPS
- **Grass Shimmer**: Reduced texture repeat and added proper mipmap filtering
- **Runway Visual Bugs**: Fixed z-fighting by raising runway above ground plane
- **GC Pressure**: Object pooling eliminates per-frame allocations
- **GPU Uploads**: Cloud matrices update 3x less frequently (every 3rd frame)

## [0.3.0] - 2026-01-07
### Added
- **Boeing 747**: New flyable jumbo jet with 4 engines, realistic size, slower/heavier flight model
- **Mountain with MT. DORP Sign**: Snowy mountain peak with Hollywood-style letter sign
- **Mountain Border**: Ring of 168 procedural mountains around map edge as natural boundary
- **Atmospheric Fog**: Smooth horizon blending with blue-grey fog gradient (2000-10000 units)
- **8-bit Chiptune Music**: Slow, peaceful procedural background music
  - Pentatonic scale melody with square waves
  - Bass line with triangle waves
  - Starts on first click
- **Improved Flight Sounds**:
  - Engine sound reacts to throttle (pitch and volume)
  - Wind sound reacts to speed
- **Blimps**: 3 orbiting advertising blimps in the sky
- **Airport Complex**: Runway, terminal building, control tower, hangars
- **Settings Panel**: Accessible from main menu
  - Audio controls (music volume, SFX volume)
  - Controls settings (mouse sensitivity, invert Y-axis)
  - Graphics options (quality presets, show FPS)
  - Settings persist to localStorage

### Changed
- **Map Size**: Tripled from 10,000 to 30,000 units
- **Trees**: 3x taller, 2x wider, 3-layer foliage system
- **Flowers**: 4 types (red, yellow, blue, white) with varied geometries
- **Grass Texture**: Blade stroke pattern instead of circles, much brighter
- **Clouds**: Complete rebuild - white fluffy marshmallows at 400-800 altitude
  - 80 clouds with 12-27 puffs each
  - Emissive glow to ensure visibility
  - Gentle bobbing animation
- **Lighting**: Brighter ambient (0.8), stronger sun (1.5), better fill lights
- **Camera Far Plane**: Extended to 8000 for larger map visibility
- **Ground Terrain**: Now completely static (no more sliding/motion sickness)

### Fixed
- **Instanced Mesh Errors**: Fixed matrix initialization in Trees, Grass, Flowers, Runway
- **Grid Pattern**: Removed visible grid lines from terrain
- **Grass Jitter**: Fixed per-frame random rotation causing visual noise
- **Grass Sliding**: Made ground completely static - removed camera-following logic
- **Trees Disappearing**: Added frustumCulled={false} to all instanced meshes
- **3D Grass Motion Sickness**: Disabled 3D grass blades, using ground texture only

## [0.2.0] - 2025-01-07
### Added
- **Semi-realistic Aerodynamics**: Lift, induced drag, angle of attack, stall mechanics
- **3 Plane Variants**: WW2 (P-51), Jet (F-22), Biplane (Fokker Dr.I)
- **Plane Selection UI**: 3D preview, stats bars, variant cycling
- **Enhanced HUD**: Throttle gauge, AoA indicator, G-force meter, stall warning
- **Animated Control Surfaces**: Ailerons, elevators, rudders respond to inputs

### Changed
- **Throttle System**: Continuous 0-100% instead of binary on/off
- **Per-plane Physics**: Each variant has unique flight characteristics

## [0.1.0] - 2025-01-27
### Added
- **Sound System**: Procedural audio engine using Web Audio API
  - Engine noise with dynamic throttle response
  - Wind noise that increases with speed
- **Infinite Vegetation**: Trees, Grass, Flowers, Weeds around player
- **Scientific Cloud System**: 4 distinct cloud types
- **Initial release**: Flight Simulator MVP with Multiplayer, HUD, and Procedural Plane

### Fixed
- Ground "shiny" look removed
- "Trippy" sliding ground effect fixed
- Disappearing objects after 1000 units fixed
- Flight physics rewritten with Quaternions
