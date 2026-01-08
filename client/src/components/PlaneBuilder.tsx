// =====================================================
// PLANE BUILDER - ULTIMATE EDITION
// Comprehensive aircraft customization with stats system
// Parts affect flight characteristics
// =====================================================

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import './PlaneBuilder.css'

// =====================================================
// TYPES & INTERFACES
// =====================================================

type FuselageType = 'standard' | 'sleek' | 'heavy' | 'compact' | 'aerobatic' | 'cargo'
type WingType = 'straight' | 'swept' | 'delta' | 'biplane' | 'forward-swept' | 'variable'
type TailType = 'standard' | 'twin' | 'v-tail' | 'none' | 't-tail' | 'cruciform'
type EngineType = 'propeller' | 'jet' | 'twin-jet' | 'rocket' | 'turboprop' | 'quad-jet'
type NoseType = 'rounded' | 'pointed' | 'flat' | 'radar' | 'glass' | 'shark'
type WingtipType = 'standard' | 'winglet' | 'raked' | 'fuel-tank' | 'missile' | 'lights'
type GearType = 'retractable' | 'fixed' | 'floats' | 'skids' | 'tricycle' | 'taildragger'
type CockpitType = 'bubble' | 'enclosed' | 'tandem' | 'side-by-side' | 'fighter' | 'bomber'
type DecalType = 'none' | 'stripes' | 'flames' | 'camo' | 'racing' | 'military' | 'custom'
type AccessoryType = 'none' | 'antenna' | 'pitot' | 'exhaust' | 'vortex' | 'intake'

interface PartOption<T> {
    type: T
    name: string
    desc: string
    speed: number
    agility: number
    durability: number
    icon?: string
}

interface PlaneConfig {
    name: string
    fuselage: FuselageType
    wings: WingType
    tail: TailType
    engine: EngineType
    nose: NoseType
    wingtips: WingtipType
    gear: GearType
    cockpit: CockpitType
    decal: DecalType
    accessory: AccessoryType
    primaryColor: string
    secondaryColor: string
    accentColor: string
    glowColor: string
}

interface SavedPlane {
    id: string
    config: PlaneConfig
    savedAt: number
}

// =====================================================
// PART COMPATIBILITY RULES
// =====================================================

interface CompatibilityWarning {
    message: string
    severity: 'warning' | 'error'
}

const checkCompatibility = (config: PlaneConfig): CompatibilityWarning[] => {
    const warnings: CompatibilityWarning[] = []

    // Biplane + Jets don't mix well historically
    if (config.wings === 'biplane' && ['jet', 'twin-jet', 'quad-jet', 'rocket'].includes(config.engine)) {
        warnings.push({ message: 'Biplane wings with jet engines is an unusual combo!', severity: 'warning' })
    }

    // Delta wings need proper tail
    if (config.wings === 'delta' && config.tail === 'standard') {
        warnings.push({ message: 'Delta wings work better with V-tail or no tail', severity: 'warning' })
    }

    // Flying wing needs jet power
    if (config.tail === 'none' && config.engine === 'propeller') {
        warnings.push({ message: 'Flying wings typically need jet propulsion', severity: 'warning' })
    }

    // Floats + high speed = bad
    if (config.gear === 'floats' && config.engine === 'rocket') {
        warnings.push({ message: 'Floats create too much drag for rocket engines!', severity: 'error' })
    }

    // Cargo fuselage + aerobatic parts
    if (config.fuselage === 'cargo' && config.wings === 'forward-swept') {
        warnings.push({ message: 'Cargo fuselage is too heavy for forward-swept agility', severity: 'warning' })
    }

    // Glass nose + rocket = dangerous
    if (config.nose === 'glass' && config.engine === 'rocket') {
        warnings.push({ message: 'Glass nose might not survive rocket vibrations!', severity: 'warning' })
    }

    return warnings
}

// =====================================================
// PART DEFINITIONS (with stats!)
// =====================================================

const FUSELAGE_OPTIONS: PartOption<FuselageType>[] = [
    { type: 'standard', name: 'Standard', desc: 'Balanced body', speed: 0, agility: 0, durability: 0, icon: '◯' },
    { type: 'sleek', name: 'Sleek', desc: '+Speed, -Durability', speed: 15, agility: 5, durability: -10, icon: '▷' },
    { type: 'heavy', name: 'Heavy', desc: '+Durability, -Speed', speed: -10, agility: -5, durability: 20, icon: '▣' },
    { type: 'compact', name: 'Compact', desc: '+Agility, -Capacity', speed: 5, agility: 15, durability: -5, icon: '◇' },
    { type: 'aerobatic', name: 'Aerobatic', desc: 'Max agility', speed: 0, agility: 25, durability: -15, icon: '✦' },
    { type: 'cargo', name: 'Cargo', desc: 'Massive capacity', speed: -15, agility: -20, durability: 25, icon: '▢' },
]

const WING_OPTIONS: PartOption<WingType>[] = [
    { type: 'straight', name: 'Straight', desc: 'Good lift, stable', speed: 0, agility: 0, durability: 5, icon: '━' },
    { type: 'swept', name: 'Swept', desc: 'High speed flight', speed: 15, agility: 5, durability: 0, icon: '╲' },
    { type: 'delta', name: 'Delta', desc: 'Fast + agile', speed: 10, agility: 15, durability: -5, icon: '◁' },
    { type: 'biplane', name: 'Biplane', desc: 'Maximum lift', speed: -10, agility: 20, durability: 10, icon: '☰' },
    { type: 'forward-swept', name: 'Forward', desc: 'Experimental agility', speed: 5, agility: 25, durability: -15, icon: '╱' },
    { type: 'variable', name: 'Variable', desc: 'Adaptable geometry', speed: 10, agility: 10, durability: -5, icon: '⋈' },
]

const TAIL_OPTIONS: PartOption<TailType>[] = [
    { type: 'standard', name: 'Standard', desc: 'Reliable design', speed: 0, agility: 0, durability: 5, icon: '⊥' },
    { type: 'twin', name: 'Twin', desc: 'Extra stability', speed: -5, agility: 5, durability: 10, icon: '⊻' },
    { type: 'v-tail', name: 'V-Tail', desc: 'Unique handling', speed: 5, agility: 10, durability: 0, icon: '∨' },
    { type: 'none', name: 'Flying Wing', desc: 'Stealth focused', speed: 10, agility: -5, durability: -10, icon: '─' },
    { type: 't-tail', name: 'T-Tail', desc: 'High efficiency', speed: 5, agility: 5, durability: 0, icon: '⊤' },
    { type: 'cruciform', name: 'Cruciform', desc: 'Spin recovery', speed: 0, agility: 15, durability: 5, icon: '✚' },
]

const ENGINE_OPTIONS: PartOption<EngineType>[] = [
    { type: 'propeller', name: 'Propeller', desc: 'Classic, efficient', speed: 0, agility: 10, durability: 10, icon: '⊛' },
    { type: 'jet', name: 'Single Jet', desc: 'Fast and light', speed: 20, agility: 5, durability: 0, icon: '◉' },
    { type: 'twin-jet', name: 'Twin Jets', desc: 'Power + speed', speed: 25, agility: 0, durability: 5, icon: '◉◉' },
    { type: 'rocket', name: 'Rocket', desc: 'MAXIMUM THRUST', speed: 40, agility: -10, durability: -20, icon: '🚀' },
    { type: 'turboprop', name: 'Turboprop', desc: 'Balanced power', speed: 10, agility: 10, durability: 5, icon: '⊚' },
    { type: 'quad-jet', name: 'Quad Jets', desc: 'Ultimate power', speed: 30, agility: -15, durability: 10, icon: '◉◉◉◉' },
]

