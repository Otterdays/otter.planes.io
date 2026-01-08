import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'

// =====================================================
// RUNWAY - Main airport runway with markings
// =====================================================

export default function Runway() {
    const length = 200
    const width = 5

    const runwayTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 512
        const ctx = canvas.getContext('2d')!

        // Base asphalt color
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(0, 0, 2048, 512)

        // Add asphalt texture noise
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 2048
            const y = Math.random() * 512
            ctx.fillStyle = `rgba(${30 + Math.random() * 20}, ${30 + Math.random() * 20}, ${30 + Math.random() * 20}, 0.5)`
            ctx.fillRect(x, y, 2, 2)
        }

        // Center line (dashed white)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.setLineDash([60, 40])
        ctx.beginPath()
        ctx.moveTo(0, 256)
        ctx.lineTo(2048, 256)
        ctx.stroke()

        // Edge lines (solid white)
        ctx.setLineDash([])
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(0, 30)
        ctx.lineTo(2048, 30)
        ctx.moveTo(0, 482)
        ctx.lineTo(2048, 482)
        ctx.stroke()

        // Threshold markings
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 8; i++) {
            const y = 60 + i * 50
            ctx.fillRect(30, y, 80, 30)
            ctx.fillRect(1938, y, 80, 30)
        }

        // Runway numbers
        ctx.font = 'bold 120px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('09', 200, 300)

        ctx.save()
        ctx.translate(1848, 256)
        ctx.rotate(Math.PI)
        ctx.fillText('27', 0, 44)
        ctx.restore()

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        return texture
    }, [])

    return (
        <group position={[0, 0.08, 0]}>
            {/* Main runway surface - raised to prevent z-fighting with ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[length, width]} />
                <meshStandardMaterial
                    map={runwayTexture}
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Runway edge lights */}
            <RunwayLights length={length} width={width} />

            {/* Taxiway connector */}
            <mesh position={[30, 0, width / 2 + 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 3]} />
                <meshStandardMaterial color="#333333" roughness={0.9} />
            </mesh>

            {/* Holding point markings */}
            <mesh position={[30, 0.01, width / 2 + 3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 0.3]} />
                <meshStandardMaterial color="#ffcc00" />
            </mesh>
        </group>
    )
}

function RunwayLights({ length, width }: { length: number; width: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const count = 80 // 40 per side
    const spacing = length / 40

    const tempObject = useMemo(() => new THREE.Object3D(), [])

    useEffect(() => {
        if (!meshRef.current) return

        let idx = 0
        for (let i = 0; i < 40; i++) {
            const x = -length / 2 + i * spacing + spacing / 2

            // Left edge
            tempObject.position.set(x, 0.1, -width / 2 - 0.3)
            tempObject.scale.setScalar(0.15)
            tempObject.updateMatrix()
            meshRef.current.setMatrixAt(idx++, tempObject.matrix)

            // Right edge
            tempObject.position.set(x, 0.1, width / 2 + 0.3)
            tempObject.updateMatrix()
            meshRef.current.setMatrixAt(idx++, tempObject.matrix)
        }

        meshRef.current.instanceMatrix.needsUpdate = true
    }, [length, width, spacing, tempObject])

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#ffff88"
                emissive="#ffff44"
                emissiveIntensity={0.5}
            />
        </instancedMesh>
    )
}
