// =====================================================
// CONTROL SURFACE - Animated aileron/elevator/rudder
// =====================================================

interface ControlSurfaceProps {
    position: [number, number, number]
    size: [number, number, number]
    color: string
    deflection?: number
    axis?: 'x' | 'y' | 'z'
}

export function ControlSurface({
    position,
    size,
    color,
    deflection = 0,
    axis = 'x',
}: ControlSurfaceProps) {
    const rotation: [number, number, number] = [0, 0, 0]
    const maxDeflection = 0.3 // ~17 degrees

    if (axis === 'x') rotation[0] = deflection * maxDeflection
    if (axis === 'y') rotation[1] = deflection * maxDeflection
    if (axis === 'z') rotation[2] = deflection * maxDeflection

    return (
        <mesh position={position} rotation={rotation}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}