const NOSE_OPTIONS: PartOption<NoseType>[] = [
    { type: 'rounded', name: 'Rounded', desc: 'Classic look', speed: 0, agility: 0, durability: 5, icon: '◠' },
    { type: 'pointed', name: 'Pointed', desc: 'Aerodynamic', speed: 10, agility: 0, durability: -5, icon: '▲' },
    { type: 'flat', name: 'Flat', desc: 'Cargo style', speed: -5, agility: -5, durability: 15, icon: '▬' },
    { type: 'radar', name: 'Radar Dome', desc: 'Combat ready', speed: -5, agility: 0, durability: 0, icon: '◐' },
    { type: 'glass', name: 'Glass Nose', desc: 'Bomber view', speed: -5, agility: -5, durability: -10, icon: '◯' },
    { type: 'shark', name: 'Shark Mouth', desc: 'Intimidating!', speed: 5, agility: 5, durability: 0, icon: '🦈' },
]

const WINGTIP_OPTIONS: PartOption<WingtipType>[] = [
    { type: 'standard', name: 'Standard', desc: 'Basic tips', speed: 0, agility: 0, durability: 0, icon: '|' },
    { type: 'winglet', name: 'Winglets', desc: '+Efficiency', speed: 10, agility: 0, durability: 0, icon: '⌐' },
    { type: 'raked', name: 'Raked', desc: 'Modern look', speed: 5, agility: 5, durability: 0, icon: '/' },
    { type: 'fuel-tank', name: 'Fuel Tanks', desc: '+Range', speed: -5, agility: -10, durability: 5, icon: '⬯' },
    { type: 'missile', name: 'Missiles', desc: 'Combat ready', speed: -5, agility: -5, durability: 0, icon: '➢' },
    { type: 'lights', name: 'Lights', desc: 'Navigation', speed: 0, agility: 0, durability: 0, icon: '✦' },
]

const GEAR_OPTIONS: PartOption<GearType>[] = [
    { type: 'retractable', name: 'Retractable', desc: 'Streamlined', speed: 15, agility: 0, durability: 0, icon: '⊓' },
    { type: 'fixed', name: 'Fixed', desc: 'Simple & tough', speed: -5, agility: 5, durability: 15, icon: '⊔' },
    { type: 'floats', name: 'Floats', desc: 'Water landing', speed: -10, agility: -10, durability: 10, icon: '⌓' },
    { type: 'skids', name: 'Skids', desc: 'Rough terrain', speed: -5, agility: 0, durability: 20, icon: '⊏' },
    { type: 'tricycle', name: 'Tricycle', desc: 'Stable taxi', speed: 0, agility: 5, durability: 5, icon: '⋀' },
    { type: 'taildragger', name: 'Taildragger', desc: 'Classic style', speed: 5, agility: 10, durability: 0, icon: '⋎' },
]

const COCKPIT_OPTIONS: PartOption<CockpitType>[] = [
    { type: 'bubble', name: 'Bubble', desc: '360° view', speed: 0, agility: 10, durability: -5, icon: '◠' },
    { type: 'enclosed', name: 'Enclosed', desc: 'Protected', speed: -5, agility: -5, durability: 15, icon: '▭' },
    { type: 'tandem', name: 'Tandem', desc: 'Two-seater', speed: -5, agility: 0, durability: 5, icon: '◉◉' },
    { type: 'side-by-side', name: 'Side-by-Side', desc: 'Trainer style', speed: -5, agility: -5, durability: 5, icon: '◎◎' },
    { type: 'fighter', name: 'Fighter', desc: 'Combat canopy', speed: 5, agility: 15, durability: 0, icon: '◈' },
    { type: 'bomber', name: 'Bomber', desc: 'Multi-crew', speed: -10, agility: -10, durability: 20, icon: '▣' },
]

const DECAL_OPTIONS: PartOption<DecalType>[] = [
    { type: 'none', name: 'None', desc: 'Clean look', speed: 0, agility: 0, durability: 0, icon: '○' },
    { type: 'stripes', name: 'Stripes', desc: 'Racing style', speed: 0, agility: 0, durability: 0, icon: '═' },
    { type: 'flames', name: 'Flames', desc: 'Hot rod!', speed: 0, agility: 0, durability: 0, icon: '🔥' },
    { type: 'camo', name: 'Camo', desc: 'Military', speed: 0, agility: 0, durability: 0, icon: '▨' },
    { type: 'racing', name: 'Racing', desc: 'Numbers & logos', speed: 0, agility: 0, durability: 0, icon: '#' },
    { type: 'military', name: 'Military', desc: 'Unit markings', speed: 0, agility: 0, durability: 0, icon: '★' },
    { type: 'custom', name: 'Custom', desc: 'Your design', speed: 0, agility: 0, durability: 0, icon: '✎' },
]

const ACCESSORY_OPTIONS: PartOption<AccessoryType>[] = [
    { type: 'none', name: 'None', desc: 'Clean build', speed: 0, agility: 0, durability: 0, icon: '○' },
    { type: 'antenna', name: 'Antenna', desc: 'Radio gear', speed: -2, agility: 0, durability: 0, icon: '┴' },
    { type: 'pitot', name: 'Pitot Tube', desc: 'Speed sensor', speed: 0, agility: 0, durability: 0, icon: '─' },
    { type: 'exhaust', name: 'Exhaust Tips', desc: 'Chrome pipes', speed: 0, agility: 0, durability: 0, icon: '◊' },
    { type: 'vortex', name: 'Vortex Gen', desc: 'Turbulators', speed: 5, agility: 10, durability: 0, icon: '∿' },
    { type: 'intake', name: 'Air Intakes', desc: 'Engine scoops', speed: 5, agility: 0, durability: 0, icon: '⊂' },
]

// =====================================================
// COLOR PRESETS (expanded!)
// =====================================================

