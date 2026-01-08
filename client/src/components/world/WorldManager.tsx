import Runway from './Runway'
import ControlTower from './ControlTower'
import Terminal from './Terminal'
import Hangars from './Hangars'
import Blimps from './Blimps'
import Mountain from './Mountain'
import MountainBorder from './MountainBorder'
import Roads from './Roads'
import FuelStation from './FuelStation'
import Lighthouse from './Lighthouse'
import WindFarm from './WindFarm'
import WeatherStation from './WeatherStation'
import RadioTowers from './RadioTowers'
import Helipad from './Helipad'
import WaterTower from './WaterTower'
import Lake from './Lake'
import Downtown from './Downtown'

// =====================================================
// WORLD MANAGER - Central hub for all world components
// =====================================================

export default function WorldManager() {
    return (
        <group>
            {/* Road Network (render first, under everything) */}
            <Roads />

            {/* Airport Complex */}
            <group name="airport">
                <Runway />
                <ControlTower />
                <Terminal />
                <Hangars />
                <Helipad />
            </group>

            {/* Infrastructure */}
            <group name="infrastructure">
                <FuelStation />
                <WaterTower />
                <WeatherStation />
                <RadioTowers />
            </group>

            {/* Urban Area */}
            <group name="city">
                <Downtown />
            </group>

            {/* Landmarks */}
            <group name="landmarks">
                <Lighthouse />
                <WindFarm />
            </group>

            {/* Natural Features */}
            <group name="nature">
                <Mountain />
                <MountainBorder />
                <Lake />
            </group>

            {/* Atmospheric Elements */}
            <group name="atmosphere">
                <Blimps />
            </group>
        </group>
    )
}

// Export all world components for individual use if needed
export {
    Runway, ControlTower, Terminal, Hangars, Blimps, Mountain, MountainBorder,
    Roads, FuelStation, Lighthouse, WindFarm, WeatherStation, RadioTowers, Helipad, WaterTower,
    Lake, Downtown
}

