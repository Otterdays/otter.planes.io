import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ClaudeModel } from './planes/ClaudeModel'
import { GPTModel } from './planes/GPTModel'

// =====================================================
// PLANE CONFIGURATION TYPES
// =====================================================

export type PlaneVariant = 'ww2' | 'jet' | 'biplane' | 'boeing747' | 'stealth' | 'interceptor' | 'sopwith' | 'spad' | 'otter' | 'tungtung' | 'claude' | 'gpt'

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

interface PlaneModelProps {
  variant?: PlaneVariant
  colors?: PlaneColors
  controlInputs?: ControlInputs
  showPropeller?: boolean
}

// =====================================================
// VARIANT CONFIGURATIONS
// =====================================================

const VARIANT_COLORS: Record<PlaneVariant, PlaneColors> = {
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
  gpt: { primary: '#111817', secondary: '#10a37f', accent: '#d7fff5' },
}

const DEFAULT_INPUTS: ControlInputs = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0.2,
}

// =====================================================
// SHARED COMPONENTS
// =====================================================

function Propeller({ rpm = 30, variant }: { rpm: number; variant: PlaneVariant }) {
  const propRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (propRef.current) {
      propRef.current.rotation.z += delta * rpm
    }
  })

  const bladeCount = variant === 'biplane' ? 2 : 3
  const bladeAngles = Array.from({ length: bladeCount }, (_, i) => (360 / bladeCount) * i)

  return (
    <group ref={propRef}>
      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Blades */}
      {bladeAngles.map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.05,
            Math.sin((angle * Math.PI) / 180) * 0.05,
            0,
          ]}
          rotation={[0, 0, (angle * Math.PI) / 180]}
        >
          <boxGeometry args={[0.08, 1.2, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// Blinking navigation light component
function BlinkingLight({
  position,
  color,
  size = 0.05,
  blinkRate = 1.5
}: {
  position: [number, number, number]
  color: string
  size?: number
  blinkRate?: number
}) {
  const lightRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Smooth sine wave blink with configurable rate
      const intensity = (Math.sin(clock.getElapsedTime() * blinkRate * Math.PI * 2) + 1) * 0.5
      materialRef.current.emissiveIntensity = 0.2 + intensity * 0.8
    }
  })

  return (
    <mesh ref={lightRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  )
}

function ControlSurface({
  position,
  size,
  color,
  deflection = 0,
  axis = 'x',
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  deflection?: number
  axis?: 'x' | 'y' | 'z'
}) {
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

// =====================================================
// WW2 FIGHTER MODEL
// =====================================================

function WW2Model({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const propRPM = 10 + inputs.throttle * 50

  return (
    <group>
      {/* Main Fuselage */}
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.45, 2.5]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.35, 0.12, 2.2]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.4, 0.08, 2.3]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Nose section */}
        <mesh position={[0, 0, -1.4]}>
          <boxGeometry args={[0.4, 0.38, 0.6]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Engine cowling */}
        <mesh position={[0, 0, -1.65]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.3, 12]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* Nose cone (spinner) */}
      <mesh position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.4, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Cockpit canopy */}
      <mesh position={[0, 0.22, 0.2]}>
        <sphereGeometry args={[0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.5}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Main Wings with animated ailerons */}
      <group position={[0, -0.08, 0.15]}>
        {/* Left wing */}
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[2.2, 0.1, 0.8]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-2.5, 0.02, 0.05]} rotation={[0, 0.15, -0.08]}>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Right wing */}
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[2.2, 0.1, 0.8]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[2.5, 0.02, 0.05]} rotation={[0, -0.15, 0.08]}>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Animated Ailerons */}
        <ControlSurface
          position={[-2.2, -0.03, 0.25]}
          size={[0.7, 0.04, 0.2]}
          color={colors.secondary}
          deflection={inputs.roll}
          axis="x"
        />
        <ControlSurface
          position={[2.2, -0.03, 0.25]}
          size={[0.7, 0.04, 0.2]}
          color={colors.secondary}
          deflection={-inputs.roll}
          axis="x"
        />

        {/* Navigation Lights */}
        <mesh position={[-2.85, 0.02, 0.1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[2.85, 0.02, 0.1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Tail section */}
      <mesh position={[0, 0, 1.4]}>
        <boxGeometry args={[0.35, 0.3, 0.7]} />
        <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Horizontal stabilizers with animated elevator */}
      <group position={[0, 0, 1.8]}>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.4]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.4]} />
          <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Animated Elevators */}
        <ControlSurface
          position={[-0.5, 0, 0.18]}
          size={[0.5, 0.03, 0.1]}
          color={colors.secondary}
          deflection={inputs.pitch}
          axis="x"
        />
        <ControlSurface
          position={[0.5, 0, 0.18]}
          size={[0.5, 0.03, 0.1]}
          color={colors.secondary}
          deflection={inputs.pitch}
          axis="x"
        />
      </group>

      {/* Vertical stabilizer with animated rudder */}
      <mesh position={[0, 0.35, 1.75]}>
        <boxGeometry args={[0.06, 0.7, 0.5]} />
        <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
      </mesh>
      <ControlSurface
        position={[0, 0.35, 1.95]}
        size={[0.04, 0.6, 0.15]}
        color={colors.secondary}
        deflection={inputs.yaw}
        axis="y"
      />

      {/* Tail light */}
      <mesh position={[0, 0.65, 1.85]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>

      {/* Propeller */}
      <group position={[0, 0, -2.05]}>
        <Propeller rpm={propRPM} variant="ww2" />
      </group>

      {/* Landing gear */}
      <LandingGear />

      {/* Exhaust pipes */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, -0.1, -0.8]}>
          {[0, 0.12, 0.24].map((z, j) => (
            <mesh key={j} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.03, 0.08, 6]} />
              <meshStandardMaterial
                color="#2a2a2a"
                metalness={0.9}
                emissive="#ff4400"
                emissiveIntensity={0.2 + inputs.throttle * 0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// =====================================================
// JET FIGHTER MODEL (F-22 Raptor style)
// Dimensions: Length 19m, Wingspan 13.6m, Height 5m
// Scale: 1 unit = 1m, scaled to ~4 units length
// =====================================================

function JetModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  // F-22 proportions: L:W:H = 19:13.6:5 → scaled to 4:2.86:1.05
  const length = 4
  const wingspan = 2.86
  const height = 1.05

  return (
    <group>
      {/* Main fuselage - tapered box with proper aspect ratio */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.4, length * 0.7]} />
        <meshStandardMaterial color={colors.primary} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Forward fuselage - narrower */}
      <mesh position={[0, 0.02, -length * 0.35]}>
        <boxGeometry args={[0.4, 0.35, length * 0.35]} />
        <meshStandardMaterial color={colors.primary} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Nose cone - radome */}
      <mesh position={[0, 0, -length * 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 6]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cockpit canopy - bubble style */}
      <group position={[0, 0.22, -length * 0.15]}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1a2a3a" transparent opacity={0.65} metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Canopy frame */}
        <mesh position={[0, 0.05, 0.15]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.3]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.8} />
        </mesh>
      </group>

      {/* Main wings - trapezoidal with 42° sweep */}
      <group position={[0, -0.08, 0.2]}>
        {/* Left wing - angled using trigonometry: tan(42°) ≈ 0.9 */}
        <mesh position={[-wingspan * 0.35, 0, 0.3]} rotation={[0, 0.42, -0.03]}>
          <boxGeometry args={[wingspan * 0.55, 0.05, 1.1]} />
          <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Wing tip - swept back */}
        <mesh position={[-wingspan * 0.48, 0.01, 0.55]} rotation={[0, 0.7, -0.05]}>
          <boxGeometry args={[wingspan * 0.15, 0.04, 0.4]} />
          <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Right wing */}
        <mesh position={[wingspan * 0.35, 0, 0.3]} rotation={[0, -0.42, 0.03]}>
          <boxGeometry args={[wingspan * 0.55, 0.05, 1.1]} />
          <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[wingspan * 0.48, 0.01, 0.55]} rotation={[0, -0.7, 0.05]}>
          <boxGeometry args={[wingspan * 0.15, 0.04, 0.4]} />
          <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Ailerons */}
        <ControlSurface position={[-wingspan * 0.42, -0.02, 0.7]} size={[0.5, 0.03, 0.25]} color={colors.secondary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[wingspan * 0.42, -0.02, 0.7]} size={[0.5, 0.03, 0.25]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

        {/* Nav lights */}
        <mesh position={[-wingspan * 0.52, 0, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[wingspan * 0.52, 0, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Twin vertical stabilizers - canted outward 27° */}
      <mesh position={[-0.25, height * 0.35, length * 0.35]} rotation={[0.1, 0, -0.47]}>
        <boxGeometry args={[0.04, height * 0.5, 0.45]} />
        <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.25, height * 0.35, length * 0.35]} rotation={[0.1, 0, 0.47]}>
        <boxGeometry args={[0.04, height * 0.5, 0.45]} />
        <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Horizontal stabilizers with elevators */}
      <group position={[0, -0.02, length * 0.4]}>
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.7, 0.035, 0.35]} />
          <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0.45, 0, 0]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.7, 0.035, 0.35]} />
          <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
        </mesh>
        <ControlSurface position={[-0.5, 0, 0.15]} size={[0.4, 0.025, 0.12]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
        <ControlSurface position={[0.5, 0, 0.15]} size={[0.4, 0.025, 0.12]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
      </group>

      {/* Twin engine exhausts */}
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, -0.05, length * 0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.25, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.95} emissive={colors.accent} emissiveIntensity={inputs.throttle * 0.7} />
          </mesh>
          {/* Afterburner */}
          {inputs.throttle > 0.65 && (
            <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.1, 0.4 + inputs.throttle * 0.4, 8]} />
              <meshBasicMaterial color="#ff5500" transparent opacity={0.5 + inputs.throttle * 0.4} />
            </mesh>
          )}
        </group>
      ))}

      <LandingGear />
    </group>
  )
}