const COLOR_PRESETS = [
    { name: 'Classic Red', primary: '#8B0000', secondary: '#5a0000', accent: '#FFD700', glow: '#ff0000' },
    { name: 'Stealth', primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#444444', glow: '#222222' },
    { name: 'Sky Blue', primary: '#4a90d9', secondary: '#2a5a99', accent: '#ffffff', glow: '#00aaff' },
    { name: 'Sunset', primary: '#ff6b35', secondary: '#ff4500', accent: '#ffd700', glow: '#ff8800' },
    { name: 'Forest', primary: '#2d5a27', secondary: '#1a3a17', accent: '#8fbc8f', glow: '#00ff44' },
    { name: 'Ocean', primary: '#006994', secondary: '#004466', accent: '#00d4ff', glow: '#00aaff' },
    { name: 'Coral', primary: '#1a1a2e', secondary: '#D97757', accent: '#f5e6d3', glow: '#ff7755' },
    { name: 'Retro', primary: '#c4884a', secondary: '#8b5e3c', accent: '#e8c49a', glow: '#ffaa44' },
    { name: 'Midnight', primary: '#0f0f2f', secondary: '#1a1a4a', accent: '#8888ff', glow: '#4444ff' },
    { name: 'Arctic', primary: '#e8f4fc', secondary: '#b8d4e8', accent: '#2a5a7a', glow: '#88ddff' },
    { name: 'Gold', primary: '#ffd700', secondary: '#b8860b', accent: '#ffffff', glow: '#ffee00' },
    { name: 'Military', primary: '#4a5a3a', secondary: '#3a4a2a', accent: '#2a2a2a', glow: '#668844' },
    { name: 'Racing', primary: '#ff0000', secondary: '#cc0000', accent: '#ffffff', glow: '#ff4444' },
    { name: 'Purple Haze', primary: '#4a0080', secondary: '#2a0050', accent: '#ff00ff', glow: '#aa00ff' },
    { name: 'Vaporwave', primary: '#ff71ce', secondary: '#01cdfe', accent: '#05ffa1', glow: '#ff00ff' },
    { name: 'Cyberpunk', primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#00ff9f', glow: '#ff00ff' },
]

// =====================================================
// DEFAULT CONFIG
// =====================================================

const DEFAULT_CONFIG: PlaneConfig = {
    name: 'Custom Plane',
    fuselage: 'standard',
    wings: 'straight',
    tail: 'standard',
    engine: 'propeller',
    nose: 'rounded',
    wingtips: 'standard',
    gear: 'retractable',
    cockpit: 'bubble',
    decal: 'none',
    accessory: 'none',
    primaryColor: '#3a5a8c',
    secondaryColor: '#1a2a4c',
    accentColor: '#ff6b35',
    glowColor: '#ff6b35',
}

// =====================================================
// STATS CALCULATOR
// =====================================================

function calculateStats(config: PlaneConfig) {
    const baseStats = { speed: 50, agility: 50, durability: 50 }

    const parts = [
        FUSELAGE_OPTIONS.find(p => p.type === config.fuselage),
        WING_OPTIONS.find(p => p.type === config.wings),
        TAIL_OPTIONS.find(p => p.type === config.tail),
        ENGINE_OPTIONS.find(p => p.type === config.engine),
        NOSE_OPTIONS.find(p => p.type === config.nose),
        WINGTIP_OPTIONS.find(p => p.type === config.wingtips),
        GEAR_OPTIONS.find(p => p.type === config.gear),
        COCKPIT_OPTIONS.find(p => p.type === config.cockpit),
        ACCESSORY_OPTIONS.find(p => p.type === config.accessory),
    ]

    let speed = baseStats.speed
    let agility = baseStats.agility
    let durability = baseStats.durability

    parts.forEach(part => {
        if (part) {
            speed += part.speed
            agility += part.agility
            durability += part.durability
        }
    })

    // Clamp values between 0 and 100
    return {
        speed: Math.max(0, Math.min(100, speed)),
        agility: Math.max(0, Math.min(100, agility)),
        durability: Math.max(0, Math.min(100, durability)),
    }
}

// =====================================================
// ANIMATED PROPELLER COMPONENT
// =====================================================

interface AnimatedPropellerProps {
    position: [number, number, number]
    bladeCount?: number
    bladeColor?: string
    hubColor?: string
    rpm?: number
}

function AnimatedPropeller({
    position,
    bladeCount = 2,
    bladeColor = '#1a1a1a',
    hubColor = '#2a2a2a',
    rpm = 20
}: AnimatedPropellerProps) {
    const propRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (propRef.current) {
            propRef.current.rotation.z += delta * rpm
        }
    })

    const bladeAngles = Array.from({ length: bladeCount }, (_, i) => (360 / bladeCount) * i)

    return (
        <group ref={propRef} position={position}>
            {/* Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
                <meshStandardMaterial color={hubColor} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Blades */}
            {bladeAngles.map((angle, i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos((angle * Math.PI) / 180) * 0.03,
                        Math.sin((angle * Math.PI) / 180) * 0.03,
                        0,
                    ]}
                    rotation={[0, 0, (angle * Math.PI) / 180]}
                >
                    <boxGeometry args={[0.07, 1.0, 0.02]} />
                    <meshStandardMaterial color={bladeColor} metalness={0.7} roughness={0.2} />
                </mesh>
            ))}
        </group>
    )
}

// =====================================================
// 3D PREVIEW COMPONENT
// =====================================================

