import { describe, it, expect } from 'vitest'
import {
    MAP_BOUNDS,
    WORLD_LOCATIONS,
    ROAD_NETWORK,
    getLocationById,
    getDistanceToLocation,
    getLocationsByType,
} from './worldLocations'

describe('worldLocations', () => {
    it('keeps map bounds consistent with terrain scale', () => {
        expect(MAP_BOUNDS.max).toBe(-MAP_BOUNDS.min)
        expect(MAP_BOUNDS.terrainSize).toBe(MAP_BOUNDS.max - MAP_BOUNDS.min)
    })

    it('registers unique POI ids', () => {
        const ids = WORLD_LOCATIONS.map((l) => l.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('resolves known landmarks', () => {
        expect(getLocationById('runway')?.name).toBe('Main Runway')
        expect(getLocationById('lake')?.position).toEqual([-2500, 0, 2500])
        expect(getLocationById('downtown')?.type).toBe('landmark')
    })

    it('computes horizontal distance to a POI', () => {
        const d = getDistanceToLocation([0, 0, 0], 'runway')
        expect(d).toBe(0)
        const toLake = getDistanceToLocation([0, 0, 0], 'lake')
        expect(toLake).toBeGreaterThan(1000)
    })

    it('filters locations by type', () => {
        const airports = getLocationsByType('airport')
        expect(airports.length).toBeGreaterThan(0)
        expect(airports.every((l) => l.type === 'airport')).toBe(true)
    })

    it('has road segments with start, end, and width', () => {
        expect(ROAD_NETWORK.length).toBeGreaterThan(0)
        for (const seg of ROAD_NETWORK) {
            expect(seg.start.length).toBe(3)
            expect(seg.end.length).toBe(3)
            expect(seg.width).toBeGreaterThan(0)
        }
    })
})
