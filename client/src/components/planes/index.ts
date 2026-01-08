// =====================================================
// PLANE MODELS - MODULAR EXPORTS
// Individual plane models split from monolithic file
// =====================================================

// Types and configuration
export type { PlaneVariant, PlaneColors, ControlInputs, PlaneModelProps } from './types'
export { VARIANT_COLORS, DEFAULT_INPUTS } from './types'

// Shared components
export { Propeller, BlinkingLight, ControlSurface, LandingGear } from './shared'

// Individual plane models
export { WW2Model } from './WW2Model'
export { JetModel } from './JetModel'
export { BiplaneModel } from './BiplaneModel'
export { SopwithModel } from './SopwithModel'
export { SpadModel } from './SpadModel'
export { Boeing747Model } from './Boeing747Model'
export { StealthModel } from './StealthModel'
export { InterceptorModel } from './InterceptorModel'
export { OtterModel } from './OtterModel'
export { TungTungModel } from './TungTungModel'
export { ClaudeModel } from './ClaudeModel'

// Default export - main PlaneModel component (still uses original for now)
// TODO: Migrate main PlaneModel to use these individual exports
export { default, VARIANT_COLORS as PlaneVariantColors } from '../PlaneModel'
