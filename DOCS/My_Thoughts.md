# Development Thoughts

## [2025-01-07] - Physics & Plane Variant Upgrade

### Current Understanding
User requested semi-realistic physics with forgiving stall behavior, plus 3 plane variants (WW2, Jet, Biplane) with a nice selection UI.

### Options Considered

**Physics Model:**
- **Option A: Simple Linear (previous)**
  - Lift = speed × coefficient
  - Pros: Easy to implement, very forgiving
  - Cons: Unrealistic, no skill ceiling, planes feel identical

- **Option B: Full Simulation**
  - CFD-style calculations, complex stall curves
  - Pros: Highly realistic
  - Cons: Hard to tune, frustrating for casual players

- **Option C: Semi-Realistic (chosen)**
  - Proper lift equation: L = 0.5 ρV²SCl
  - Induced drag based on aspect ratio
  - Soft stall with forgiving recovery
  - Pros: Authentic feel, tunable per-plane, accessible
  - Cons: More complex code, needs balancing

### Decision & Rationale
Chose **Option C** because:
1. Distinguishes plane variants meaningfully (mass, wing area, thrust affect handling)
2. Creates skill ceiling without frustrating new players
3. Stall is forgiving (soft nose-drop, no spin entry)
4. All constants are configurable data, not hardcoded

### Plane Variant Philosophy
- **WW2 (P-51)**: All-rounder, balanced stats
- **Jet (F-22)**: High speed/thrust but heavy, less agile
- **Biplane (Fokker)**: Slow but extremely maneuverable

### UI/UX Decisions
- 3D rotating preview lets players see the plane they're choosing
- Stats bars provide quick comparison (Speed/Agility/Durability)
- Keyboard shortcuts (← → Enter) for fast navigation
- Glassmorphic style matches "premium game" aesthetic

### Future Considerations
- Add more plane variants (helicopter, cargo plane, etc.)
- Damage model and health system
- Weapon systems (guns, missiles)
- Objectives and game modes
- Minimap and navigation aids

---

## [2025-01-27] - Environment & Model Upgrades

### Current Understanding
The user wanted a more immersive and "pretty" world. Upgraded the plane to a WW2 style and added grass, trees, and clouds.

### Options Considered
- **Option A: Static Meshes** — High detail but terrible performance
- **Option B: Instanced Rendering (chosen)** — High performance for 10,000+ objects

### Decision & Rationale
Used **InstancedMesh** for grass, trees, clouds. Maintains high frame rates with dense vegetation.

---

## [Initial] - Architecture Decisions

### Physics Engine
Custom physics chosen over Cannon.js for arcade feel and easier tuning.

### 3D Framework
React Three Fiber for declarative 3D, easier to iterate with AI assistance.

### State Management
Zustand for simplicity and minimal boilerplate.
