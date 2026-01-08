# 🚀 LEVEL UP DOCTRINE
## Otter Planes IO - World Building Masterplan

> *"Make the world so beautiful that players forget they're in a browser."*

---

## 🎯 Vision

Transform the empty grass field into a **living, breathing world** with:
- A fully-featured **airport** as the spawn point
- A vibrant **city** with neighborhoods and downtown
- **Highway systems** with moving traffic
- Natural features: **lakes, mountains, forests**
- Atmospheric elements: **blimps, better clouds, sunrays**

---

## 📦 Phase 1: Airport Complex

### Runway System
- Main runway (2000m × 50m) with:
  - White center line markings
  - Threshold chevrons
  - Distance markers
  - Runway numbers (09/27)
- Parallel taxiways
- Holding points with yellow lines

### Buildings
| Building | Description | Priority |
|----------|-------------|----------|
| Control Tower | Tall glass tower with antenna | HIGH |
| Terminal | Modern glass/steel building | HIGH |
| Hangars | 3-4 large metal structures | MEDIUM |
| Fire Station | Red building with trucks | LOW |

### Props
- Parked planes (static, different colors)
- Ground vehicles (tugs, fuel trucks)
- Windsock
- Runway lights (edge, approach)
- Beacon (rotating green/white)

---

## 🏙️ Phase 2: Urban Environment

### Downtown District (1km from airport)
- **Skyscrapers** (10-30 floors, glass facades)
- **Office buildings** (5-15 floors, varied)
- **Street grid** with traffic lights
- **Central park** with fountain

### Residential Neighborhood
- **Suburban houses** (single/two-story, varied colors)
- **Tree-lined streets**
- **Backyards** with pools, fences
- **Schools** with playgrounds
- **Churches** with steeples

### Commercial Strip
- **Shopping mall** with parking lot
- **Gas stations**
- **Fast food restaurants**
- **Car dealerships**

---

## 🛣️ Phase 3: Highway & Roads

### Highway Network
```
        AIRPORT
           |
    [======|======] Highway 1
           |
      _____|_____
     |           |
   CITY      SUBURBS
```

- **4-lane divided highway** with median
- **On/off ramps** (curved)
- **Overpasses** at intersections
- **Moving traffic** (instanced cars, simple AI)

### Road Types
| Type | Width | Features |
|------|-------|----------|
| Highway | 40m | Barriers, 4 lanes, fast traffic |
| Main Road | 20m | 2 lanes, sidewalks, traffic lights |
| Residential | 10m | Narrow, parked cars, trees |

---

## 🌲 Phase 4: Natural Features

### Terrain Variety
- **Hills** (gentle rolling terrain)
- **Mountains** (distant, low-poly, snowy peaks)
- **Valleys** between hills

### Water
- **Lake** (reflective surface, beach edges)
- **River** (winding, bridges crossing)
- **Ocean** horizon (if flying far enough)

### Vegetation
- **Forests** (dense instanced trees)
- **Farmland** (patchwork fields, barns)
- **Golf course** (green with sand traps)

---

## 🎈 Phase 5: Atmospheric & Floating

### Blimps & Balloons
- **Advertising blimps** (3-4, slow-moving)
  - "OTTER PLANES" branding
  - LED-style display panels
- **Hot air balloons** (colorful, clustered)

### Improved Clouds
- **Layered system**:
  - Low cumulus (fluffy, casting shadows)
  - High cirrus (wispy streaks)
  - Occasional storm clouds (dark, dramatic)
- **Cloud shadows** on ground
- **Fly-through effect** (fog when inside)

### Atmospheric Effects
- **Volumetric fog** at ground level (morning mist)
- **Sun rays** (god rays through clouds)
- **Horizon haze** (distance fade)
- **Day/night cycle** (optional, future)

---

## 🔧 Technical Strategy

### Performance: Instanced Meshes
Everything uses `InstancedMesh` for performance:
```
Buildings: 1 draw call per type
Trees: 1 draw call for all trees
Cars: 1 draw call for all traffic
Clouds: 1 draw call for all puffs
```

### LOD (Level of Detail)
- **Near (< 500m)**: Full detail
- **Medium (500-2000m)**: Simplified geometry
- **Far (> 2000m)**: Billboard sprites

### Chunk System
World divided into **500m × 500m chunks**:
- Only render chunks near player
- Seamless loading/unloading
- Prevents memory explosion

### File Organization
```
src/components/world/
├── Airport/
│   ├── Runway.tsx
│   ├── ControlTower.tsx
│   ├── Terminal.tsx
│   └── Hangars.tsx
├── City/
│   ├── Skyscrapers.tsx
│   ├── Houses.tsx
│   └── Roads.tsx
├── Nature/
│   ├── Mountains.tsx
│   ├── Lake.tsx
│   └── Forests.tsx
├── Atmosphere/
│   ├── ImprovedClouds.tsx
│   ├── Blimps.tsx
│   └── SunRays.tsx
└── WorldManager.tsx
```

---

## 📋 Implementation Order

### Sprint 1: Foundation (This Session)
- [ ] Runway with markings
- [ ] Control tower
- [ ] Basic terminal building
- [ ] Improved clouds
- [ ] 2-3 blimps

### Sprint 2: City Core
- [ ] Downtown skyscrapers
- [ ] Main roads
- [ ] Highway segment
- [ ] Moving cars

### Sprint 3: Residential
- [ ] Suburban houses
- [ ] Neighborhood streets
- [ ] Parks with playgrounds
- [ ] Schools

### Sprint 4: Nature
- [ ] Distant mountains
- [ ] Lake with reflections
- [ ] Dense forest areas
- [ ] Farmland patches

### Sprint 5: Polish
- [ ] Atmospheric effects
- [ ] Cloud shadows
- [ ] Hot air balloons
- [ ] Ground fog

---

## 🎨 Art Direction

### Color Palette
| Element | Colors |
|---------|--------|
| Runway | #333333, #FFFFFF (lines) |
| Buildings | #445566, #667788, #88AACC (glass) |
| Houses | #CC8844, #AA6633, #DDBB99 (varied) |
| Grass | #3D5C3D, #4A6E4A, #2D4A2D |
| Roads | #444444, #FFCC00 (lines) |
| Water | #2288AA, #44AACC |

### Style Guidelines
- **Low-poly aesthetic** (flat shading option)
- **Vibrant, saturated colors** (not realistic gray)
- **Clean, readable from altitude**
- **Consistent scale** (player plane = 1 unit reference)

---

## 🏆 Success Metrics

| Metric | Target |
|--------|--------|
| Visible buildings | 500+ |
| Visible trees | 5000+ |
| FPS @ max detail | 60+ |
| World size | 10km × 10km |
| Unique building types | 20+ |
| Moving vehicles | 100+ |

---

## 💡 Creative Extras

### Easter Eggs
- Giant otter statue in city center
- "Welcome to Otter City" sign on highway
- Tiny UFO occasionally zipping by
- Lighthouse on distant coast

### Interactivity (Future)
- Fly through rings for points
- Land on runway for bonus
- Chase the blimp
- Photo mode scenic spots

---

> **Next Step**: Begin Sprint 1 - Build the airport foundation!