// =====================================================
// STEALTH BOMBER MODEL (B-2 Spirit style flying wing)
// Dimensions: Length 21m, Wingspan 52m, Height 5.2m
// Scale: 1 unit ≈ 5m for gameplay
// =====================================================

function StealthModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  // B-2 has extreme wingspan - scaled for game: wingspan 6, length 2.5
  const wingspan = 5.5
  const length = 2.8

  // Flying wing angle calculations
  const sweepAngle = 33 * (Math.PI / 180) // 33° leading edge sweep
  const wingChord = 1.2

  return (
    <group>
      {/* Central body - blended wing body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.25, length * 0.6]} />
        <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.4} flatShading />
      </mesh>

      {/* Forward nose - pointed */}
      <mesh position={[0, 0.02, -length * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.55, 0.6, 4]} />
        <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.4} flatShading />
      </mesh>

      {/* Left wing section - using sweep angle */}
      <group position={[-wingspan * 0.25, 0, Math.tan(sweepAngle) * wingspan * 0.25]}>
        <mesh rotation={[0, sweepAngle, -0.02]}>
          <boxGeometry args={[wingspan * 0.45, 0.12, wingChord]} />
          <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
        </mesh>
        {/* Outer wing taper */}
        <mesh position={[-wingspan * 0.22, 0, 0.25]} rotation={[0, sweepAngle + 0.3, -0.03]}>
          <boxGeometry args={[wingspan * 0.15, 0.08, 0.6]} />
          <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
        </mesh>
      </group>

      {/* Right wing section */}
      <group position={[wingspan * 0.25, 0, Math.tan(sweepAngle) * wingspan * 0.25]}>
        <mesh rotation={[0, -sweepAngle, 0.02]}>
          <boxGeometry args={[wingspan * 0.45, 0.12, wingChord]} />
          <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
        </mesh>
        <mesh position={[wingspan * 0.22, 0, 0.25]} rotation={[0, -sweepAngle - 0.3, 0.03]}>
          <boxGeometry args={[wingspan * 0.15, 0.08, 0.6]} />
          <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
        </mesh>
      </group>

      {/* Elevons (combined elevator/aileron) */}
      <ControlSurface position={[-wingspan * 0.35, -0.05, length * 0.15]} size={[0.8, 0.04, 0.2]} color={colors.secondary} deflection={inputs.roll + inputs.pitch * 0.5} axis="x" />
      <ControlSurface position={[wingspan * 0.35, -0.05, length * 0.15]} size={[0.8, 0.04, 0.2]} color={colors.secondary} deflection={-inputs.roll + inputs.pitch * 0.5} axis="x" />

      {/* Split drag rudders (yaw via differential) */}
      <mesh position={[-wingspan * 0.18, 0.08, length * 0.25]} rotation={[0.1 + inputs.yaw * 0.2, 0.15, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.3]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.5} />
      </mesh>
      <mesh position={[wingspan * 0.18, 0.08, length * 0.25]} rotation={[0.1 - inputs.yaw * 0.2, -0.15, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.3]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.5} />
      </mesh>

      {/* Cockpit windows - narrow slit */}
      <mesh position={[0, 0.14, -length * 0.15]}>
        <boxGeometry args={[0.6, 0.08, 0.3]} />
        <meshStandardMaterial color="#0a1520" transparent opacity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Engine intakes (top-mounted, hidden from below) */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.08, -0.1]}>
          <boxGeometry args={[0.25, 0.1, 0.4]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.7} />
        </mesh>
      ))}

      {/* Engine exhausts (buried in trailing edge) */}
      {[-0.35, 0.35].map((x, i) => (
        <group key={i} position={[x, -0.02, length * 0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} emissive="#332200" emissiveIntensity={inputs.throttle * 0.4} />
          </mesh>
        </group>
      ))}

      {/* Nav lights (minimal) */}
      <mesh position={[-wingspan * 0.48, 0, length * 0.1]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[wingspan * 0.48, 0, length * 0.1]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.6} />
      </mesh>

      <LandingGear />
    </group>
  )
}

