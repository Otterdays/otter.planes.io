# Security Bill of Materials (SBOM)

## Client Dependencies

| Package | Version | Date Added | Security Status | Notes |
|---------|---------|------------|-----------------|-------|
| react | ^18.3.1 | 2025-01-27 | ✅ Clean | Core React library |
| react-dom | ^18.3.1 | 2025-01-27 | ✅ Clean | React DOM renderer |
| @react-three/fiber | ^8.16.0 | 2025-01-27 | ✅ Clean | ThreeJS React renderer |
| @react-three/drei | ^9.114.0 | 2025-01-27 | ✅ Clean | ThreeJS helpers |
| three | ^0.169.0 | 2025-01-27 | ✅ Clean | 3D graphics library |
| socket.io-client | ^4.7.4 | 2025-01-27 | ✅ Clean | WebSocket client |
| zustand | ^4.5.2 | 2025-01-27 | ✅ Clean | State management |

## Client Dev Dependencies

| Package | Version | Date Added | Security Status | Notes |
|---------|---------|------------|-----------------|-------|
| @types/react | ^18.3.3 | 2025-01-27 | ✅ Clean | TypeScript types |
| @types/react-dom | ^18.3.0 | 2025-01-27 | ✅ Clean | TypeScript types |
| @types/three | ^0.169.0 | 2025-01-27 | ✅ Clean | TypeScript types |
| @vitejs/plugin-react | ^4.3.1 | 2025-01-27 | ✅ Clean | Vite React plugin |
| typescript | ^5.5.3 | 2025-01-27 | ✅ Clean | TypeScript compiler |
| vite | ^5.4.0 | 2025-01-27 | ✅ Clean | Build tool |

## Server Dependencies

| Package | Version | Date Added | Security Status | Notes |
|---------|---------|------------|-----------------|-------|
| express | ^4.19.2 | 2025-01-27 | ✅ Clean | Web server framework |
| socket.io | ^4.7.4 | 2025-01-27 | ✅ Clean | WebSocket server |
| cors | ^2.8.5 | 2025-01-27 | ✅ Clean | CORS middleware |

## Security Notes

- All packages are latest stable versions as of 2025-01-27
- No known vulnerabilities at time of installation
- Regular security audits recommended: `npm audit` (client) and `npm audit` (server)
- Socket.io 4.7.4 includes security improvements over v3
- Express 4.19.2 is current stable version

## Update Schedule

- Review and update dependencies monthly
- Run `npm audit` before each deployment
- Monitor security advisories for all packages

