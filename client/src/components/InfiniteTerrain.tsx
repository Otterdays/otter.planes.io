import { useMemo } from 'react'
import * as THREE from 'three'

export default function InfiniteTerrain() {
  // Load a high-quality seamless grass texture
  const grassTexture = useMemo(() => {
    const textureLoader = new THREE.TextureLoader()

    // Use a high-quality seamless grass texture
    const texture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/grasslight-big.jpg',
      (tex) => {
        // Texture loaded successfully
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(150, 150)
        tex.anisotropy = 16
        // LinearMipMapNearestFilter prevents flickering at shallow angles
        // by snapping to mipmap levels instead of blending between them
        tex.minFilter = THREE.LinearMipMapNearestFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
      },
      undefined,
      () => {
        console.log('Grass texture failed to load, using fallback')
      }
    )

    // Set properties immediately too (for initial render)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(150, 150)
    texture.anisotropy = 16
    texture.minFilter = THREE.LinearMipMapNearestFilter
    texture.magFilter = THREE.LinearFilter

    return texture
  }, [])

  // STATIC ground - no useFrame, no movement
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[30000, 30000]} />
      <meshStandardMaterial
        map={grassTexture}
        color="#bbbbbb"
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  )
}
