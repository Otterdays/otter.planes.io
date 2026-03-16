import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import PlaneModel, { PlaneVariant } from './PlaneModel'
import './PlaneSelection.css'

// Aircraft categories/types
type PlaneCategory = 'all' | 'wwi' | 'wwii' | 'jets' | 'commercial' | 'special'

const CATEGORIES: { id: PlaneCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '✦' },
    { id: 'wwi', label: 'WWI', icon: '✠' },
    { id: 'wwii', label: 'WWII', icon: '★' },
    { id: 'jets', label: 'Jets', icon: '▶' },
    { id: 'commercial', label: 'Civil', icon: '◈' },
    { id: 'special', label: 'Special', icon: '🦦' },
]

// Map planes to their categories
const PLANE_CATEGORIES: Record<PlaneVariant, PlaneCategory[]> = {
    biplane: ['wwi'],
    sopwith: ['wwi'],
    spad: ['wwi'],
    ww2: ['wwii'],
    jet: ['jets'],
    interceptor: ['jets'],
    stealth: ['jets'],
    boeing747: ['commercial'],
    otter: ['special'],
    tungtung: ['special'],
    claude: ['special'],
    gpt: ['special'],
}

const PLANE_INFO: Record<PlaneVariant, { name: string; description: string; stats: { speed: number; agility: number; durability: number } }> = {
    ww2: {
        name: 'P-51 Mustang',
        description: 'Classic WWII fighter with balanced performance. A reliable all-rounder.',
        stats: { speed: 70, agility: 75, durability: 80 },
    },
    jet: {
        name: 'F-22 Raptor',
        description: 'Modern stealth fighter with superior speed. High performance, challenging to master.',
        stats: { speed: 95, agility: 85, durability: 65 },
    },
    biplane: {
        name: 'Fokker Dr.I',
        description: 'The Red Baron\'s legendary triplane. Slow but turns on a dime.',
        stats: { speed: 42, agility: 98, durability: 55 },
    },
    sopwith: {
        name: 'Sopwith Camel',
        description: 'British WWI ace. Quick roll, twin Vickers, and that distinctive hump.',
        stats: { speed: 48, agility: 95, durability: 58 },
    },
    spad: {
        name: 'SPAD XIII',
        description: 'French speed demon. The fastest Allied fighter of WWI with deadly firepower.',
        stats: { speed: 58, agility: 82, durability: 65 },
    },
    boeing747: {
        name: 'Boeing 747',
        description: 'Jumbo jet airliner. Massive, slow, and majestic. For the patient pilot.',
        stats: { speed: 80, agility: 25, durability: 95 },
    },
    stealth: {
        name: 'B-2 Spirit',
        description: 'Flying wing stealth bomber. Wide wingspan, stable, and nearly invisible.',
        stats: { speed: 75, agility: 40, durability: 70 },
    },
    interceptor: {
        name: 'MiG-21',
        description: 'Cold War delta interceptor. Lightning fast with extreme acceleration.',
        stats: { speed: 98, agility: 70, durability: 55 },
    },
    otter: {
        name: 'Otterly Ridiculous',
        description: 'A funky otter-shaped aircraft! Webbed paw wings, wagging tail, and fish decorations. Pure joy.',
        stats: { speed: 65, agility: 88, durability: 75 },
    },
    tungtung: {
        name: 'Tung Tung Air',
        description: 'TUNG TUNG TUNG SAHUR! The legendary wooden cylinder man takes flight. Bat propeller, flailing arms, dangling legs. Peak brain rot.',
        stats: { speed: 77, agility: 69, durability: 100 },
    },
    claude: {
        name: 'Claude AI',
        description: 'Anthropic\'s thinking machine takes to the skies! Neural network glow, thought orbs, and twin stabilizers for maximum safety. Helpful, harmless, and honest... at Mach 2.',
        stats: { speed: 85, agility: 80, durability: 90 },
    },
    gpt: {
        name: 'GPT Plane',
        description: 'A fast-talking AI interceptor with a glowing token ring, emerald circuits, and twin engines built for rapid iteration in the sky.',
        stats: { speed: 92, agility: 84, durability: 82 },
    },
}

