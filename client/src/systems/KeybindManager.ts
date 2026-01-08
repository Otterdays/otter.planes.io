// =====================================================
// UNIFIED KEYBIND MANAGER
// Central system for all game keybinds
// =====================================================

export type KeybindAction =
    // Flight controls
    | 'pitch_up' | 'pitch_down'
    | 'roll_left' | 'roll_right'
    | 'yaw_left' | 'yaw_right'
    | 'throttle_up' | 'throttle_down'
    // UI controls
    | 'pause' | 'minimap_toggle' | 'minimap_size'
    // Camera
    | 'camera_next' | 'camera_prev'

interface KeyBinding {
    key: string
    displayName: string
    category: 'flight' | 'ui' | 'camera'
}

type KeybindMap = Record<KeybindAction, KeyBinding>

// Default keybindings
const DEFAULT_KEYBINDS: KeybindMap = {
    // Flight controls
    pitch_up: { key: 's', displayName: 'W', category: 'flight' },
    pitch_down: { key: 'w', displayName: 'S', category: 'flight' },
    roll_left: { key: 'a', displayName: 'A', category: 'flight' },
    roll_right: { key: 'd', displayName: 'D', category: 'flight' },
    yaw_left: { key: 'q', displayName: 'Q', category: 'flight' },
    yaw_right: { key: 'e', displayName: 'E', category: 'flight' },
    throttle_up: { key: 'shift', displayName: 'Shift', category: 'flight' },
    throttle_down: { key: 'control', displayName: 'Ctrl', category: 'flight' },
    // UI
    pause: { key: 'escape', displayName: 'ESC', category: 'ui' },
    minimap_toggle: { key: 'm', displayName: 'M', category: 'ui' },
    minimap_size: { key: 'u', displayName: 'U', category: 'ui' },
    // Camera
    camera_next: { key: 'c', displayName: 'C', category: 'camera' },
    camera_prev: { key: 'v', displayName: 'V', category: 'camera' },
}

const STORAGE_KEY = 'otter_planes_keybinds'

class KeybindManager {
    private bindings: KeybindMap
    private pressedKeys: Set<string> = new Set()
    private listeners: Map<KeybindAction, Set<() => void>> = new Map()
    private initialized = false

    constructor() {
        this.bindings = this.loadBindings()
    }

    // Initialize key listeners (call once on app start)
    init() {
        if (this.initialized) return
        this.initialized = true

        window.addEventListener('keydown', this.handleKeyDown.bind(this))
        window.addEventListener('keyup', this.handleKeyUp.bind(this))
        window.addEventListener('blur', this.handleBlur.bind(this))
    }

    // Cleanup
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this))
        window.removeEventListener('keyup', this.handleKeyUp.bind(this))
        window.removeEventListener('blur', this.handleBlur.bind(this))
        this.initialized = false
    }

    private handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase()
        const wasPressed = this.pressedKeys.has(key)
        this.pressedKeys.add(key)

        // Trigger action listeners for key-down (only on initial press)
        if (!wasPressed) {
            for (const [action, binding] of Object.entries(this.bindings)) {
                if (binding.key === key) {
                    this.notifyListeners(action as KeybindAction)
                }
            }
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.pressedKeys.delete(e.key.toLowerCase())
    }

    private handleBlur() {
        // Clear all pressed keys when window loses focus
        this.pressedKeys.clear()
    }

    private notifyListeners(action: KeybindAction) {
        const actionListeners = this.listeners.get(action)
        if (actionListeners) {
            actionListeners.forEach(callback => callback())
        }
    }

    // Check if an action's key is currently pressed
    isPressed(action: KeybindAction): boolean {
        const binding = this.bindings[action]
        return binding ? this.pressedKeys.has(binding.key) : false
    }

    // Get the display name for a keybind
    getDisplayKey(action: KeybindAction): string {
        return this.bindings[action]?.displayName ?? '?'
    }

    // Get the raw key for a keybind
    getKey(action: KeybindAction): string {
        return this.bindings[action]?.key ?? ''
    }

    // Register a callback for when an action is triggered
    onAction(action: KeybindAction, callback: () => void): () => void {
        if (!this.listeners.has(action)) {
            this.listeners.set(action, new Set())
        }
        this.listeners.get(action)!.add(callback)

        // Return unsubscribe function
        return () => {
            this.listeners.get(action)?.delete(callback)
        }
    }

    // Update a keybind
    setBinding(action: KeybindAction, key: string, displayName?: string) {
        this.bindings[action] = {
            ...this.bindings[action],
            key: key.toLowerCase(),
            displayName: displayName ?? key.toUpperCase(),
        }
        this.saveBindings()
    }

    // Reset all bindings to default
    resetToDefaults() {
        this.bindings = { ...DEFAULT_KEYBINDS }
        this.saveBindings()
    }

    // Get all bindings for a category
    getBindingsByCategory(category: 'flight' | 'ui' | 'camera'): [KeybindAction, KeyBinding][] {
        return Object.entries(this.bindings)
            .filter(([_, binding]) => binding.category === category) as [KeybindAction, KeyBinding][]
    }

    // Get all bindings
    getAllBindings(): KeybindMap {
        return { ...this.bindings }
    }

    private loadBindings(): KeybindMap {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                // Merge with defaults in case new keybinds were added
                return { ...DEFAULT_KEYBINDS, ...parsed }
            }
        } catch (e) {
            console.warn('Failed to load keybinds from storage:', e)
        }
        return { ...DEFAULT_KEYBINDS }
    }

    private saveBindings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bindings))
        } catch (e) {
            console.warn('Failed to save keybinds to storage:', e)
        }
    }
}

// Singleton instance
export const keybindManager = new KeybindManager()

// React hook for using keybinds
import { useEffect, useState } from 'react'

export function useKeybind(action: KeybindAction): boolean {
    const [pressed, setPressed] = useState(false)

    useEffect(() => {
        const checkPressed = () => {
            setPressed(keybindManager.isPressed(action))
        }

        // Check on keydown/keyup
        const handleKeyChange = () => {
            requestAnimationFrame(checkPressed)
        }

        window.addEventListener('keydown', handleKeyChange)
        window.addEventListener('keyup', handleKeyChange)

        return () => {
            window.removeEventListener('keydown', handleKeyChange)
            window.removeEventListener('keyup', handleKeyChange)
        }
    }, [action])

    return pressed
}

export function useKeybindAction(action: KeybindAction, callback: () => void) {
    useEffect(() => {
        return keybindManager.onAction(action, callback)
    }, [action, callback])
}

export function useKeybindDisplay(action: KeybindAction): string {
    return keybindManager.getDisplayKey(action)
}
