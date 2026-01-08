import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// CLOUD FOG - Immersive fog effect when flying through clouds
// =====================================================

export default function CloudFog() {
    const { scene, camera } = useThree()

    // Cloud layer boundaries
    const CLOUD_MIN_ALT = 350  // Below clouds
    const CLOUD_MAX_ALT = 850  // Above clouds
    const CLOUD_CORE_MIN = 400 // Dense cloud zone
    const CLOUD_CORE_MAX = 800 // Dense cloud zone

    useFrame(() => {
        const altitude = camera.position.y

        // Check if we're in cloud layer
        if (altitude >= CLOUD_MIN_ALT && altitude <= CLOUD_MAX_ALT) {
            // Calculate fog density based on how deep into clouds we are
            let density = 0

            if (altitude >= CLOUD_CORE_MIN && altitude <= CLOUD_CORE_MAX) {
                // In the dense core - maximum fog
                density = 1
            } else if (altitude < CLOUD_CORE_MIN) {
                // Entering clouds from below
                density = (altitude - CLOUD_MIN_ALT) / (CLOUD_CORE_MIN - CLOUD_MIN_ALT)
            } else {
                // Exiting clouds above
                density = (CLOUD_MAX_ALT - altitude) / (CLOUD_MAX_ALT - CLOUD_CORE_MAX)
            }

            // Apply fog effect
            if (!scene.fog || !(scene.fog instanceof THREE.Fog)) {
                scene.fog = new THREE.Fog('#e8f0ff', 10, 5000)
            }

            // Interpolate fog distance based on density
            // Dense fog: near=10, far=150 (thick white-out)
            // Light fog: near=100, far=2000 (subtle haze)
            const nearMin = 10
            const nearMax = 500
            const farMin = 150
            const farMax = 5000

            const near = nearMax - (nearMax - nearMin) * density
            const far = farMax - (farMax - farMin) * density

            scene.fog = new THREE.Fog('#e8f0ff', near, far)

        } else {
            // Outside clouds - restore normal atmospheric fog
            scene.fog = new THREE.Fog('#c8d8e8', 3000, 15000)
        }
    })

    return null // This component only applies fog effects
}