// =====================================================
// INTERCEPTOR MODEL (MiG-style delta wing)
// Dimensions: Length 17m, Wingspan 8.2m, Height 4.7m
// Fast, agile, single engine with prominent intake
// =====================================================

function InterceptorModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const length = 3.5
  const wingspan = 1.7
  const fuselageRadius = 0.28

  return (
    <group>
      {/* Cylindrical fuselage - MiG style */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[fuselageRadius, fuselageRadius * 0.9, length * 0.6, 12]} />
        <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Forward fuselage taper */}
      <mesh position={[0, 0, -length * 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[fuselageRadius * 0.85, fuselageRadius * 0.5, length * 0.25, 12]} />
        <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Nose cone - pitot tube */}
      <mesh position={[0, 0, -length * 0.52]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[fuselageRadius * 0.45, 0.35, 10]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Pitot probe */}
      <mesh position={[0, 0, -length * 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.9} />
      </mesh>

      {/* Cockpit canopy - teardrop */}
      <group position={[0, fuselageRadius * 0.7, -length * 0.15]}>
        <mesh rotation={[0.15, 0, 0]}>
          <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#1a2535" transparent opacity={0.7} metalness={0.92} roughness={0.08} />
        </mesh>
      </group>

      {/* Prominent chin intake (MiG-21 style) */}
      <mesh position={[0, -fuselageRadius * 0.6, -length * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.35, 12]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.8} />
      </mesh>
      {/* Intake cone (shock cone) */}
      <mesh position={[0, -fuselageRadius * 0.6, -length * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.95} />
      </mesh>

      {/* Delta wings - 57° sweep angle */}
      <group position={[0, -0.05, 0.15]}>
        {/* Left wing - thin delta profile */}
        <mesh position={[-wingspan * 0.4, 0, 0.15]} rotation={[0, 0.55, -0.02]}>
          <boxGeometry args={[wingspan * 0.7, 0.045, 0.9]} />
          <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right wing */}
        <mesh position={[wingspan * 0.4, 0, 0.15]} rotation={[0, -0.55, 0.02]}>
          <boxGeometry args={[wingspan * 0.7, 0.045, 0.9]} />
          <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Ailerons */}
        <ControlSurface position={[-wingspan * 0.55, -0.02, 0.35]} size={[0.35, 0.025, 0.18]} color={colors.secondary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[wingspan * 0.55, -0.02, 0.35]} size={[0.35, 0.025, 0.18]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

        {/* Wing pylons */}
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, -0.06, 0.1]}>
            <boxGeometry args={[0.03, 0.08, 0.2]} />
            <meshStandardMaterial color={colors.secondary} metalness={0.8} />
          </mesh>
        ))}

        {/* Nav lights */}
        <mesh position={[-wingspan * 0.72, 0, 0.25]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.85} />
        </mesh>
        <mesh position={[wingspan * 0.72, 0, 0.25]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.85} />
        </mesh>
      </group>

      {/* Single large vertical stabilizer */}
      <mesh position={[0, fuselageRadius + 0.25, length * 0.3]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.04, 0.55, 0.5]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rudder */}
      <ControlSurface position={[0, fuselageRadius + 0.25, length * 0.42]} size={[0.03, 0.35, 0.12]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

      {/* Ventral fin */}
      <mesh position={[0, -fuselageRadius - 0.12, length * 0.28]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.35]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} />
      </mesh>

      {/* All-moving horizontal stabilizers (tailerons) */}
      <group position={[0, 0, length * 0.38]}>
        <mesh position={[-0.35, 0, 0]} rotation={[inputs.pitch * 0.25, 0.25, 0]}>
          <boxGeometry args={[0.55, 0.03, 0.28]} />
          <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.35, 0, 0]} rotation={[inputs.pitch * 0.25, -0.25, 0]}>
          <boxGeometry args={[0.55, 0.03, 0.28]} />
          <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Single engine exhaust - large */}
      <mesh position={[0, 0, length * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.2, 14]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} emissive={colors.accent} emissiveIntensity={inputs.throttle * 0.9} />
      </mesh>
      {/* Afterburner ring */}
      <mesh position={[0, 0, length * 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.02, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.9} />
      </mesh>
      {/* Afterburner flame */}
      {inputs.throttle > 0.6 && (
        <mesh position={[0, 0, length * 0.52 + inputs.throttle * 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.14, 0.6 + inputs.throttle * 0.6, 10]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.55 + inputs.throttle * 0.35} />
        </mesh>
      )}

      <LandingGear />
    </group>
  )
}

// =====================================================
// BIPLANE MODEL (Fokker Dr.I Triplane style - Red Baron)
// =====================================================

function BiplaneModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const propRPM = 8 + inputs.throttle * 40

  return (
    <group>
      {/* Fuselage - rounded box style */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 2.2]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Nose/engine block */}
      <mesh position={[0, 0, -1.2]}>
        <boxGeometry args={[0.35, 0.35, 0.4]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Open cockpit */}
      <mesh position={[0, 0.25, 0.2]}>
        <boxGeometry args={[0.35, 0.15, 0.5]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>

      {/* Upper wing */}
      <group position={[0, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[4, 0.08, 0.7]} />
          <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Wing struts */}
        <mesh position={[-1, -0.25, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[1, -0.25, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Blinking wingtip lights */}
        <BlinkingLight position={[-2.05, 0.05, 0]} color="#ff0000" size={0.04} blinkRate={1.2} />
        <BlinkingLight position={[2.05, 0.05, 0]} color="#00ff00" size={0.04} blinkRate={1.2} />
      </group>

      {/* Lower wing */}
      <group position={[0, -0.1, 0]}>
        <mesh>
          <boxGeometry args={[4, 0.08, 0.7]} />
          <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Animated ailerons */}
        <ControlSurface
          position={[-1.7, -0.02, 0.3]}
          size={[0.5, 0.04, 0.15]}
          color={colors.primary}
          deflection={inputs.roll}
          axis="x"
        />
        <ControlSurface
          position={[1.7, -0.02, 0.3]}
          size={[0.5, 0.04, 0.15]}
          color={colors.primary}
          deflection={-inputs.roll}
          axis="x"
        />
        {/* Lower wing blinking lights */}
        <BlinkingLight position={[-2.05, -0.02, 0]} color="#ff0000" size={0.04} blinkRate={1.2} />
        <BlinkingLight position={[2.05, -0.02, 0]} color="#00ff00" size={0.04} blinkRate={1.2} />
      </group>

      {/* Tail section */}
      <mesh position={[0, 0, 1.3]}>
        <boxGeometry args={[0.25, 0.25, 0.5]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Horizontal stabilizer */}
      <mesh position={[0, 0.05, 1.5]}>
        <boxGeometry args={[1.2, 0.05, 0.4]} />
        <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Elevator */}
      <ControlSurface
        position={[0, 0.05, 1.68]}
        size={[0.8, 0.04, 0.12]}
        color={colors.primary}
        deflection={inputs.pitch}
        axis="x"
      />

      {/* Vertical stabilizer */}
      <mesh position={[0, 0.25, 1.5]}>
        <boxGeometry args={[0.05, 0.5, 0.35]} />
        <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Rudder */}
      <ControlSurface
        position={[0, 0.25, 1.65]}
        size={[0.04, 0.4, 0.1]}
        color={colors.primary}
        deflection={inputs.yaw}
        axis="y"
      />

      {/* Tail light - blinking white */}
      <BlinkingLight position={[0, 0.5, 1.6]} color="#ffffff" size={0.035} blinkRate={0.8} />

      {/* Propeller */}
      <group position={[0, 0, -1.45]}>
        <Propeller rpm={propRPM} variant="biplane" />
      </group>

      {/* Fixed landing gear with wheels */}
      <group position={[0, -0.35, -0.3]}>
        {/* Struts */}
        <mesh position={[-0.4, -0.15, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.4, -0.15, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Axle */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[1, 0.03, 0.03]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-0.45, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
        <mesh position={[0.45, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
      </group>

      {/* Tail skid */}
      <mesh position={[0, -0.25, 1.4]}>
        <boxGeometry args={[0.03, 0.15, 0.1]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  )
}

// =====================================================
// SOPWITH CAMEL MODEL (British WWI Fighter)
// Famous for its rotary engine and twin Vickers guns
// =====================================================

function SopwithModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const propRPM = 10 + inputs.throttle * 45

  return (
    <group>
      {/* Fuselage - fabric-covered tubular frame look */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.38, 0.42, 2.0]} />
        <meshStandardMaterial color={colors.primary} metalness={0.15} roughness={0.85} />
      </mesh>

      {/* Distinctive hump (camel hump housing twin guns) */}
      <mesh position={[0, 0.28, -0.5]}>
        <boxGeometry args={[0.25, 0.14, 0.6]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Twin Vickers machine guns */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.32, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Rotary engine cowling (distinctive round nose) */}
      <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Open cockpit with coaming */}
      <mesh position={[0, 0.22, 0.3]}>
        <boxGeometry args={[0.32, 0.08, 0.45]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
      {/* Windscreen */}
      <mesh position={[0, 0.32, 0.05]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.25, 0.15, 0.02]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} metalness={0.8} />
      </mesh>

      {/* Upper wing - slight dihedral */}
      <group position={[0, 0.55, -0.1]}>
        <mesh position={[-1.6, 0.05, 0]} rotation={[0, 0, -0.04]}>
          <boxGeometry args={[3, 0.06, 0.65]} />
          <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
        </mesh>
        <mesh position={[1.6, 0.05, 0]} rotation={[0, 0, 0.04]}>
          <boxGeometry args={[3, 0.06, 0.65]} />
          <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
        </mesh>
        {/* Center section cutout for visibility */}
        <mesh position={[0, 0.05, -0.15]}>
          <boxGeometry args={[0.4, 0.06, 0.35]} />
          <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
        </mesh>
        {/* Blinking wingtip lights */}
        <BlinkingLight position={[-3.1, 0.08, 0]} color="#ff0000" size={0.04} blinkRate={1.0} />
        <BlinkingLight position={[3.1, 0.08, 0]} color="#00ff00" size={0.04} blinkRate={1.0} />
      </group>

      {/* Lower wing - shorter span */}
      <group position={[0, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 0.06, 0.55]} />
          <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
        </mesh>
        {/* Ailerons on lower wing only */}
        <ControlSurface position={[-1.4, -0.02, 0.22]} size={[0.5, 0.04, 0.12]} color={colors.primary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[1.4, -0.02, 0.22]} size={[0.5, 0.04, 0.12]} color={colors.primary} deflection={-inputs.roll} axis="x" />
        {/* Lower wing lights */}
        <BlinkingLight position={[-1.65, -0.02, 0]} color="#ff0000" size={0.035} blinkRate={1.0} />
        <BlinkingLight position={[1.65, -0.02, 0]} color="#00ff00" size={0.035} blinkRate={1.0} />
      </group>

      {/* Interplane struts (N-struts) */}
      {[-1.2, 1.2].map((x, i) => (
        <group key={i} position={[x, 0.2, 0]}>
          <mesh rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
            <boxGeometry args={[0.04, 0.72, 0.04]} />
            <meshStandardMaterial color={colors.secondary} />
          </mesh>
          {/* Diagonal bracing */}
          <mesh position={[0, 0, 0.15]} rotation={[0.3, 0, x > 0 ? -0.08 : 0.08]}>
            <boxGeometry args={[0.025, 0.75, 0.025]} />
            <meshStandardMaterial color={colors.secondary} />
          </mesh>
        </group>
      ))}

      {/* Flying wires (simplified) */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]} rotation={[0, 0, x > 0 ? 0.6 : -0.6]}>
          <cylinderGeometry args={[0.008, 0.008, 0.8, 4]} />
          <meshStandardMaterial color="#444444" metalness={0.8} />
        </mesh>
      ))}

      {/* Tail section - tapered */}
      <mesh position={[0, 0.05, 1.15]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.2, 0.22, 0.6]} />
        <meshStandardMaterial color={colors.primary} metalness={0.15} roughness={0.85} />
      </mesh>

      {/* Horizontal stabilizer */}
      <mesh position={[0, 0.12, 1.5]}>
        <boxGeometry args={[1.4, 0.04, 0.38]} />
        <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
      </mesh>
      <ControlSurface position={[0, 0.12, 1.68]} size={[1.0, 0.03, 0.12]} color={colors.primary} deflection={inputs.pitch} axis="x" />

      {/* Vertical stabilizer - distinctive shape */}
      <mesh position={[0, 0.32, 1.45]}>
        <boxGeometry args={[0.04, 0.42, 0.4]} />
        <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
      </mesh>
      <ControlSurface position={[0, 0.32, 1.62]} size={[0.03, 0.36, 0.1]} color={colors.primary} deflection={inputs.yaw} axis="y" />

      {/* Tail light */}
      <BlinkingLight position={[0, 0.55, 1.5]} color="#ffffff" size={0.03} blinkRate={0.7} />

      {/* Propeller */}
      <group position={[0, 0, -1.28]}>
        <Propeller rpm={propRPM} variant="biplane" />
      </group>

      {/* Landing gear - V-strut style */}
      <group position={[0, -0.35, -0.2]}>
        {/* V-struts */}
        <mesh position={[-0.25, -0.12, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.25, -0.12, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Axle with bungee wrap look */}
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.9, 0.05, 0.05]} />
          <meshStandardMaterial color="#554433" roughness={0.9} />
        </mesh>
        {/* Wheels - spoked look */}
        {[-0.4, 0.4].map((x, i) => (
          <group key={i} position={[x, -0.32, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.05, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Tail skid */}
      <mesh position={[0, -0.22, 1.35]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.03, 0.18, 0.08]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  )
}

// =====================================================
// SPAD XIII MODEL (French WWI Fighter)
// Clean lines, powerful Hispano-Suiza engine
// =====================================================

function SpadModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const propRPM = 12 + inputs.throttle * 50

  return (
    <group>
      {/* Fuselage - more streamlined than Sopwith */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.42, 0.45, 2.4]} />
        <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
      </mesh>

      {/* Rounded fuselage top */}
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.3, 2.2]} />
        <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
      </mesh>

      {/* Hispano-Suiza engine cowling - distinctive */}
      <mesh position={[0, 0.02, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.5, 12]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Radiator shutters on sides */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, 0, -1.2]}>
          <boxGeometry args={[0.04, 0.25, 0.35]} />
          <meshStandardMaterial color="#333333" metalness={0.7} />
        </mesh>
      ))}

      {/* Twin Vickers guns */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.28, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.6, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Cockpit */}
      <mesh position={[0, 0.25, 0.35]}>
        <boxGeometry args={[0.34, 0.12, 0.5]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
      {/* Windscreen - small */}
      <mesh position={[0, 0.35, 0.08]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.02]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.35} metalness={0.85} />
      </mesh>

      {/* Upper wing - distinctive thin profile */}
      <group position={[0, 0.52, -0.15]}>
        {/* Main spar visible through fabric */}
        <mesh>
          <boxGeometry args={[5.2, 0.055, 0.58]} />
          <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Leading edge */}
        <mesh position={[0, 0.015, -0.26]}>
          <boxGeometry args={[5.2, 0.03, 0.08]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.3} />
        </mesh>
        {/* Blinking lights */}
        <BlinkingLight position={[-2.65, 0.04, 0]} color="#ff0000" size={0.04} blinkRate={1.3} />
        <BlinkingLight position={[2.65, 0.04, 0]} color="#00ff00" size={0.04} blinkRate={1.3} />
      </group>

      {/* Lower wing - equal span */}
      <group position={[0, -0.12, 0]}>
        <mesh>
          <boxGeometry args={[5.2, 0.055, 0.52]} />
          <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Ailerons */}
        <ControlSurface position={[-2.1, -0.02, 0.2]} size={[0.6, 0.035, 0.12]} color={colors.primary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[2.1, -0.02, 0.2]} size={[0.6, 0.035, 0.12]} color={colors.primary} deflection={-inputs.roll} axis="x" />
        {/* Lower lights */}
        <BlinkingLight position={[-2.65, -0.02, 0]} color="#ff0000" size={0.035} blinkRate={1.3} />
        <BlinkingLight position={[2.65, -0.02, 0]} color="#00ff00" size={0.035} blinkRate={1.3} />
      </group>

      {/* Interplane struts - I-struts */}
      {[-1.5, -0.7, 0.7, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.2, -0.05]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.035, 0.65, 0.035]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.4} />
        </mesh>
      ))}

      {/* Diagonal bracing wires */}
      {[-1.1, 1.1].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.2, 0]} rotation={[0.2, 0, x > 0 ? 0.5 : -0.5]}>
            <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
            <meshStandardMaterial color="#555555" metalness={0.85} />
          </mesh>
          <mesh position={[x, 0.2, 0]} rotation={[-0.2, 0, x > 0 ? -0.5 : 0.5]}>
            <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
            <meshStandardMaterial color="#555555" metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Tail - tapered elegantly */}
      <mesh position={[0, 0.08, 1.3]}>
        <boxGeometry args={[0.22, 0.24, 0.65]} />
        <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
      </mesh>

      {/* Horizontal stabilizer - clean lines */}
      <mesh position={[0, 0.15, 1.65]}>
        <boxGeometry args={[1.5, 0.04, 0.4]} />
        <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
      </mesh>
      <ControlSurface position={[0, 0.15, 1.82]} size={[1.1, 0.03, 0.1]} color={colors.primary} deflection={inputs.pitch} axis="x" />

      {/* Vertical stabilizer - large, triangular */}
      <mesh position={[0, 0.38, 1.6]}>
        <boxGeometry args={[0.04, 0.48, 0.45]} />
        <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
      </mesh>
      <ControlSurface position={[0, 0.38, 1.8]} size={[0.03, 0.4, 0.12]} color={colors.primary} deflection={inputs.yaw} axis="y" />

      {/* Tail light */}
      <BlinkingLight position={[0, 0.62, 1.65]} color="#ffffff" size={0.032} blinkRate={0.9} />

      {/* National roundel on fuselage (simplified) */}
      <mesh position={[0.22, 0, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      <mesh position={[-0.22, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>

      {/* Propeller */}
      <group position={[0, 0.02, -1.62]}>
        <Propeller rpm={propRPM} variant="biplane" />
      </group>

      {/* Landing gear - streamlined */}
      <group position={[0, -0.38, -0.15]}>
        {/* Main struts */}
        <mesh position={[-0.3, -0.1, 0]} rotation={[0.1, 0, 0.25]}>
          <boxGeometry args={[0.05, 0.42, 0.05]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.4} />
        </mesh>
        <mesh position={[0.3, -0.1, 0]} rotation={[0.1, 0, -0.25]}>
          <boxGeometry args={[0.05, 0.42, 0.05]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.4} />
        </mesh>
        {/* Axle fairing */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.85, 0.06, 0.08]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.5} />
        </mesh>
        {/* Wheels */}
        {[-0.38, 0.38].map((x, i) => (
          <group key={i} position={[x, -0.3, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.055, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
            </mesh>
            {/* Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.06, 8]} />
              <meshStandardMaterial color="#666666" metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Tail skid */}
      <mesh position={[0, -0.2, 1.45]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.035, 0.16, 0.1]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  )
}

// =====================================================
// SHARED LANDING GEAR
// =====================================================

function LandingGear() {
  return (
    <group>
      {/* Nose wheel */}
      <group position={[0, -0.25, -0.8]}>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
      </group>

      {/* Main wheels */}
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, -0.25, 0.3]}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// =====================================================
// BOEING 747 MODEL (Jumbo Jet)
// =====================================================

function Boeing747Model({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  return (
    <group scale={[1.5, 1.5, 1.5]}>
      {/* Main fuselage - wide body */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.5, 6, 8, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Upper deck hump (747 signature) */}
      <mesh position={[0, 0.35, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.3, 2.5, 8, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cockpit windows */}
      <mesh position={[0, 0.2, -3.8]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} metalness={0.9} />
      </mesh>

      {/* Blue belly stripe */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[1.02, 0.2, 6]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.6} />
      </mesh>

      {/* Main wings */}
      <group position={[0, -0.1, 0.5]}>
        {/* Left wing */}
        <mesh position={[-2.5, 0, 0.3]} rotation={[0, 0.1, -0.03]}>
          <boxGeometry args={[4.5, 0.12, 1.2]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Right wing */}
        <mesh position={[2.5, 0, 0.3]} rotation={[0, -0.1, 0.03]}>
          <boxGeometry args={[4.5, 0.12, 1.2]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Winglets */}
        <mesh position={[-4.6, 0.3, 0.5]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.08, 0.6, 0.3]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        <mesh position={[4.6, 0.3, 0.5]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.08, 0.6, 0.3]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>

        {/* Animated ailerons */}
        <ControlSurface position={[-3.5, -0.03, 0.7]} size={[1.2, 0.05, 0.25]} color={colors.secondary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[3.5, -0.03, 0.7]} size={[1.2, 0.05, 0.25]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

        {/* Wing lights */}
        <mesh position={[-4.7, 0, 0.4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[4.7, 0, 0.4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 4 Engines (under wings) */}
      {[[-1.8, -0.4, 0.3], [-3.2, -0.35, 0.5], [1.8, -0.4, 0.3], [3.2, -0.35, 0.5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Engine nacelle */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.9, 16]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Engine intake */}
          <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.25, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
          </mesh>
          {/* Engine exhaust glow */}
          <mesh position={[0, 0, 0.5]}>
            <circleGeometry args={[0.2, 16]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff4400"
              emissiveIntensity={inputs.throttle * 0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Horizontal stabilizer */}
      <group position={[0, 0.1, 3]}>
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[2.2, 0.08, 0.6]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[2.2, 0.08, 0.6]} />
          <meshStandardMaterial color={colors.primary} metalness={0.6} />
        </mesh>
        {/* Elevators */}
        <ControlSurface position={[-1.2, 0, 0.25]} size={[1.5, 0.05, 0.15]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
        <ControlSurface position={[1.2, 0, 0.25]} size={[1.5, 0.05, 0.15]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
      </group>

      {/* Vertical stabilizer (tall) */}
      <mesh position={[0, 0.9, 2.8]}>
        <boxGeometry args={[0.1, 1.6, 1]} />
        <meshStandardMaterial color={colors.primary} metalness={0.6} />
      </mesh>
      {/* Red accent on tail */}
      <mesh position={[0.06, 1.2, 2.9]}>
        <boxGeometry args={[0.02, 0.8, 0.6]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      {/* Rudder */}
      <ControlSurface position={[0, 0.9, 3.25]} size={[0.06, 1.4, 0.2]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

      {/* Tail cone */}
      <mesh position={[0, 0, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.7} />
      </mesh>

      {/* Landing gear */}
      <LandingGear />

      {/* Cabin windows (row of dots) */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[0, 0.15, -2.5 + i * 0.3]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.06, 8]} />
          <meshStandardMaterial color="#88aacc" emissive="#446688" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  )
}

// =====================================================
// TUNG TUNG AIR MODEL (Brain Rot Meme Plane!)
// Based on the Tung Tung Tung Sahur meme character
// A cylindrical wooden guy with arms, legs, and a bat
// =====================================================

function TungTungModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const batRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)

  // Animated limbs - walking/flailing motion
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const speed = inputs.throttle

    // Bat spinning (propeller style!)
    if (batRef.current) {
      batRef.current.rotation.z += (10 + speed * 40) * 0.016
    }

    // Arm flapping based on throttle
    if (leftArmRef.current && rightArmRef.current) {
      const flap = Math.sin(t * 8) * 0.3 * speed
      leftArmRef.current.rotation.z = -0.3 + flap
      rightArmRef.current.rotation.z = 0.3 - flap
    }

    // Leg dangling animation
    if (leftLegRef.current && rightLegRef.current) {
      const swing = Math.sin(t * 4) * 0.2
      leftLegRef.current.rotation.x = swing
      rightLegRef.current.rotation.x = -swing
    }
  })

  return (
    <group>
      {/* === CYLINDRICAL BODY (The iconic log shape) === */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 3, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Body shading/texture lines */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.02, 8, 32]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
      ))}

      {/* === FACE (The derpy meme face) === */}
      <group position={[0, 0.15, -1.3]}>
        {/* Face plate - slightly lighter */}
        <mesh>
          <sphereGeometry args={[0.42, 16, 12, 0, Math.PI]} />
          <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Big googly eyes */}
        <group position={[-0.15, 0.1, -0.25]}>
          {/* Left eye white */}
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#FFFFF0" />
          </mesh>
          {/* Left pupil - looking slightly derpy */}
          <mesh position={[-0.02, -0.02, -0.08]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Eye shine */}
          <mesh position={[-0.04, 0.02, -0.1]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>

        <group position={[0.15, 0.1, -0.25]}>
          {/* Right eye white */}
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#FFFFF0" />
          </mesh>
          {/* Right pupil */}
          <mesh position={[0.02, -0.02, -0.08]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Eye shine */}
          <mesh position={[0, 0.02, -0.1]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Eyebrows - expressive */}
        <mesh position={[-0.15, 0.22, -0.2]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.15, 0.03, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.15, 0.22, -0.2]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.15, 0.03, 0.04]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Nose - simple bump */}
        <mesh position={[0, -0.02, -0.35]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Mouth - slight smile */}
        <mesh position={[0, -0.15, -0.3]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
      </group>

      {/* === ARMS (Wings!) === */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.5, 0, -0.3]}>
        {/* Upper arm */}
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.1, 0.6, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.9, -0.15, 0]} rotation={[0, 0, -0.8]}>
          <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[-1.25, -0.35, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color={colors.accent} />
        </mesh>
        {/* Wing membrane (for actual lift!) */}
        <mesh position={[-0.7, 0.1, 0.3]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[1.2, 0.03, 0.8]} />
          <meshStandardMaterial color={colors.secondary} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Right Arm (holding the bat!) */}
      <group ref={rightArmRef} position={[0.5, 0, -0.3]}>
        {/* Upper arm */}
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.1, 0.6, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Forearm - raised to hold bat */}
        <mesh position={[0.85, 0.1, -0.2]} rotation={[0.5, 0, 0.3]}>
          <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Hand gripping bat */}
        <mesh position={[1.1, 0.35, -0.4]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color={colors.accent} />
        </mesh>
        {/* Wing membrane */}
        <mesh position={[0.7, 0.1, 0.3]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[1.2, 0.03, 0.8]} />
          <meshStandardMaterial color={colors.secondary} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* === THE ICONIC BAT (Propeller!) === */}
      <group ref={batRef} position={[0, 0, -1.8]}>
        {/* Bat handle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#5C4033" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Bat head - thicker end */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#8B6914" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Second bat blade (for propeller effect) */}
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#8B6914" metalness={0.3} roughness={0.6} />
        </mesh>
      </group>

      {/* === LEGS (Hanging down like landing gear) === */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.2, -0.35, 0.8]}>
        {/* Thigh */}
        <mesh position={[0, -0.3, 0]} rotation={[0.2, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.75, 0.1]} rotation={[-0.1, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -1.05, 0.2]}>
          <boxGeometry args={[0.15, 0.06, 0.25]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Toes */}
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} position={[x, -1.05, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={colors.secondary} />
          </mesh>
        ))}
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.2, -0.35, 0.8]}>
        {/* Thigh */}
        <mesh position={[0, -0.3, 0]} rotation={[0.2, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.75, 0.1]} rotation={[-0.1, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -1.05, 0.2]}>
          <boxGeometry args={[0.15, 0.06, 0.25]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        {/* Toes */}
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} position={[x, -1.05, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={colors.secondary} />
          </mesh>
        ))}
      </group>

      {/* === TAIL (Small stabilizer at the back) === */}
      <group position={[0, 0.2, 1.4]}>
        {/* Vertical tail fin */}
        <mesh>
          <boxGeometry args={[0.05, 0.4, 0.3]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        {/* Horizontal stabilizers */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.8, 0.04, 0.25]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        {/* Rudder */}
        <ControlSurface position={[0, 0, 0.15]} size={[0.04, 0.35, 0.1]} color={colors.secondary} deflection={inputs.yaw} axis="y" />
        {/* Elevators */}
        <ControlSurface position={[-0.3, -0.15, 0.1]} size={[0.3, 0.03, 0.08]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
        <ControlSurface position={[0.3, -0.15, 0.1]} size={[0.3, 0.03, 0.08]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
      </group>

      {/* === NAV LIGHTS === */}
      <BlinkingLight position={[-1.3, 0, 0]} color="#ff0000" size={0.04} blinkRate={2} />
      <BlinkingLight position={[1.3, 0, 0]} color="#00ff00" size={0.04} blinkRate={2} />
      <BlinkingLight position={[0, 0.4, 1.5]} color="#ffffff" size={0.035} blinkRate={1} />

      {/* === "TUNG TUNG AIR" text placeholder (badge on side) === */}
      <mesh position={[0.51, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} />
      </mesh>
      <mesh position={[-0.51, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} />
      </mesh>
    </group>
  )
}

// =====================================================
// OTTER PLANE MODEL (Funky mascot plane!)
// A whimsical otter-shaped aircraft
// =====================================================

function OtterModel({ colors, inputs }: { colors: PlaneColors; inputs: ControlInputs }) {
  const propRPM = 12 + inputs.throttle * 45
  const tailWagRef = useRef<THREE.Group>(null)

  // Animated tail wag based on speed
  useFrame(({ clock }) => {
    if (tailWagRef.current) {
      const wag = Math.sin(clock.getElapsedTime() * 3) * 0.15 * inputs.throttle
      tailWagRef.current.rotation.y = wag
    }
  })

  return (
    <group>
      {/* === OTTER HEAD (Nose) - Streamlined otter face === */}
      <group position={[0, 0.05, -1.6]}>
        {/* Main head - flatter, wider otter shape (not round like bear) */}
        <mesh scale={[1.1, 0.85, 1]}>
          <sphereGeometry args={[0.4, 16, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Forehead - slight bump */}
        <mesh position={[0, 0.15, -0.15]} scale={[1.2, 0.6, 0.8]}>
          <sphereGeometry args={[0.25, 12, 10]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Snout/muzzle - LONG and flat like an otter (key difference from bear!) */}
        <mesh position={[0, -0.08, -0.45]} scale={[0.9, 0.65, 1.3]}>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Snout bridge - elongated */}
        <mesh position={[0, 0, -0.35]} rotation={[-0.2, 0, 0]} scale={[0.7, 0.5, 1]}>
          <capsuleGeometry args={[0.12, 0.25, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Whisker pads - puffy cheeks (otter signature!) */}
        <mesh position={[-0.15, -0.08, -0.5]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, -0.08, -0.5]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Nose - wide and flat like otter */}
        <mesh position={[0, -0.02, -0.68]} scale={[1.2, 0.8, 1]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Eyes - smaller, more to the sides (otter-like) */}
        <mesh position={[-0.22, 0.08, -0.2]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0.08, -0.2]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.24, 0.1, -0.25]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.2, 0.1, -0.25]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Ears - TINY and on the SIDES (otter signature - not on top like bear!) */}
        <mesh position={[-0.38, 0.1, 0.05]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0.38, 0.1, 0.05]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Inner ear - tiny pink */}
        <mesh position={[-0.4, 0.1, 0.02]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#cc9988" />
        </mesh>
        <mesh position={[0.4, 0.1, 0.02]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#cc9988" />
        </mesh>

        {/* Whiskers - coming from the puffy cheeks */}
        {[-1, 0, 1].map((y, i) => (
          <group key={`whisker-${i}`}>
            <mesh position={[-0.22, -0.06 + y * 0.04, -0.55]} rotation={[0, 0.4, y * 0.15]}>
              <cylinderGeometry args={[0.004, 0.001, 0.3, 4]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            <mesh position={[0.22, -0.06 + y * 0.04, -0.55]} rotation={[0, -0.4, -y * 0.15]}>
              <cylinderGeometry args={[0.004, 0.001, 0.3, 4]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          </group>
        ))}
      </group>

      {/* === FUSELAGE (Otter Body) === */}
      <group>
        {/* Main body - plump and streamlined (rotated to front-back orientation) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.4, 2.2, 8, 16]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Belly - lighter colored (rotated to front-back orientation) */}
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.32, 2.0, 8, 16]} />
          <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
        </mesh>

        {/* Center mast/antenna - rotated 90 degrees (horizontal) */}
        <mesh position={[0, 0.25, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Cockpit bubble on back */}
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#88ccee"
            transparent
            opacity={0.6}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* === WINGS (Webbed paw-shaped!) === */}
      <group position={[0, 0, 0.2]}>
        {/* Left wing - webbed paw shape */}
        <group position={[-1.5, -0.05, 0]}>
          {/* Main wing surface */}
          <mesh rotation={[0, 0, -0.08]}>
            <boxGeometry args={[2.6, 0.08, 0.75]} />
            <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Paw pads (4 toes) */}
          {[-0.25, 0, 0.25].map((z, i) => (
            <mesh key={i} position={[-1.2, -0.02, z - 0.05]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
            </mesh>
          ))}
          {/* Webbing between toes */}
          <mesh position={[-1.1, -0.03, 0]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.3, 0.04, 0.5]} />
            <meshStandardMaterial color="#6b5030" transparent opacity={0.7} />
          </mesh>
          {/* Fish decoration! */}
          <group position={[-0.5, 0.08, 0]} rotation={[0, 0.3, 0]}>
            <mesh>
              <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
              <meshStandardMaterial color="#88aacc" metalness={0.6} />
            </mesh>
            {/* Fish tail */}
            <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.02, 0.08]} />
              <meshStandardMaterial color="#88aacc" metalness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Right wing - webbed paw shape */}
        <group position={[1.5, -0.05, 0]}>
          <mesh rotation={[0, 0, 0.08]}>
            <boxGeometry args={[2.6, 0.08, 0.75]} />
            <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Paw pads */}
          {[-0.25, 0, 0.25].map((z, i) => (
            <mesh key={i} position={[1.2, -0.02, z - 0.05]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
            </mesh>
          ))}
          {/* Webbing */}
          <mesh position={[1.1, -0.03, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.3, 0.04, 0.5]} />
            <meshStandardMaterial color="#6b5030" transparent opacity={0.7} />
          </mesh>
          {/* Fish decoration */}
          <group position={[0.5, 0.08, 0]} rotation={[0, -0.3, 0]}>
            <mesh>
              <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
              <meshStandardMaterial color="#cc8866" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.02, 0.08]} />
              <meshStandardMaterial color="#cc8866" metalness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Animated ailerons */}
        <ControlSurface position={[-2.2, -0.08, 0.25]} size={[0.6, 0.04, 0.15]} color={colors.secondary} deflection={inputs.roll} axis="x" />
        <ControlSurface position={[2.2, -0.08, 0.25]} size={[0.6, 0.04, 0.15]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

        {/* Wing tip lights */}
        <BlinkingLight position={[-2.8, 0, 0]} color="#ff0000" size={0.05} blinkRate={1.5} />
        <BlinkingLight position={[2.8, 0, 0]} color="#00ff00" size={0.05} blinkRate={1.5} />
      </group>

      {/* === OTTER TAIL (Vertical & Horizontal Stabilizers) === */}
      <group ref={tailWagRef} position={[0, 0.05, 1.8]}>
        {/* Thick otter tail as vertical stabilizer */}
        <mesh position={[0, 0.2, 0]} rotation={[-0.1, 0, 0]}>
          <capsuleGeometry args={[0.15, 0.7, 8, 12]} />
          <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
        </mesh>
        {/* Tail tip - darker */}
        <mesh position={[0, 0.55, 0.1]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={colors.secondary} metalness={0.25} roughness={0.75} />
        </mesh>

        {/* Rudder integrated into tail */}
        <ControlSurface position={[0, 0.25, 0.25]} size={[0.04, 0.5, 0.12]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

        {/* Tail light */}
        <BlinkingLight position={[0, 0.7, 0.15]} color="#ffffff" size={0.04} blinkRate={0.8} />
      </group>

      {/* Horizontal stabilizers (small flippers) */}
      <group position={[0, -0.05, 1.6]}>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.35]} />
          <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0.5, 0, 0]} rotation={[0, -0.1, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.35]} />
          <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Elevators */}
        <ControlSurface position={[-0.5, 0, 0.15]} size={[0.5, 0.03, 0.1]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
        <ControlSurface position={[0.5, 0, 0.15]} size={[0.5, 0.03, 0.1]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
      </group>

      {/* === PROPELLER (with fish-shaped hub cap) === */}
      <group position={[0, 0, -2.1]}>
        <Propeller rpm={propRPM} variant="biplane" />
        {/* Fish-shaped spinner */}
        <mesh position={[0, 0, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.25, 8]} />
          <meshStandardMaterial color="#88aacc" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* === LANDING GEAR (Webbed feet!) === */}
      <group position={[0, -0.5, -0.3]}>
        {/* Front foot */}
        <group position={[0, 0, -0.4]}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.04, 0.25, 0.04]} />
            <meshStandardMaterial color={colors.secondary} metalness={0.6} />
          </mesh>
          {/* Webbed foot pad */}
          <mesh position={[0, -0.22, 0.05]}>
            <boxGeometry args={[0.2, 0.04, 0.25]} />
            <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
          </mesh>
          {/* Toes */}
          {[-0.06, 0, 0.06].map((x, i) => (
            <mesh key={i} position={[x, -0.22, -0.08]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#4a3520" />
            </mesh>
          ))}
        </group>

        {/* Rear feet (main gear) */}
        {[-0.4, 0.4].map((x, i) => (
          <group key={i} position={[x, 0, 0.4]}>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshStandardMaterial color={colors.secondary} metalness={0.6} />
            </mesh>
            {/* Webbed foot */}
            <mesh position={[0, -0.18, 0.05]}>
              <boxGeometry args={[0.22, 0.04, 0.28]} />
              <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Toes */}
            {[-0.07, 0, 0.07].map((dx, j) => (
              <mesh key={j} position={[dx, -0.18, -0.1]}>
                <sphereGeometry args={[0.045, 6, 6]} />
                <meshStandardMaterial color="#4a3520" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* === SPLASH EFFECT (water droplets when at high throttle) === */}
      {inputs.throttle > 0.7 && (
        <group position={[0, 0, 2]}>
          {[...Array(5)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3
              ]}
            >
              <sphereGeometry args={[0.03 + Math.random() * 0.02, 6, 6]} />
              <meshStandardMaterial
                color="#aaddff"
                transparent
                opacity={0.4 + inputs.throttle * 0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// =====================================================
// MAIN EXPORT
// =====================================================

export default function PlaneModel({
  variant = 'ww2',
  colors,
  controlInputs,
}: PlaneModelProps) {
  const finalColors = colors || VARIANT_COLORS[variant]
  const inputs = controlInputs || DEFAULT_INPUTS

  switch (variant) {
    case 'jet':
      return <JetModel colors={finalColors} inputs={inputs} />
    case 'biplane':
      return <BiplaneModel colors={finalColors} inputs={inputs} />
    case 'sopwith':
      return <SopwithModel colors={finalColors} inputs={inputs} />
    case 'spad':
      return <SpadModel colors={finalColors} inputs={inputs} />
    case 'boeing747':
      return <Boeing747Model colors={finalColors} inputs={inputs} />
    case 'stealth':
      return <StealthModel colors={finalColors} inputs={inputs} />
    case 'interceptor':
      return <InterceptorModel colors={finalColors} inputs={inputs} />
    case 'otter':
      return <OtterModel colors={finalColors} inputs={inputs} />
    case 'tungtung':
      return <TungTungModel colors={finalColors} inputs={inputs} />
    case 'claude':
      return <ClaudeModel colors={finalColors} inputs={inputs} />
    case 'gpt':
      return <GPTModel colors={finalColors} inputs={inputs} />
    case 'ww2':
    default:
      return <WW2Model colors={finalColors} inputs={inputs} />
  }
}

// Export variant colors for external use
export { VARIANT_COLORS }
