# rit-opoly

A small stationary floating island built with React Three Fiber, React, TypeScript, and Three.js. It includes a capsule player, a central board textured with src/assets/board.png, mint grass with wind and player interaction, rocks, and flowers.

Run `npm install` and `npm run dev` to play locally. On Windows PowerShell, use `npm.cmd` if script execution is disabled.

- WASD / arrow keys: camera-relative movement
- Click and drag: orbit the camera around the player
- Mouse wheel: zoom
- Shift: sprint
- Space: jump
- R / Back to start: reset player and camera
- Touch devices: directional buttons and drag to look
- Settings (top right): live tuning; Escape closes the panel

Default walking speed is 6 units/second, sprint speed is 10, and jump strength is 8.5. The player can jump onto the board and rocks, jump again from their tops, and fall back to the ground when walking off. Height-aware capsule collisions use the same transformed rock geometry as the visible meshes; an inset edge boundary keeps the player on the island. Movement pauses while settings or the room menu are open, and input focus stays with the controls. The board remains a visual placeholder without board game rules.

Settings include walk/sprint speed, jump strength, grass density, height, sway amount, sway speed, color, grass shadows, render scale, and automatic render-quality adjustment. Values save locally on this device; Restore defaults resets them. Sprint speed is always at least walking speed. The settings panel shows FPS, frame time, draw calls, triangle count, and the current render scale.

Grass is generated once into independently culled 8-by-8-unit batches. Batches are invisible rendering divisions: all use the same economical five-vertex blade shape and shadow behavior. Thinning is evaluated at each blade's world position, with smooth transitions independent of batch boundaries. Conservative CPU draw limits skip blades that cannot contribute, and blade width compensates for reduced distant density. Changes to density adjust draw counts; height, sway, and color update shader values without rebuilding instance buffers. Grass does not cast expensive per-blade shadows. Flowers use instancing; the board artwork uses an unlit textured surface plus a shadow overlay, so print colors remain clear while receiving character shadows. Automatic quality can lower render resolution under sustained load and gradually restore it up to the selected maximum.

Sway uses a shared 64-by-64 turbulence texture generated once. Blades move quickly back and forth over a small distance, with anchored roots and faster tip flutter. Wind does not lower the blades. Sway amount controls excursion; Sway speed independently controls timing. Zero amount disables sway completely. Animation updates GPU uniforms without rebuilding grass or updating individual blades on the CPU.

Source structure:

- `src/App.tsx`: app state and composition
- `src/game/GameCanvas.tsx`, `GameScene.tsx`: React Three Fiber canvas and scene composition
- `src/game/Player.tsx`, `PlayerAvatar.tsx`, `FollowCamera.tsx`: movement, character, and camera
- `src/game/Board.tsx`, `BoardSurface.tsx`, `Island.tsx`, `Rocks.tsx`, `Flowers.tsx`, `Lighting.tsx`: individual scene components
- `src/game/Grass.tsx`, `grass/GrassPatch.tsx`: grass components
- `src/game/grass/`: reusable layout, geometry, shader, and level-of-detail helpers
- `src/components/`: HUD, touch controls, settings, and performance readout
- `src/hooks/`: keyboard input, camera input, and persisted settings
- `src/multiplayer/`: connection hook, room menu, remote player components, and name labels
- `server/`: Colyseus server, room lifecycle, and multiplayer integration test
- `shared/`: synchronized player schema and network protocol
- `src/settings/gameSettings.ts`: typed defaults, limits, and validation
- `src/game/world.ts`: island dimensions and procedural terrain; `playerPhysics.ts` and `rockTransform.ts`: shared collider geometry and movement physics

Run `npm run build` for TypeScript checking and a production build. Run `npm test` for terrain, collision, settings, and grass layout/detail checks (Node 22.6+).


The board uses maximum supported anisotropic filtering and a mild mip bias to retain detail at oblique angles. Automatic quality will not lower the render scale below 85% unless a lower maximum is explicitly selected. The original PNG still sets the upper limit on artwork detail.

## Multiplayer

Requires Node 22.6+ (tested with 22.15). `npm run dev` starts both Vite on port 5173 and Colyseus on port 2567. The browser uses Vite's `/multiplayer` HTTP/WebSocket proxy, so both clients can use the same frontend address.

1. Open the app, enter your name, and choose **Create a room**.
2. Share the room code or invite link. The second player opens the app in another tab/browser or device and chooses **Join room**.
3. Choose **Back to the meadow** to play. **Play together** / the player count reopens room controls.

For a second device on your local network, open the **Network** URL printed by Vite on both devices (a localhost invite only works on your own computer). The host must allow inbound access to Vite's port through its firewall. **Explore solo for now** keeps the existing single-player experience available without a room server.

Rooms support eight players, with distinct spawn positions and colors. Position, jump height, and heading synchronize at up to 20 updates per second; remote characters interpolate smoothly without React state updates on every movement packet. The server removes characters on leaving and reserves a disconnected seat for 15 seconds to allow automatic reconnection. Rooms are temporary and end when empty or when the server restarts. Movement is client-controlled with server checks for finite values, speed, island bounds, and ownership; this is a free-roam prototype rather than authoritative competitive physics.

For future internet hosting, deploy the Colyseus server on a host that supports persistent WebSockets, running `npm run start:server` with Node 22.6+ and the project's server/shared/source files and dependencies. `PORT` and `HOST` configure its listener. Deploy the frontend `dist` separately and set `VITE_COLYSEUS_URL` to the public server's HTTPS/WSS endpoint **before building** (see `.env.example`). HTTPS pages require a secure backend endpoint. No public deployment is required for local testing.

`npm run dev:client` and `npm run dev:server` run the services separately. `npm run test:multiplayer` launches an ephemeral server and verifies two SDK clients joining, moving, jumping, resetting, room isolation, invalid updates, and leaving.

