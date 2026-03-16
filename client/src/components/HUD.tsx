import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { getNearestLocation } from '../config/worldLocations'
import './HUD.css'

export default function HUD() {
  const { flightData, planePosition } = useGameStore()
  const { speed, altitude, heading, throttle, angleOfAttack, gForce, isStalling } = flightData

  // Format heading with leading zeros
  const headingStr = String(Math.round(heading)).padStart(3, '0')

  // Compass directions
  const getCompassDir = (hdg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(hdg / 45) % 8]
  }

  // Nearest POI (distance + bearing) - memoized per position
  const nearestPOI = useMemo(() => {
    const pos: [number, number, number] = [planePosition.x, planePosition.y, planePosition.z]
    const loc = getNearestLocation(pos)
    if (!loc) return null
    const dx = loc.position[0] - pos[0]
    const dz = loc.position[2] - pos[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    const bearing = (Math.atan2(dx, -dz) * (180 / Math.PI) + 360) % 360
    const distStr = dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${Math.round(dist)}m`
    return { name: loc.name, dist: distStr, dir: getCompassDir(bearing) }
  }, [planePosition.x, planePosition.z])

  return (
    <div className="hud">
      {/* Stall Warning */}
      {isStalling && (
        <div className="stall-warning">
          <span className="stall-text">⚠ STALL</span>
        </div>
      )}

      {/* Left Panel - Throttle & Speed */}
      <div className="hud-panel hud-left">
        <div className="gauge throttle-gauge">
          <div className="gauge-label">THR</div>
          <div className="throttle-bar">
            <div
              className="throttle-fill"
              style={{ height: `${throttle * 100}%` }}
            />
            <div className="throttle-markers">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
          </div>
          <div className="gauge-value">{Math.round(throttle * 100)}%</div>
        </div>

        <div className="data-block">
          <div className="data-label">SPD</div>
          <div className="data-value">{Math.round(speed)}</div>
          <div className="data-unit">kts</div>
        </div>
      </div>

      {/* Center Panel - Heading */}
      <div className="hud-panel hud-center">
        <div className="compass">
          <div className="compass-tape">
            <span className="compass-dir">{getCompassDir(heading)}</span>
            <span className="compass-heading">{headingStr}°</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Altitude & Flight Data */}
      <div className="hud-panel hud-right">
        <div className="data-block">
          <div className="data-label">ALT</div>
          <div className="data-value">{Math.round(altitude).toLocaleString()}</div>
          <div className="data-unit">ft</div>
        </div>

        <div className="mini-gauges">
          {/* G-Force */}
          <div className="mini-gauge">
            <div className="mini-label">G</div>
            <div className={`mini-value ${gForce > 4 ? 'warning' : ''}`}>
              {gForce.toFixed(1)}
            </div>
          </div>

          {/* Angle of Attack */}
          <div className="mini-gauge">
            <div className="mini-label">AoA</div>
            <div className={`mini-value ${Math.abs(angleOfAttack) > 12 ? 'warning' : ''}`}>
              {angleOfAttack.toFixed(0)}°
            </div>
          </div>
        </div>
      </div>

      {/* Nearest POI */}
      {nearestPOI && (
        <div className="hud-panel hud-nearest-poi">
          <span className="poi-label">NEAREST</span>
          <span className="poi-value">{nearestPOI.name}</span>
          <span className="poi-dist">{nearestPOI.dist} {nearestPOI.dir}</span>
        </div>
      )}

      {/* Bottom - Controls Hint */}
      <div className="hud-controls-hint">
        <span><kbd>WASD</kbd> Pitch/Roll</span>
        <span><kbd>Q/E</kbd> Yaw</span>
        <span><kbd>Shift</kbd> Throttle ↑</span>
        <span><kbd>Ctrl</kbd> Throttle ↓</span>
      </div>
    </div>
  )
}
