<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

## 2026-03-19 — Docs, tests, README
- [x] Root `package.json` scripts: `npm test`, `test:watch`, `test:coverage` → client Vitest
- [x] Added `client/src/config/worldLocations.test.ts` (6 cases: bounds, POIs, roads, helpers)
- [x] Reduced Vitest console noise; relaxed micro-benchmark thresholds for CI/slow hosts
- [x] README overhaul + MIT `LICENSE`; `vite.config` coverage includes `src/config/**`
- [x] SUMMARY / SBOM / SCRATCHPAD / CHANGELOG updated

## Active Tasks
- [x] Add GPT Plane (OpenAI-themed AI interceptor, Special category)
- [x] Fix TypeScript build blockers (unused vars, test setup)
- [x] Implement semi-realistic physics with AoA and stall
- [x] Create modular PlaneModel with 3 variants
- [x] Build plane selection UI
- [x] Enhance HUD with throttle, AoA, G-force
- [x] Add Boeing 747 jumbo jet
- [x] Expand map size (3x larger)
- [x] Add mountain with MT. DORP sign
- [x] Improve trees (taller, wider, 3-layer foliage)
- [x] Add mountain border around world edge
- [x] Add atmospheric fog
- [x] Create 8-bit music system
- [x] Improve flight sounds
- [x] Fix cloud appearance (white, fluffy, marshmallow-like)
- [x] Fix grass sliding/motion sickness issue
- [x] Fix trees disappearing at distance
- [x] Create settings system
- [x] Performance optimization (camera smoothing, object pooling, state throttling, FPS counter)
- [x] Fix grass texture shimmer/jerking
- [x] Fix runway z-fighting
- [x] Add blinking navigation lights to biplanes
- [x] Create Sopwith Camel and SPAD XIII biplane models
- [x] Enhance plane selection screen (bigger preview, category tabs)
- [x] Implement Pause Menu (ESC to toggle, Single Player only)
- [x] Add Game Mode selection (Single/Multi) to Lobby
- [ ] Test multiplayer with multiple clients
- [x] Create WORLD_MAP.md documentation
- [x] Add new world structures (Fuel Station, Weather Station, Lighthouse, Wind Farm, Radio Towers, Helipad, Water Tower)
- [x] Create location system (worldLocations.ts) with coordinate registry
- [x] Implement Minimap component (M=fullscreen, U=size cycle)
- [x] Add keybind settings section
- [x] Add road network connecting landmarks
- [x] Engineering Improvements:
  - [x] Create unified KeybindManager system
  - [x] Create shared plane components (Propeller, BlinkingLight, ControlSurface, LandingGear)
  - [x] Create planes types and configuration module
  - [x] Split PlaneModel.tsx into individual model files (11 models!)
  - [x] Create ClaudeModel.tsx (Anthropic AI plane with neural glow!)
  - [x] Create PlaneBuilder page (customize parts, colors, 3D preview)
  - [x] MAJOR PlaneBuilder upgrade: 10 part categories, stats system, save/load, premium UI
  - [x] Implement Structure Instancing for world objects
  - [x] Add LOD (Level of Detail) system for distant structures
  - [x] Create optimization test suite (35+ tests, `npm test` from repo root)
- [x] **PlaneBuilder Feature Enhancements (Session 2026-01-08):**
  - [x] Spinning propeller animation (2-blade and 6-blade turboprop)
  - [x] Undo/Redo system with keyboard shortcuts (Ctrl+Z/Y, 50 step history)
  - [x] Copy to Clipboard button for sharing plane configs
  - [x] FLY THIS button (navigates to plane selection)
  - [x] Part Compatibility warnings (biplane+jets, delta+tail, floats+rocket, etc.)
  - [x] Premium CSS styling for new UI elements

## Blocked Items
_None_

## Recent Context (last 5 actions)
1. Docs/tests/README: root `npm test`, `worldLocations` Vitest, quieter benchmarks, README + LICENSE (2026-03-19)
2. GPT Plane (OpenAI-themed interceptor); HUD nearest POI; Scenic Overlook (-1200, 1200); TS build fixes (2026-03-15)
3. Crystal Lake beach + Downtown skyline + CloudFog fly-through; worldLocations / roads updates
4. Structure instancing + LOD + optimization Vitest suite
5. PlaneBuilder upgrades (undo/redo, clipboard, compatibility warnings)

