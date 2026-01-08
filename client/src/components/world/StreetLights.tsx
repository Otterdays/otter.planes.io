import { useMemo, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { ROAD_NETWORK } from '../../config/worldLocations'

// =====================================================
// STREET LIGHTS - Modern Gamma-Style LED Lights
// Procedurally placed along all roads
// Low-poly instanced mesh for high performance
// =====================================================

// CONFIG
const SPACING = 50 // Distance between lights
const OFFSET_FROM_EDGE = 1.5 // Distance from road edge
const POLE_HEIGHT = 8
const ARM_LENGTH = 3
const POLE_THICKNESS = 0.3

// Reusable geometry and material
const poleGeom = new THREE.CylinderGeometry(POLE_THICKNESS, POLE_THICKNESS, POLE_HEIGHT, 6)
poleGeom.translate(0, POLE_HEIGHT / 2, 0) // Pivot at base

const armGeom = new THREE.BoxGeometry(POLE_THICKNESS, POLE_THICKNESS, ARM_LENGTH)
armGeom.translate(0, POLE_HEIGHT - (POLE_THICKNESS / 2), ARM_LENGTH / 2 - (POLE_THICKNESS / 2))

const lightHeadGeom = new THREE.BoxGeometry(0.4, 0.1, 1.5)
lightHeadGeom.translate(0, POLE_HEIGHT - 0.2, ARM_LENGTH - 0.5)

const poleMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.3,
    metalness: 0.8
})

const lightMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffff',
    emissive: '#aaffff',
    emissiveIntensity: 2,
    toneMapped: false
})

export default function StreetLights() {
    const poleRef = useRef<THREE.InstancedMesh>(null)
    const armRef = useRef<THREE.InstancedMesh>(null)
    const headRef = useRef<THREE.InstancedMesh>(null)

    // Calculate all light positions
    const transforms = useMemo(() => {
        const instances: { position: THREE.Vector3, rotation: number }[] = []

        ROAD_NETWORK.forEach(road => {
            const start = new THREE.Vector3(road.start[0], 0, road.start[2])
            const end = new THREE.Vector3(road.end[0], 0, road.end[2])

            const direction = new THREE.Vector3().subVectors(end, start)
            const length = direction.length()
            const angle = Math.atan2(direction.z, direction.x)

            // Normalized direction for stepping
            const stepVec = direction.clone().normalize()

            // Perpendicular vector for offset (rotate 90 deg around Y)
            const perpVec = new THREE.Vector3(-stepVec.z, 0, stepVec.x)

            // Calculate offset based on road width
            const sideOffset = (road.width || 8) / 2 + OFFSET_FROM_EDGE

            // Number of lights for this segment
            const count = Math.floor(length / SPACING)

            for (let i = 0; i <= count; i++) {
                // Determine side (Zig-zag pattern? or Single side? Let's do Single Side for freeway look, Double for wide)
                // Let's do alternating sides for visual balance
                const isLeft = i % 2 === 0
                const sideMultiplier = isLeft ? 1 : -1

                // Current position along line
                const progress = i * SPACING

                // Don't place light if too close to end (intersection clutter)
                if (progress > length - 10) continue
                if (progress < 10) continue

                // Base position on center line
                const pos = new THREE.Vector3().copy(start).add(stepVec.clone().multiplyScalar(progress))

                // Offset to side
                pos.add(perpVec.clone().multiplyScalar(sideOffset * sideMultiplier))

                // Rotation: Face the road
                // Since angle is direction of road, adding/subbing 90 deg makes it face inward
                const rot = -angle + (isLeft ? -Math.PI / 2 : Math.PI / 2)

                instances.push({ position: pos, rotation: rot })
            }
        })

        return instances
    }, [])

    useLayoutEffect(() => {
        if (!poleRef.current || !armRef.current || !headRef.current) return

        const tempObj = new THREE.Object3D()

        transforms.forEach((trans, i) => {
            tempObj.position.copy(trans.position)
            // Fix height to ground
            tempObj.position.y = 0

            tempObj.rotation.set(0, trans.rotation, 0)
            tempObj.updateMatrix()

            poleRef.current!.setMatrixAt(i, tempObj.matrix)
            armRef.current!.setMatrixAt(i, tempObj.matrix)
            headRef.current!.setMatrixAt(i, tempObj.matrix)
        })

        poleRef.current.instanceMatrix.needsUpdate = true
        armRef.current.instanceMatrix.needsUpdate = true
        headRef.current.instanceMatrix.needsUpdate = true

    }, [transforms])

    return (
        <group>
            <instancedMesh ref={poleRef} args={[poleGeom, poleMaterial, transforms.length]} castShadow receiveShadow />
            <instancedMesh ref={armRef} args={[armGeom, poleMaterial, transforms.length]} castShadow receiveShadow />
            <instancedMesh ref={headRef} args={[lightHeadGeom, lightMaterial, transforms.length]} />
        </group>
    )
}
