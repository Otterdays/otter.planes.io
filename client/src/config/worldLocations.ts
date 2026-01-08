// =====================================================
// WORLD LOCATIONS - Central registry of all POIs
// =====================================================

export interface WorldLocation {
    id: string
    name: string
    position: [number, number, number]
    type: 'airport' | 'landmark' | 'infrastructure' | 'nature' | 'road'
    icon: string
    description?: string
}

// World boundaries
export const MAP_BOUNDS = {
    min: -15000,
    max: 15000,
    playableRadius: 10000,
    terrainSize: 30000,
}

// All points of interest in the world
export const WORLD_LOCATIONS: WorldLocation[] = [
    // Airport Complex
    { id: 'runway', name: 'Main Runway', position: [0, 0, 0], type: 'airport', icon: '✈️', description: '200m runway, headings 09/27' },
    { id: 'tower', name: 'Control Tower', position: [40, 0, -15], type: 'airport', icon: '🗼', description: 'ATC with radar' },
    { id: 'terminal', name: 'Terminal', position: [40, 0, 20], type: 'airport', icon: '🏢', description: '3 gates' },
    { id: 'hangar_a', name: 'Hangar A', position: [60, 0, -30], type: 'airport', icon: '🛖' },
    { id: 'hangar_b', name: 'Hangar B', position: [80, 0, -30], type: 'airport', icon: '🛖' },
    { id: 'hangar_c', name: 'Hangar C', position: [100, 0, -30], type: 'airport', icon: '🛖' },

    // New Infrastructure
    { id: 'fuel_station', name: 'Fuel Station', position: [-50, 0, 15], type: 'infrastructure', icon: '⛽' },
    { id: 'helipad', name: 'Helipad', position: [80, 0, 40], type: 'airport', icon: '🚁' },
    { id: 'water_tower', name: 'Water Tower', position: [200, 0, 100], type: 'infrastructure', icon: '💧' },
    { id: 'weather_station', name: 'Weather Station', position: [150, 0, -100], type: 'infrastructure', icon: '🌡️' },
    { id: 'radio_towers', name: 'Radio Towers', position: [-800, 0, -600], type: 'infrastructure', icon: '📡' },

    // Natural Landmarks
    { id: 'mt_dorp', name: 'MT. DORP', position: [2000, 0, -1500], type: 'nature', icon: '⛰️', description: '400m peak with Hollywood sign' },
    { id: 'lighthouse', name: 'Lighthouse', position: [-1500, 0, 1500], type: 'landmark', icon: '🏠' },
    { id: 'wind_farm', name: 'Wind Farm', position: [1000, 0, 1500], type: 'landmark', icon: '🌬️' },
    { id: 'lake', name: 'Crystal Lake', position: [-2500, 0, 2500], type: 'nature', icon: '🏖️', description: 'Beach resort with dock' },

    // Urban
    { id: 'downtown', name: 'Downtown', position: [3000, 0, -3000], type: 'landmark', icon: '🏙️', description: 'City skyline with skyscrapers' },
]

// Road network nodes for minimap
export const ROAD_NETWORK = [
    // Main ring road around airport
    { start: [-200, 0, 200], end: [300, 0, 200] },
    { start: [300, 0, 200], end: [300, 0, -200] },
    { start: [300, 0, -200], end: [-200, 0, -200] },
    { start: [-200, 0, -200], end: [-200, 0, 200] },

    // Road to lighthouse
    { start: [-200, 0, 200], end: [-1500, 0, 1500] },

    // Road to wind farm
    { start: [300, 0, 200], end: [1000, 0, 1500] },

    // Road towards mountain
    { start: [300, 0, -200], end: [2000, 0, -1500] },

    // Cross roads
    { start: [0, 0, 200], end: [0, 0, -200] },
    { start: [-200, 0, 0], end: [300, 0, 0] },

    // Road to Crystal Lake (beach)
    { start: [-200, 0, 200], end: [-2500, 0, 2500] },

    // Road to Downtown (city)
    { start: [300, 0, -200], end: [3000, 0, -3000] },
]

// Utility functions
export function getLocationById(id: string): WorldLocation | undefined {
    return WORLD_LOCATIONS.find(loc => loc.id === id)
}

export function getLocationsByType(type: WorldLocation['type']): WorldLocation[] {
    return WORLD_LOCATIONS.filter(loc => loc.type === type)
}

export function getDistanceToLocation(playerPos: [number, number, number], locationId: string): number {
    const location = getLocationById(locationId)
    if (!location) return Infinity

    const dx = playerPos[0] - location.position[0]
    const dz = playerPos[2] - location.position[2]
    return Math.sqrt(dx * dx + dz * dz)
}

export function getNearestLocation(playerPos: [number, number, number]): WorldLocation | null {
    let nearest: WorldLocation | null = null
    let minDist = Infinity

    for (const loc of WORLD_LOCATIONS) {
        const dist = getDistanceToLocation(playerPos, loc.id)
        if (dist < minDist) {
            minDist = dist
            nearest = loc
        }
    }

    return nearest
}