const VARIANTS: PlaneVariant[] = ['ww2', 'jet', 'biplane', 'sopwith', 'spad', 'boeing747', 'stealth', 'interceptor', 'otter', 'tungtung', 'claude', 'gpt']

function StatBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="stat-bar">
            <span className="stat-label">{label}</span>
            <div className="stat-track">
                <div className="stat-fill" style={{ width: `${value}%` }} />
            </div>
            <span className="stat-value">{value}</span>
        </div>
    )
}

// Scale factors to fit larger planes in preview
const PREVIEW_SCALE: Partial<Record<PlaneVariant, number>> = {
    boeing747: 0.45,
    stealth: 0.55,
    jet: 0.85,
    interceptor: 0.9,
    claude: 0.8,
    gpt: 0.82,
}

function PlanePreview({ variant }: { variant: PlaneVariant }) {
    const scale = PREVIEW_SCALE[variant] || 1

    return (
        <Canvas camera={{ position: [5, 2.5, 5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#a0c4ff" />
            <group scale={[scale, scale, scale]}>
                <PlaneModel
                    variant={variant}
                    controlInputs={{ pitch: 0, roll: 0, yaw: 0, throttle: 0.5 }}
                />
            </group>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
    )
}

export default function PlaneSelection() {
    const { selectedPlane, setSelectedPlane, setGamePhase } = useGameStore()
    const [selectedCategory, setSelectedCategory] = useState<PlaneCategory>('all')
    const info = PLANE_INFO[selectedPlane]

    // Filter planes by category
    const filteredVariants = selectedCategory === 'all'
        ? VARIANTS
        : VARIANTS.filter(v => PLANE_CATEGORIES[v]?.includes(selectedCategory))

    // Ensure selected plane is in filtered list, or select first of filtered
    const currentVariants = filteredVariants.length > 0 ? filteredVariants : VARIANTS
    if (!currentVariants.includes(selectedPlane) && currentVariants.length > 0) {
        setSelectedPlane(currentVariants[0])
    }

    const handleConfirm = () => {
        setGamePhase('flying')
    }

    const handlePrevious = () => {
        const currentIndex = currentVariants.indexOf(selectedPlane)
        const prevIndex = (currentIndex - 1 + currentVariants.length) % currentVariants.length
        setSelectedPlane(currentVariants[prevIndex])
    }

    const handleNext = () => {
        const currentIndex = currentVariants.indexOf(selectedPlane)
        const nextIndex = (currentIndex + 1) % currentVariants.length
        setSelectedPlane(currentVariants[nextIndex])
    }

    return (
        <div className="plane-selection">
            <div className="selection-header">
                <h1>SELECT YOUR AIRCRAFT</h1>
                <p className="subtitle">Choose wisely, pilot.</p>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-label">{cat.label}</span>
                    </button>
                ))}
            </div>

            <div className="selection-content">
                {/* Left Arrow */}
                <button className="nav-arrow nav-arrow-left" onClick={handlePrevious}>
                    <span>‹</span>
                </button>

                {/* 3D Preview */}
                <div className="plane-preview-container">
                    <div className="plane-preview">
                        <PlanePreview variant={selectedPlane} />
                    </div>
                    <div className="plane-indicators">
                        {currentVariants.map((v) => (
                            <button
                                key={v}
                                className={`indicator ${v === selectedPlane ? 'active' : ''}`}
                                onClick={() => setSelectedPlane(v)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Arrow */}
                <button className="nav-arrow nav-arrow-right" onClick={handleNext}>
                    <span>›</span>
                </button>

                {/* Plane Info Panel */}
                <div className="plane-info-panel">
                    <h2 className="plane-name">{info.name}</h2>
                    <p className="plane-description">{info.description}</p>

                    <div className="plane-stats">
                        <StatBar label="SPEED" value={info.stats.speed} />
                        <StatBar label="AGILITY" value={info.stats.agility} />
                        <StatBar label="DURABILITY" value={info.stats.durability} />
                    </div>

                    <button className="confirm-button" onClick={handleConfirm}>
                        <span className="button-icon">✈</span>
                        TAKE OFF
                    </button>
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="keyboard-hints">
                <span><kbd>←</kbd> <kbd>→</kbd> Navigate</span>
                <span><kbd>Enter</kbd> Confirm</span>
            </div>
        </div>
    )
}
