// Test setup for Vitest
import '@testing-library/jest-dom'

// Mock WebGL context for Three.js tests
class MockWebGLRenderingContext {
    canvas = document.createElement('canvas')
    getExtension() { return null }
    getParameter() { return 0 }
    createShader() { return {} }
    deleteShader() { }
    shaderSource() { }
    compileShader() { }
    getShaderParameter() { return true }
    createProgram() { return {} }
    deleteProgram() { }
    attachShader() { }
    linkProgram() { }
    getProgramParameter() { return true }
    useProgram() { }
    getUniformLocation() { return {} }
    getAttribLocation() { return 0 }
    createBuffer() { return {} }
    bindBuffer() { }
    bufferData() { }
    enableVertexAttribArray() { }
    disableVertexAttribArray() { }
    vertexAttribPointer() { }
    createTexture() { return {} }
    bindTexture() { }
    texParameteri() { }
    texImage2D() { }
    createFramebuffer() { return {} }
    bindFramebuffer() { }
    framebufferTexture2D() { }
    checkFramebufferStatus() { return 36053 } // FRAMEBUFFER_COMPLETE
    createRenderbuffer() { return {} }
    bindRenderbuffer() { }
    renderbufferStorage() { }
    framebufferRenderbuffer() { }
    viewport() { }
    clear() { }
    clearColor() { }
    enable() { }
    disable() { }
    blendFunc() { }
    depthFunc() { }
    cullFace() { }
    frontFace() { }
    drawArrays() { }
    drawElements() { }
    uniform1f() { }
    uniform1i() { }
    uniform2f() { }
    uniform3f() { }
    uniform4f() { }
    uniformMatrix4fv() { }
    activeTexture() { }
    pixelStorei() { }
    generateMipmap() { }
    getShaderInfoLog() { return '' }
    getProgramInfoLog() { return '' }
}

// Mock canvas getContext - use type assertion to bypass strict typing
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextType: string,
    ...args: unknown[]
) {
    if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
        return new MockWebGLRenderingContext() as unknown as RenderingContext
    }
    return originalGetContext.call(this, contextType as never, ...(args as []))
} as typeof HTMLCanvasElement.prototype.getContext

// Mock requestAnimationFrame
if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
        return setTimeout(callback, 16) as unknown as number
    }
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
    globalThis.cancelAnimationFrame = (id: number) => {
        clearTimeout(id)
    }
}

// Mock ResizeObserver
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    } as unknown as typeof ResizeObserver
}

// Mock IntersectionObserver  
if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class IntersectionObserver {
        constructor() { }
        observe() { }
        unobserve() { }
        disconnect() { }
        root = null
        rootMargin = ''
        thresholds: number[] = []
        takeRecords() { return [] }
    } as unknown as typeof IntersectionObserver
}

