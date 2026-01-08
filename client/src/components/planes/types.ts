// Plane Model Types and Configuration
// =====================================

export type PlaneVariant = 'ww2' | 'jet' | 'biplane' | 'boeing747' | 'stealth' | 'interceptor' | 'sopwith' | 'spad' | 'otter' | 'tungtung' | 'claude'

export interface PlaneColors {
    primary: string
    secondary: string
    accent: string
}

export interface ControlInputs {
    pitch: number    // -1 to 1 (negative = nose down)
    roll: number     // -1 to 1 (negative = roll left)
    yaw: number      // -1 to 1 (negative = yaw left)
    throttle: number // 0 to 1
}

export interface PlaneModelProps {
    variant?: PlaneVariant
    colors?: PlaneColors
    controlInputs?: ControlInputs
    showPropeller?: boolean
}

// Default color schemes for each variant
export const VARIANT_COLORS: Record<PlaneVariant, PlaneColors> = {
    ww2: { primary: '#8B0000', secondary: '#5a0000', accent: '#FFD700' },
    jet: { primary: '#2c3e50', secondary: '#1a252f', accent: '#e74c3c' },
    biplane: { primary: '#8B4513', secondary: '#654321', accent: '#F5DEB3' },
    boeing747: { primary: '#f5f5f5', secondary: '#2266aa', accent: '#cc0000' },
    stealth: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#444444' },
    interceptor: { primary: '#c0c0c0', secondary: '#888888', accent: '#cc2222' },
    sopwith: { primary: '#556B2F', secondary: '#8B4513', accent: '#ffffff' },
    spad: { primary: '#C8A165', secondary: '#4B5320', accent: '#CD5C5C' },
    otter: { primary: '#8B6914', secondary: '#5C4A1A', accent: '#F5E6C8' },
    tungtung: { primary: '#C4884A', secondary: '#8B5E3C', accent: '#E8C49A' },
    claude: { primary: '#1a1a2e', secondary: '#D97757', accent: '#f5e6d3' },
}

export const DEFAULT_INPUTS: ControlInputs = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0.2,
}
