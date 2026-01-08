# 📱 Future Thesis: Mobile Port & Social Hangar Cloud
**Project:** Otter Planes IO
**Date:** 2026-01-08
**Objective:** Enable mobile accessibility, cloud synchronization, and collaborative list sharing (Shared Hangars).

## 1. Executive Summary
The goal is to transition *Otter Planes IO* from a local-only browser game to a persistent, cross-platform cloud application. This will allow users (you and your fiancée) to:
1.  **Access the Plane Builder on Mobile**: Design aircraft on the go using touch interfaces.
2.  **Cloud Sync**: Have your saved planes available on any device (PC or Phone).
3.  **Shared Hangars**: Create shared lists ("Fleets") where both users can add, view, and update plane designs in real-time.

---

## 2. Technical Architecture Changes

### A. Mobile Adaptation (The "Have it on our phones" part)
Currently, the game is optimized for keyboard/mouse. To make it viable on phones, we need a **Responsive Web App** approach.

**Strategy: Progressive Web App (PWA)**
- **Why**: avoids App Store approval; "Install" directly from Safari/Chrome.
- **Implementation**:
    - Add `manifest.json` and service workers for offline caching.
    - **Input Mapping**:
        - *Builder*: Touch drag-and-drop for parts, pinch-to-zoom for camera.
        - *Flight*: Virtual on-screen joysticks (nipple.js) or device accelerometer (gyro) steering.
    - **UI Scaling**: CSS media queries to stack the Plane Builder layout vertically on portrait screens.

### B. "The List" System (Backend Persistence)
Currently, planes are saved in `localStorage` (browser-only). To share them, we need a backend database.

**Recommended Stack: Supabase (PostgreSQL + Auth)**
- **Why**: Instant setup, free tier is generous, excellent relational data support, real-time subscriptions.
- **Data Schema**:
    - `users`: ID, Email/Username.
    - `hangars`: ID, Owner_ID, Name (e.g., "Our Wedding Fleet").
    - `hangar_members`: Hangar_ID, User_ID (Permissions: 'view', 'edit').
    - `planes`: ID, Hangar_ID, JSON_Config, Creator_ID.

### C. Sharing Mechanics ("Import and Update")

**Mechanism 1: The "Shared Fridge"**
- You create a Hangar called "Joint Fleet".
- You invite your fiancée's account.
- Both of you see this Hangar in your "Load Plane" menu.
- If you edit "Otter One" on your PC, she instantly sees the update on her phone.

**Mechanism 2: Magic Links (Quick Share)**
- Generate a URL: `otter.planes.io/share?build=abc123compressed...`
- Opening the link on her phone automatically imports that plane into her local storage or cloud account.

---

## 3. Implementation Roadmap

### Phase 1: Mobile UI & Touch Controls (Frontend)
*Goal: Make the site usable on a phone.*
1.  **Viewport Fixes**: Prevent "pull-to-refresh" and pinch-zooming on the game canvas.
2.  **Virtual Controls**: Add on-screen overlay for Throttle/Brake/Shoot/Yaw when touch is detected.
3.  **Portrait Mode**: Detect mobile aspect ratio and force "Landscape" OR redesign HUD for vertical play.

### Phase 2: The Cloud Backend (Auth & DB)
*Goal: Stop losing planes when clearing cookies.*
1.  **Initialize Supabase**: Create project.
2.  **Integrate Auth**: "Sign in with Google" or simple Email/Password.
3.  **Cloud Storage Hook**: Replace the formatted `localStorage` calls with `supabase.from('planes').select('*')`.

### Phase 3: Social Features
*Goal: The Shared List.*
1.  **Hangar Management UI**: A new screen to create folders (Hangars).
2.  **Collaboration**: "Share Hangar" button > Enter email.
3.  **Real-time Sync**: Use Supabase Realtime to update the list *as you look at it* if she adds a plane.

## 4. Alternative "Low Code" Solution
If building a full backend sounds exhausted for just two people:
- **Export/Import via Text**: We already have "Copy to Clipboard". You can just paste the JSON string into iMessage/WhatsApp. She copies it and clicks "Import from Clipboard".
- **Gist Sync**: Use a simple GitHub Gist as a database. Both apps read from the same raw Gist URL (requires an API key, slightly hacky but works).

---

## 5. Conclusion
To achieve the "straight up online way" to share and update lists:
1.  **Convert to PWA** for easy phone access.
2.  **Add a lightweight Backend (Supabase)** for the shared "Hangar" database.
3.  **Implement Touch Controls** so the phone experience isn't miserable.

*Recommendation: Start with Phase 1 (Mobile Controls) so you can actually fly, then use the "Copy/Paste" method for sharing until the Backend is built.*