_See compacted history for older milestones._

## Compacted History
- Initial MVP: Flight physics, multiplayer, basic plane model
- Environment upgrades: Clouds, grass, trees, infinite terrain
- Sound system: Procedural engine audio with throttle response
- **[2025-01-07] Major Update:**
  - Semi-realistic aerodynamics (lift, induced drag, AoA, stall)
  - 3 plane variants (WW2, Jet, Biplane) with different flight characteristics
  - Modern plane selection UI with 3D preview
  - Enhanced HUD with flight instruments
  - Continuous throttle (0-100%) instead of binary
  - Per-plane physics configuration
- **[2026-01-07] World Expansion:**
  - Boeing 747 jumbo jet added (4th plane variant)
  - Map tripled in size (30,000 units)
  - Mountain with MT. DORP Hollywood-style sign
  - Mountain border ring (168 mountains in 3 rows)
  - Improved trees, flowers, grass textures
  - Blimps with advertising banners
  - Airport complex (runway, terminal, tower, hangars)
  - Atmospheric fog for horizon blending (2000-10000 units)
  - 8-bit chiptune ambient music (slow pentatonic melody)
  - Procedural engine and wind sounds (throttle/speed reactive)
  - Fluffy white marshmallow clouds (80 clouds, 400-800 altitude)
  - Fixed grass sliding by making ground static (no more motion sickness)
  - Fixed trees/flowers disappearing with frustumCulled={false}
  - Settings panel with volume, sensitivity, graphics quality controls
- **[2026-01-08] Performance & Visual Polish:**
  - Frame-rate independent camera smoothing (eliminated jerkiness)
  - Object pooling for THREE.Vector3 (reduced GC pressure)
  - Throttled Zustand store updates (30fps state, 20fps HUD/network)
  - FPS counter with ring buffer averaging (respects showFPS setting)
  - Cloud instance matrix optimization (updates every 3rd frame)
  - Network throttling (20 updates/sec instead of 60)
  - Graphics quality presets (Low/Medium/High with shadow/antialias/pixel ratio)
  - Fixed grass texture shimmer (reduced repeat 200→80, added mipmap filtering)
  - Fixed runway z-fighting (raised from 0.01 to 0.08 units)
- **[2026-01-08] Biplane Enhancements:**
  - Added blinking navigation lights system (smooth sine-wave modulation)
  - Created Sopwith Camel model (British WWI, rotary engine, twin Vickers, V-strut gear)
  - Created SPAD XIII model (French WWI, fastest Allied fighter, streamlined design)
  - Enhanced Fokker Dr.I with blinking lights on all wings + tail
  - Physics tuning: Sopwith (agile), SPAD (fastest), Fokker (balanced)
- **[2026-01-08] UI Improvements:**
  - Plane selection preview enlarged (400x300 → 520x400px)
  - Smart plane scaling (Boeing 747: 45%, B-2: 55%, Jets: 85-90%)
  - Category filter tabs (All, WWI, WWII, Jets, Civil, Special)
  - Filtered navigation (arrows cycle through selected category only)
- **[2026-01-08] Otter Mascot Plane:**
  - Funky otter-shaped aircraft with round head, cute ears, whiskers
  - Webbed paw wings with toe pads and fish decorations
  - Animated wagging tail (speed-reactive)
  - Cockpit bubble, blinking nav lights, water splash effect at high throttle
  - New "Special" category in plane selection
- **[2026-01-08] Tung Tung Air (Brain Rot Meme):**
  - Based on "Tung Tung Tung Sahur" viral meme character
  - Cylindrical wooden body with derpy face (googly eyes, eyebrows, smile)
  - Arms as wings with flapping animation, wing membranes for lift
  - Legs dangling below with walking animation
  - THE BAT as a spinning propeller (iconic!)
  - Golden "Tung Tung Air" badges on sides
  - Stats: Speed 77, Agility 69, Durability 100 (nice)