function PlanePreview3D({ config }: { config: PlaneConfig }) {
    // Fuselage length varies by type
    const fuselageLength = useMemo(() => {
        switch (config.fuselage) {
            case 'sleek': return 2.6
            case 'heavy': return 1.8
            case 'compact': return 1.4
            case 'aerobatic': return 2.0
            case 'cargo': return 3.0
            default: return 2.0
        }
    }, [config.fuselage])

    const fuselageRadius = useMemo(() => {
        switch (config.fuselage) {
            case 'sleek': return 0.22
            case 'heavy': return 0.4
            case 'compact': return 0.28
            case 'aerobatic': return 0.25
            case 'cargo': return 0.5
            default: return 0.3
        }
    }, [config.fuselage])

    // Calculate nose extension for proper propeller placement
    const noseExtension = useMemo(() => {
        switch (config.nose) {
            case 'pointed': return 0.5
            case 'radar': return 0.3
            case 'glass': return 0.3
            case 'shark': return 0.4
            case 'flat': return 0.1
            default: return 0.2 // rounded
        }
    }, [config.nose])

    // Calculate wing span for nav light and wingtip placement
    const wingSpan = useMemo(() => {
        switch (config.wings) {
            case 'biplane': return 1.75
            case 'delta': return 1.6
            case 'forward-swept': return 2.0
            case 'variable': return 1.8
            case 'swept': return 2.0
            default: return 2.3 // straight
        }
    }, [config.wings])

    return (
        <group>
            {/* FUSELAGE */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[fuselageRadius, fuselageLength, 8, 16]} />
                <meshStandardMaterial
                    color={config.primaryColor}
                    metalness={config.fuselage === 'sleek' ? 0.8 : 0.6}
                    roughness={config.fuselage === 'sleek' ? 0.2 : 0.4}
                />
            </mesh>

            {/* NOSE */}
            {config.nose === 'pointed' && (
                <mesh position={[0, 0, -fuselageLength / 2 - 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[fuselageRadius * 0.8, 0.5, 12]} />
                    <meshStandardMaterial color={config.secondaryColor} metalness={0.7} />
                </mesh>
            )}
            {config.nose === 'radar' && (
                <mesh position={[0, 0, -fuselageLength / 2 - 0.15]}>
                    <sphereGeometry args={[fuselageRadius * 0.9, 16, 12]} />
                    <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
                </mesh>
            )}
            {config.nose === 'glass' && (
                <mesh position={[0, 0, -fuselageLength / 2 - 0.15]}>
                    <sphereGeometry args={[fuselageRadius * 0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial color="#1a4a6a" transparent opacity={0.6} metalness={0.9} />
                </mesh>
            )}
            {config.nose === 'shark' && (
                <>
                    <mesh position={[0, 0, -fuselageLength / 2 - 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[fuselageRadius * 0.7, 0.4, 12]} />
                        <meshStandardMaterial color={config.primaryColor} metalness={0.6} />
                    </mesh>
                    {/* Shark teeth */}
                    {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
                        <mesh key={i} position={[x, -fuselageRadius * 0.5, -fuselageLength / 2 - 0.1]} rotation={[0.3, 0, 0]}>
                            <coneGeometry args={[0.03, 0.08, 4]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                    {/* Eyes */}
                    {[-0.12, 0.12].map((x, i) => (
                        <mesh key={`eye-${i}`} position={[x, 0.1, -fuselageLength / 2]}>
                            <sphereGeometry args={[0.05, 8, 8]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                </>
            )}
            {config.nose === 'flat' && (
                <mesh position={[0, 0, -fuselageLength / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[fuselageRadius * 0.95, fuselageRadius * 0.95, 0.1, 12]} />
                    <meshStandardMaterial color={config.secondaryColor} metalness={0.5} />
                </mesh>
            )}

            {/* COCKPIT - positioned relative to fuselage */}
            {config.cockpit === 'bubble' && (
                <mesh position={[0, fuselageRadius + 0.05, -fuselageLength * 0.15]}>
                    <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color="#1a2a3a" transparent opacity={0.7} metalness={0.9} roughness={0.1} />
                </mesh>
            )}
            {config.cockpit === 'enclosed' && (
                <mesh position={[0, fuselageRadius, -fuselageLength * 0.15]}>
                    <boxGeometry args={[0.35, 0.2, 0.5]} />
                    <meshStandardMaterial color={config.secondaryColor} metalness={0.6} />
                </mesh>
            )}
            {config.cockpit === 'fighter' && (
                <mesh position={[0, fuselageRadius + 0.02, -fuselageLength * 0.15]} rotation={[0.1, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.12, 0.4, 8, 12]} />
                    <meshStandardMaterial color="#1a3a4a" transparent opacity={0.7} metalness={0.95} />
                </mesh>
            )}
            {config.cockpit === 'tandem' && (
                <>
                    <mesh position={[0, fuselageRadius + 0.05, -fuselageLength * 0.25]}>
                        <sphereGeometry args={[0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.7} metalness={0.9} />
                    </mesh>
                    <mesh position={[0, fuselageRadius + 0.05, -fuselageLength * 0.05]}>
                        <sphereGeometry args={[0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.7} metalness={0.9} />
                    </mesh>
                </>
            )}
            {config.cockpit === 'side-by-side' && (
                <mesh position={[0, fuselageRadius, -fuselageLength * 0.15]}>
                    <boxGeometry args={[0.5, 0.25, 0.4]} />
                    <meshStandardMaterial color="#1a3a4a" transparent opacity={0.6} metalness={0.9} />
                </mesh>
            )}
            {config.cockpit === 'bomber' && (
                <>
                    <mesh position={[0, fuselageRadius - 0.02, -fuselageLength * 0.25]}>
                        <boxGeometry args={[0.6, 0.25, 0.8]} />
                        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.5} metalness={0.85} />
                    </mesh>
                    <mesh position={[0, fuselageRadius + 0.15, -fuselageLength * 0.15]}>
                        <sphereGeometry args={[0.15, 12, 10]} />
                        <meshStandardMaterial color="#2a3a4a" transparent opacity={0.6} metalness={0.9} />
                    </mesh>
                </>
            )}

            {/* WINGS */}
            {config.wings === 'straight' && (
                <group position={[0, 0, 0.2]}>
                    <mesh position={[-1.2, 0, 0]}>
                        <boxGeometry args={[2.2, 0.06, 0.6]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.5} roughness={0.5} />
                    </mesh>
                    <mesh position={[1.2, 0, 0]}>
                        <boxGeometry args={[2.2, 0.06, 0.6]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.5} roughness={0.5} />
                    </mesh>
                </group>
            )}
            {config.wings === 'swept' && (
                <group position={[0, 0, 0.1]}>
                    <mesh position={[-1.0, 0, 0.2]} rotation={[0, 0.3, -0.03]}>
                        <boxGeometry args={[2.0, 0.05, 0.8]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[1.0, 0, 0.2]} rotation={[0, -0.3, 0.03]}>
                        <boxGeometry args={[2.0, 0.05, 0.8]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            )}
            {config.wings === 'delta' && (
                <group position={[0, 0, 0.3]}>
                    <mesh position={[-0.8, 0, 0.1]} rotation={[0, 0.6, -0.02]}>
                        <boxGeometry args={[1.6, 0.04, 1.2]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[0.8, 0, 0.1]} rotation={[0, -0.6, 0.02]}>
                        <boxGeometry args={[1.6, 0.04, 1.2]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            )}
            {config.wings === 'biplane' && (
                <group>
                    <mesh position={[0, 0.4, 0]}>
                        <boxGeometry args={[3.5, 0.06, 0.55]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.3} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[3.5, 0.06, 0.55]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.3} roughness={0.7} />
                    </mesh>
                    {[-0.9, 0.9].map((x, i) => (
                        <mesh key={i} position={[x, 0.15, 0]}>
                            <boxGeometry args={[0.04, 0.5, 0.04]} />
                            <meshStandardMaterial color={config.accentColor} />
                        </mesh>
                    ))}
                </group>
            )}
            {config.wings === 'forward-swept' && (
                <group position={[0, 0, 0.1]}>
                    <mesh position={[-1.0, 0, -0.2]} rotation={[0, -0.35, -0.03]}>
                        <boxGeometry args={[2.0, 0.05, 0.7]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[1.0, 0, -0.2]} rotation={[0, 0.35, 0.03]}>
                        <boxGeometry args={[2.0, 0.05, 0.7]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            )}
            {config.wings === 'variable' && (
                <group position={[0, 0, 0.1]}>
                    <mesh position={[-0.9, 0, 0]} rotation={[0, 0.15, -0.02]}>
                        <boxGeometry args={[1.8, 0.05, 0.6]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0.9, 0, 0]} rotation={[0, -0.15, 0.02]}>
                        <boxGeometry args={[1.8, 0.05, 0.6]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Wing pivot mechanisms */}
                    {[-0.15, 0.15].map((x, i) => (
                        <mesh key={i} position={[x, 0.05, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
                            <meshStandardMaterial color="#333333" metalness={0.9} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* WINGTIPS */}
            {config.wingtips === 'winglet' && config.wings !== 'biplane' && (
                <>
                    <mesh position={[-wingSpan, 0.15, 0.15]} rotation={[0, 0, -0.3]}>
                        <boxGeometry args={[0.04, 0.3, 0.3]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.6} />
                    </mesh>
                    <mesh position={[wingSpan, 0.15, 0.15]} rotation={[0, 0, 0.3]}>
                        <boxGeometry args={[0.04, 0.3, 0.3]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.6} />
                    </mesh>
                </>
            )}
            {config.wingtips === 'raked' && config.wings !== 'biplane' && (
                <>
                    <mesh position={[-wingSpan - 0.1, 0, 0.1]} rotation={[0, -0.4, -0.15]}>
                        <boxGeometry args={[0.3, 0.04, 0.25]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} />
                    </mesh>
                    <mesh position={[wingSpan + 0.1, 0, 0.1]} rotation={[0, 0.4, 0.15]}>
                        <boxGeometry args={[0.3, 0.04, 0.25]} />
                        <meshStandardMaterial color={config.secondaryColor} metalness={0.7} />
                    </mesh>
                </>
            )}
            {config.wingtips === 'fuel-tank' && (
                <>
                    <mesh position={[-wingSpan * 0.95, -0.1, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.08, 0.35, 6, 10]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.5} />
                    </mesh>
                    <mesh position={[wingSpan * 0.95, -0.1, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.08, 0.35, 6, 10]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.5} />
                    </mesh>
                </>
            )}
            {config.wingtips === 'missile' && (
                <>
                    {[-0.8, -0.5, 0.5, 0.8].map((ratio, i) => (
                        <group key={i} position={[wingSpan * ratio, -0.12, 0.15]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                                <meshStandardMaterial color="#444444" metalness={0.8} />
                            </mesh>
                            <mesh position={[0, 0, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
                                <coneGeometry args={[0.04, 0.1, 8]} />
                                <meshStandardMaterial color="#ff4444" metalness={0.6} />
                            </mesh>
                        </group>
                    ))}
                </>
            )}
            {config.wingtips === 'lights' && (
                <>
                    <mesh position={[-wingSpan, 0, 0.15]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.2} />
                    </mesh>
                    <mesh position={[wingSpan, 0, 0.15]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.2} />
                    </mesh>
                </>
            )}

            {/* TAIL - positioned at rear of fuselage */}
            {config.tail === 'standard' && (
                <group position={[0, 0, fuselageLength / 2]}>
                    <mesh position={[0, 0.25, 0]}>
                        <boxGeometry args={[0.04, 0.5, 0.35]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1.0, 0.04, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                </group>
            )}
            {config.tail === 'twin' && (
                <group position={[0, 0, fuselageLength / 2]}>
                    {[-0.25, 0.25].map((x, i) => (
                        <mesh key={i} position={[x, 0.3, 0]} rotation={[0.08, 0, x < 0 ? -0.15 : 0.15]}>
                            <boxGeometry args={[0.04, 0.5, 0.3]} />
                            <meshStandardMaterial color={config.secondaryColor} />
                        </mesh>
                    ))}
                    <mesh position={[0, 0.05, 0]}>
                        <boxGeometry args={[1.2, 0.04, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                </group>
            )}
            {config.tail === 'v-tail' && (
                <group position={[0, 0, fuselageLength / 2]}>
                    <mesh position={[-0.2, 0.2, 0]} rotation={[0.1, 0, -0.6]}>
                        <boxGeometry args={[0.04, 0.6, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                    <mesh position={[0.2, 0.2, 0]} rotation={[0.1, 0, 0.6]}>
                        <boxGeometry args={[0.04, 0.6, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                </group>
            )}
            {config.tail === 't-tail' && (
                <group position={[0, 0, fuselageLength / 2]}>
                    <mesh position={[0, 0.3, 0]}>
                        <boxGeometry args={[0.04, 0.6, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                    <mesh position={[0, 0.55, 0]}>
                        <boxGeometry args={[1.2, 0.04, 0.25]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                </group>
            )}
            {config.tail === 'cruciform' && (
                <group position={[0, 0, fuselageLength / 2]}>
                    <mesh position={[0, 0.25, 0]}>
                        <boxGeometry args={[0.04, 0.5, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                    <mesh position={[0, 0.25, 0]}>
                        <boxGeometry args={[0.9, 0.04, 0.25]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1.0, 0.04, 0.3]} />
                        <meshStandardMaterial color={config.secondaryColor} />
                    </mesh>
                </group>
            )}

            {/* ENGINE */}
            {config.engine === 'propeller' && (
                <group position={[0, 0, -fuselageLength / 2 - noseExtension - 0.15]}>
                    {/* Spinner cone */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.12, 0.25, 8]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.8} />
                    </mesh>
                    {/* Animated propeller */}
                    <AnimatedPropeller
                        position={[0, 0, -0.05]}
                        bladeCount={2}
                        rpm={25}
                    />
                </group>
            )}
            {config.engine === 'turboprop' && (
                <group position={[0, 0, -fuselageLength / 2 - noseExtension - 0.1]}>
                    {/* Engine nacelle */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.14, 0.18, 0.3, 12]} />
                        <meshStandardMaterial color="#333333" metalness={0.9} />
                    </mesh>
                    {/* Spinner cone */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.18]}>
                        <coneGeometry args={[0.1, 0.18, 8]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.8} />
                    </mesh>
                    {/* Animated 6-blade turboprop */}
                    <AnimatedPropeller
                        position={[0, 0, -0.25]}
                        bladeCount={6}
                        rpm={35}
                        bladeColor="#222222"
                    />
                </group>
            )}
            {config.engine === 'jet' && (
                <group position={[0, -0.05, fuselageLength / 2 + 0.2]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.14, 0.18, 0.4, 12]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
                    </mesh>
                    <mesh position={[0, 0, 0.25]}>
                        <circleGeometry args={[0.12, 12]} />
                        <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={0.5} />
                    </mesh>
                </group>
            )}
            {config.engine === 'twin-jet' && (
                <group position={[0, -0.08, fuselageLength / 2 + 0.2]}>
                    {[-0.22, 0.22].map((x, i) => (
                        <group key={i} position={[x, 0, 0]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.1, 0.13, 0.35, 10]} />
                                <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
                            </mesh>
                            <mesh position={[0, 0, 0.22]}>
                                <circleGeometry args={[0.08, 10]} />
                                <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={0.5} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
            {config.engine === 'quad-jet' && (
                <group position={[0, 0, 0.3]}>
                    {[-1.4, -0.7, 0.7, 1.4].map((x, i) => (
                        <group key={i} position={[x, -0.15, 0]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.08, 0.1, 0.3, 10]} />
                                <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
                            </mesh>
                            <mesh position={[0, 0, 0.18]}>
                                <circleGeometry args={[0.06, 8]} />
                                <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={0.4} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
            {config.engine === 'rocket' && (
                <group position={[0, 0, fuselageLength / 2 + 0.1]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.18, 0.22, 0.5, 12]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.95} />
                    </mesh>
                    <mesh position={[0, 0, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.16, 0.5, 10]} />
                        <meshBasicMaterial color="#ff4400" transparent opacity={0.7} />
                    </mesh>
                    <mesh position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.08, 0.3, 8]} />
                        <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
                    </mesh>
                </group>
            )}

            {/* LANDING GEAR - positioned relative to fuselage */}
            {config.gear === 'fixed' && (
                <group>
                    {[-0.4, 0.4].map((x, i) => (
                        <group key={i} position={[x, -fuselageRadius - 0.15, 0]}>
                            <mesh>
                                <boxGeometry args={[0.03, 0.25, 0.03]} />
                                <meshStandardMaterial color="#333333" metalness={0.8} />
                            </mesh>
                            <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
                                <meshStandardMaterial color="#1a1a1a" />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
            {config.gear === 'floats' && (
                <group>
                    {[-0.5, 0.5].map((x, i) => (
                        <mesh key={i} position={[x, -fuselageRadius - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <capsuleGeometry args={[0.1, fuselageLength * 0.6, 8, 12]} />
                            <meshStandardMaterial color="#444455" metalness={0.4} />
                        </mesh>
                    ))}
                </group>
            )}
            {config.gear === 'skids' && (
                <group>
                    {[-0.35, 0.35].map((x, i) => (
                        <group key={i}>
                            <mesh position={[x, -fuselageRadius - 0.05, 0]} rotation={[0, 0, 0]}>
                                <boxGeometry args={[0.04, 0.15, fuselageLength * 0.6]} />
                                <meshStandardMaterial color="#333333" metalness={0.7} />
                            </mesh>
                            <mesh position={[x, -fuselageRadius - 0.1, 0]}>
                                <boxGeometry args={[0.06, 0.03, fuselageLength * 0.7]} />
                                <meshStandardMaterial color="#222222" metalness={0.6} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
            {config.gear === 'tricycle' && (
                <group>
                    {/* Nose gear */}
                    <group position={[0, -fuselageRadius - 0.1, -fuselageLength * 0.35]}>
                        <mesh>
                            <boxGeometry args={[0.03, 0.2, 0.03]} />
                            <meshStandardMaterial color="#333333" metalness={0.8} />
                        </mesh>
                        <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.06, 0.06, 0.03, 10]} />
                            <meshStandardMaterial color="#1a1a1a" />
                        </mesh>
                    </group>
                    {/* Main gear */}
                    {[-0.4, 0.4].map((x, i) => (
                        <group key={i} position={[x, -fuselageRadius - 0.1, fuselageLength * 0.1]}>
                            <mesh>
                                <boxGeometry args={[0.03, 0.2, 0.03]} />
                                <meshStandardMaterial color="#333333" metalness={0.8} />
                            </mesh>
                            <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
                                <meshStandardMaterial color="#1a1a1a" />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
            {config.gear === 'taildragger' && (
                <group>
                    {/* Main gear */}
                    {[-0.4, 0.4].map((x, i) => (
                        <group key={i} position={[x, -fuselageRadius - 0.1, -fuselageLength * 0.15]}>
                            <mesh>
                                <boxGeometry args={[0.03, 0.2, 0.03]} />
                                <meshStandardMaterial color="#333333" metalness={0.8} />
                            </mesh>
                            <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
                                <meshStandardMaterial color="#1a1a1a" />
                            </mesh>
                        </group>
                    ))}
                    {/* Tail wheel */}
                    <group position={[0, -fuselageRadius + 0.05, fuselageLength / 2 - 0.1]}>
                        <mesh>
                            <boxGeometry args={[0.02, 0.1, 0.02]} />
                            <meshStandardMaterial color="#333333" metalness={0.8} />
                        </mesh>
                        <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
                            <meshStandardMaterial color="#1a1a1a" />
                        </mesh>
                    </group>
                </group>
            )}

            {/* DECALS */}
            {config.decal === 'stripes' && (
                <>
                    <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.08, fuselageLength * 0.9, 6, 12]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.5} />
                    </mesh>
                    <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.06, fuselageLength * 0.8, 6, 12]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.5} />
                    </mesh>
                </>
            )}
            {config.decal === 'racing' && (
                <>
                    <mesh position={[-0.2, 0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
                        <planeGeometry args={[0.3, 0.3]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.3} />
                    </mesh>
                    <mesh position={[0.2, 0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
                        <planeGeometry args={[0.3, 0.3]} />
                        <meshStandardMaterial color={config.accentColor} metalness={0.3} />
                    </mesh>
                </>
            )}
            {config.decal === 'military' && (
                <>
                    {[-wingSpan * 0.65, wingSpan * 0.65].map((x, i) => (
                        <mesh key={i} position={[x, 0.05, 0.15]} rotation={[0, 0, 0]}>
                            <circleGeometry args={[0.2, 32]} />
                            <meshStandardMaterial color={config.accentColor} />
                        </mesh>
                    ))}
                </>
            )}

            {/* ACCESSORIES */}
            {config.accessory === 'antenna' && (
                <mesh position={[0, fuselageRadius + 0.2, fuselageLength * 0.25]}>
                    <boxGeometry args={[0.02, 0.3, 0.02]} />
                    <meshStandardMaterial color="#444444" metalness={0.9} />
                </mesh>
            )}
            {config.accessory === 'pitot' && (
                <mesh position={[-wingSpan * 0.85, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
                    <meshStandardMaterial color="#888888" metalness={0.95} />
                </mesh>
            )}
            {config.accessory === 'exhaust' && (
                <>
                    {[-0.15, 0.15].map((x, i) => (
                        <mesh key={i} position={[x, -fuselageRadius * 0.3, fuselageLength / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.05, 0.06, 0.15, 8]} />
                            <meshStandardMaterial color="#666666" metalness={0.95} />
                        </mesh>
                    ))}
                </>
            )}
            {config.accessory === 'vortex' && config.wings !== 'biplane' && (
                <>
                    {[-0.65, -0.45, -0.25, 0.25, 0.45, 0.65].map((ratio, i) => (
                        <mesh key={i} position={[wingSpan * ratio, 0.05, 0.05]}>
                            <boxGeometry args={[0.015, 0.05, 0.08]} />
                            <meshStandardMaterial color="#222222" metalness={0.8} />
                        </mesh>
                    ))}
                </>
            )}
            {config.accessory === 'intake' && (
                <>
                    {[-0.25, 0.25].map((x, i) => (
                        <mesh key={i} position={[x, fuselageRadius * 0.3, -fuselageLength * 0.3]} rotation={[0.3, 0, 0]}>
                            <boxGeometry args={[0.15, 0.08, 0.2]} />
                            <meshStandardMaterial color="#222222" metalness={0.9} />
                        </mesh>
                    ))}
                </>
            )}

            {/* Nav lights (always present) */}
            <>
                {/* Left wingtip - Red */}
                <mesh position={[-wingSpan, config.wings === 'biplane' ? 0.4 : 0, 0.1]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
                </mesh>
                {/* Right wingtip - Green */}
                <mesh position={[wingSpan, config.wings === 'biplane' ? 0.4 : 0, 0.1]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
                </mesh>
                {/* Tail - White (only if has tail) */}
                {config.tail !== 'none' && (
                    <mesh position={[0, 0.1, fuselageLength / 2 + 0.2]}>
                        <sphereGeometry args={[0.035, 8, 8]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
                    </mesh>
                )}
            </>
        </group>
    )
}

// =====================================================
// STAT BAR COMPONENT
// =====================================================

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
    return (
        <div className="stat-bar">
            <div className="stat-label">
                <span className="stat-icon">{icon}</span>
                <span>{label}</span>
            </div>
            <div className="stat-track">
                <div
                    className="stat-fill"
                    style={{
                        width: `${value}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        boxShadow: `0 0 10px ${color}66`
                    }}
                />
                <span className="stat-value">{value}</span>
            </div>
        </div>
    )
}

// =====================================================
// PART SELECTOR COMPONENT
// =====================================================

function PartSelector<T extends string>({
    options,
    value,
    onChange
}: {
    options: PartOption<T>[]
    value: T
    onChange: (type: T) => void
}) {
    return (
        <div className="part-grid">
            {options.map((opt) => (
                <button
                    key={opt.type}
                    className={`part-card ${value === opt.type ? 'selected' : ''}`}
                    onClick={() => onChange(opt.type)}
                >
                    <span className="part-icon">{opt.icon || '◯'}</span>
                    <span className="part-name">{opt.name}</span>
                    <span className="part-desc">{opt.desc}</span>
                    {(opt.speed !== 0 || opt.agility !== 0 || opt.durability !== 0) && (
                        <div className="part-stats">
                            {opt.speed !== 0 && <span className={opt.speed > 0 ? 'stat-up' : 'stat-down'}>{opt.speed > 0 ? '+' : ''}{opt.speed} SPD</span>}
                            {opt.agility !== 0 && <span className={opt.agility > 0 ? 'stat-up' : 'stat-down'}>{opt.agility > 0 ? '+' : ''}{opt.agility} AGI</span>}
                            {opt.durability !== 0 && <span className={opt.durability > 0 ? 'stat-up' : 'stat-down'}>{opt.durability > 0 ? '+' : ''}{opt.durability} DUR</span>}
                        </div>
                    )}
                </button>
            ))}
        </div>
    )
}

// =====================================================
// CATEGORY TABS
// =====================================================

type TabCategory = 'structure' | 'aero' | 'power' | 'details' | 'colors' | 'saved'

const TABS: { id: TabCategory; name: string; icon: string }[] = [
    { id: 'structure', name: 'Structure', icon: '🏗️' },
    { id: 'aero', name: 'Aerodynamics', icon: '✈️' },
    { id: 'power', name: 'Powerplant', icon: '⚡' },
    { id: 'details', name: 'Details', icon: '✨' },
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'saved', name: 'Saved', icon: '💾' },
]

// =====================================================
// MAIN COMPONENT
// =====================================================

const MAX_HISTORY = 50

export default function PlaneBuilder() {
    const { setGamePhase } = useGameStore()
    const [config, setConfig] = useState<PlaneConfig>(DEFAULT_CONFIG)
    const [activeTab, setActiveTab] = useState<TabCategory>('structure')
    const [savedPlanes, setSavedPlanes] = useState<SavedPlane[]>([])
    const [copySuccess, setCopySuccess] = useState(false)

    // Undo/Redo history
    const [history, setHistory] = useState<PlaneConfig[]>([DEFAULT_CONFIG])
    const [historyIndex, setHistoryIndex] = useState(0)

    const stats = useMemo(() => calculateStats(config), [config])
    const compatibilityWarnings = useMemo(() => checkCompatibility(config), [config])

    // Load saved planes from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('otter-planes-saved')
        if (saved) {
            try {
                setSavedPlanes(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load saved planes:', e)
            }
        }
    }, [])

    // Update config with history tracking
    const updateConfigWithHistory = useCallback((newConfig: PlaneConfig) => {
        setConfig(newConfig)
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(newConfig)
            // Limit history size
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift()
                return newHistory
            }
            return newHistory
        })
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
    }, [historyIndex])

    const updateConfig = <K extends keyof PlaneConfig>(key: K, value: PlaneConfig[K]) => {
        const newConfig = { ...config, [key]: value }
        updateConfigWithHistory(newConfig)
    }

    // Undo
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndex(newIndex)
            setConfig(history[newIndex])
        }
    }, [historyIndex, history])

    // Redo
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            setHistoryIndex(newIndex)
            setConfig(history[newIndex])
        }
    }, [historyIndex, history])

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) {
                    handleRedo()
                } else {
                    handleUndo()
                }
                e.preventDefault()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                handleRedo()
                e.preventDefault()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleUndo, handleRedo])

    const applyPreset = (preset: typeof COLOR_PRESETS[number]) => {
        const newConfig = {
            ...config,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            accentColor: preset.accent,
            glowColor: preset.glow,
        }
        updateConfigWithHistory(newConfig)
    }

    const randomize = () => {
        const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
        const preset = rand(COLOR_PRESETS)
        const newConfig: PlaneConfig = {
            name: `Random ${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            fuselage: rand(FUSELAGE_OPTIONS).type,
            wings: rand(WING_OPTIONS).type,
            tail: rand(TAIL_OPTIONS).type,
            engine: rand(ENGINE_OPTIONS).type,
            nose: rand(NOSE_OPTIONS).type,
            wingtips: rand(WINGTIP_OPTIONS).type,
            gear: rand(GEAR_OPTIONS).type,
            cockpit: rand(COCKPIT_OPTIONS).type,
            decal: rand(DECAL_OPTIONS).type,
            accessory: rand(ACCESSORY_OPTIONS).type,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            accentColor: preset.accent,
            glowColor: preset.glow,
        }
        updateConfigWithHistory(newConfig)
    }

    const handleSave = () => {
        const newPlane: SavedPlane = {
            id: Date.now().toString(),
            config: { ...config },
            savedAt: Date.now(),
        }
        const updated = [...savedPlanes, newPlane]
        setSavedPlanes(updated)
        localStorage.setItem('otter-planes-saved', JSON.stringify(updated))
    }

    const handleLoad = (plane: SavedPlane) => {
        updateConfigWithHistory(plane.config)
        setActiveTab('structure')
    }

    const handleDelete = (id: string) => {
        const updated = savedPlanes.filter(p => p.id !== id)
        setSavedPlanes(updated)
        localStorage.setItem('otter-planes-saved', JSON.stringify(updated))
    }

    const handleBack = () => {
        setGamePhase('lobby')
    }

    // Copy config to clipboard
    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // FLY THIS PLANE button - go to plane selection (custom plane feature TBD)
    const handleFlyThis = () => {
        // Store custom plane config for future use when custom planes are supported
        localStorage.setItem('otter-planes-custom', JSON.stringify(config))
        // For now, go to selection screen - custom plane rendering will be added later
        setGamePhase('selection')
    }

    return (
        <div className="plane-builder">
            {/* HEADER */}
            <header className="builder-header">
                <button className="back-btn" onClick={handleBack}>
                    <span>←</span> Back
                </button>
                <div className="header-title">
                    <h1>PLANE BUILDER</h1>
                    <p>Design your ultimate aircraft</p>
                </div>
                <div className="header-actions">
                    {/* Undo/Redo */}
                    <button
                        className="action-btn undo"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        title="Undo (Ctrl+Z)"
                    >
                        ↶
                    </button>
                    <button
                        className="action-btn redo"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        title="Redo (Ctrl+Y)"
                    >
                        ↷
                    </button>
                    <div className="action-divider" />
                    {/* Copy to Clipboard */}
                    <button
                        className={`action-btn copy ${copySuccess ? 'success' : ''}`}
                        onClick={handleCopyToClipboard}
                        title={copySuccess ? 'Copied!' : 'Copy Config'}
                    >
                        {copySuccess ? '✓' : '📋'}
                    </button>
                    <button className="action-btn randomize" onClick={randomize} title="Random Build">
                        🎲
                    </button>
                    <button className="action-btn save" onClick={handleSave} title="Save Design">
                        💾
                    </button>
                    <div className="action-divider" />
                    {/* FLY THIS */}
                    <button className="action-btn fly-btn" onClick={handleFlyThis} title="Fly This Plane!">
                        ✈️ FLY
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="builder-main">
                {/* 3D PREVIEW SECTION */}
                <section className="preview-section">
                    <div className="preview-canvas">
                        <Canvas camera={{ position: [5, 2.5, 5], fov: 45 }}>
                            <ambientLight intensity={0.4} />
                            <directionalLight position={[8, 8, 5]} intensity={0.9} castShadow />
                            <directionalLight position={[-5, 3, -3]} intensity={0.25} color="#a0c4ff" />
                            <pointLight position={[0, -2, 0]} intensity={0.2} color="#ff6644" />
                            <PlanePreview3D config={config} />
                            <Grid
                                position={[0, -0.6, 0]}
                                args={[12, 12]}
                                cellSize={0.5}
                                cellColor="#223344"
                                sectionColor="#445566"
                                fadeDistance={20}
                            />
                            <Environment preset="sunset" />
                            <OrbitControls
                                enableZoom
                                minDistance={2.5}
                                maxDistance={15}
                                autoRotate
                                autoRotateSpeed={0.8}
                                enablePan={false}
                            />
                        </Canvas>
                    </div>

                    {/* PLANE NAME INPUT */}
                    <div className="name-input-wrapper">
                        <input
                            type="text"
                            className="plane-name-input"
                            value={config.name}
                            onChange={(e) => updateConfig('name', e.target.value)}
                            placeholder="Enter plane name..."
                            maxLength={24}
                        />
                    </div>

                    {/* COMPATIBILITY WARNINGS */}
                    {compatibilityWarnings.length > 0 && (
                        <div className="compatibility-warnings">
                            {compatibilityWarnings.map((warning, i) => (
                                <div key={i} className={`warning-item ${warning.severity}`}>
                                    <span className="warning-icon">
                                        {warning.severity === 'error' ? '⚠️' : '💡'}
                                    </span>
                                    <span>{warning.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STATS DISPLAY */}
                    <div className="stats-panel">
                        <h3>Performance Stats</h3>
                        <StatBar label="Speed" value={stats.speed} color="#00ccff" icon="⚡" />
                        <StatBar label="Agility" value={stats.agility} color="#00ff88" icon="🔄" />
                        <StatBar label="Durability" value={stats.durability} color="#ff8844" icon="🛡️" />
                    </div>
                </section>

                {/* CONFIGURATION SECTION */}
                <section className="config-section">
                    {/* TABS */}
                    <nav className="config-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-name">{tab.name}</span>
                            </button>
                        ))}
                    </nav>

                    {/* TAB CONTENT */}
                    <div className="tab-content">
                        {activeTab === 'structure' && (
                            <div className="config-panel">
                                <div className="panel-section">
                                    <h4>Fuselage</h4>
                                    <PartSelector options={FUSELAGE_OPTIONS} value={config.fuselage} onChange={(v) => updateConfig('fuselage', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Cockpit</h4>
                                    <PartSelector options={COCKPIT_OPTIONS} value={config.cockpit} onChange={(v) => updateConfig('cockpit', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Nose</h4>
                                    <PartSelector options={NOSE_OPTIONS} value={config.nose} onChange={(v) => updateConfig('nose', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'aero' && (
                            <div className="config-panel">
                                <div className="panel-section">
                                    <h4>Wings</h4>
                                    <PartSelector options={WING_OPTIONS} value={config.wings} onChange={(v) => updateConfig('wings', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Wingtips</h4>
                                    <PartSelector options={WINGTIP_OPTIONS} value={config.wingtips} onChange={(v) => updateConfig('wingtips', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Tail</h4>
                                    <PartSelector options={TAIL_OPTIONS} value={config.tail} onChange={(v) => updateConfig('tail', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'power' && (
                            <div className="config-panel">
                                <div className="panel-section">
                                    <h4>Engine</h4>
                                    <PartSelector options={ENGINE_OPTIONS} value={config.engine} onChange={(v) => updateConfig('engine', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Landing Gear</h4>
                                    <PartSelector options={GEAR_OPTIONS} value={config.gear} onChange={(v) => updateConfig('gear', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="config-panel">
                                <div className="panel-section">
                                    <h4>Decals</h4>
                                    <PartSelector options={DECAL_OPTIONS} value={config.decal} onChange={(v) => updateConfig('decal', v)} />
                                </div>
                                <div className="panel-section">
                                    <h4>Accessories</h4>
                                    <PartSelector options={ACCESSORY_OPTIONS} value={config.accessory} onChange={(v) => updateConfig('accessory', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'colors' && (
                            <div className="config-panel colors-panel">
                                <div className="panel-section">
                                    <h4>Color Presets</h4>
                                    <div className="color-presets-grid">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                className="color-preset-btn"
                                                onClick={() => applyPreset(preset)}
                                                title={preset.name}
                                            >
                                                <div className="preset-swatches">
                                                    <span style={{ background: preset.primary }} />
                                                    <span style={{ background: preset.secondary }} />
                                                    <span style={{ background: preset.accent }} />
                                                </div>
                                                <span className="preset-label">{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="panel-section">
                                    <h4>Custom Colors</h4>
                                    <div className="custom-colors">
                                        <label>
                                            <span>Primary</span>
                                            <input type="color" value={config.primaryColor} onChange={(e) => updateConfig('primaryColor', e.target.value)} />
                                        </label>
                                        <label>
                                            <span>Secondary</span>
                                            <input type="color" value={config.secondaryColor} onChange={(e) => updateConfig('secondaryColor', e.target.value)} />
                                        </label>
                                        <label>
                                            <span>Accent</span>
                                            <input type="color" value={config.accentColor} onChange={(e) => updateConfig('accentColor', e.target.value)} />
                                        </label>
                                        <label>
                                            <span>Glow</span>
                                            <input type="color" value={config.glowColor} onChange={(e) => updateConfig('glowColor', e.target.value)} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="config-panel saved-panel">
                                {savedPlanes.length === 0 ? (
                                    <div className="empty-saved">
                                        <span className="empty-icon">📁</span>
                                        <p>No saved planes yet!</p>
                                        <p className="empty-hint">Design a plane and click 💾 to save it.</p>
                                    </div>
                                ) : (
                                    <div className="saved-list">
                                        {savedPlanes.map(plane => (
                                            <div key={plane.id} className="saved-plane-card">
                                                <div className="saved-plane-colors">
                                                    <span style={{ background: plane.config.primaryColor }} />
                                                    <span style={{ background: plane.config.secondaryColor }} />
                                                    <span style={{ background: plane.config.accentColor }} />
                                                </div>
                                                <div className="saved-plane-info">
                                                    <span className="saved-name">{plane.config.name}</span>
                                                    <span className="saved-date">{new Date(plane.savedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="saved-plane-actions">
                                                    <button onClick={() => handleLoad(plane)} title="Load">📂</button>
                                                    <button onClick={() => handleDelete(plane.id)} title="Delete">🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* FOOTER INFO */}
            <footer className="builder-footer">
                <span>💡 Parts affect your plane's speed, agility, and durability</span>
                <span>🔄 Drag to rotate • Scroll to zoom</span>
            </footer>
        </div>
    )
}
