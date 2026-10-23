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
- `src/music/`: audio playback hook, music controls, visualizer components, and GPU tile resources
- `src/settings/gameSettings.ts`: typed defaults, limits, and validation
- `src/game/world.ts`: island dimensions and procedural terrain; `playerPhysics.ts` and `rockTransform.ts`: shared collider geometry and movement physics

Run `npm run build` for TypeScript checking and a production build. Run `npm test` for terrain, collision, settings, and grass layout/detail checks (Node 22.6+).


The board uses maximum supported anisotropic filtering and a mild mip bias to retain detail at oblique angles. Automatic quality prioritizes movement performance and can lower render scale to 65% under sustained load, with a cooldown between resolution changes and slower recovery to prevent oscillation. The original PNG still sets the upper limit on artwork detail.

## Island, river and grass distance coverage

The island is roughly 88 units across. `src/game/worldConfig.ts` owns its outline, winding river, channel depth and bridge dimensions. The river and waterfall use two simple animated meshes. The arch bridge has a curved deck and parapets; movement samples the same 24-segment height profile as its geometry, so players can walk over it from either bank. Multiplayer validation accepts the expanded bounds and shallow river bed.

Close-up grass retains the original five-vertex mesh, density, material and wind. `src/game/grass/DistantGrass.tsx` adds a separate opaque mesh layer using one single-triangle blade for every four detailed blades, with the same palette and simpler sway. It blends in over 16–28 units while detailed grass fades out over 22–36 units. Roots are fixed in the world, and the blend is evaluated per blade. There are no camera-facing cards, alpha textures or per-frame instance-buffer uploads. The expanded layout preserves the original per-square-metre density and patch seeds.

## Multiplayer

Requires Node 22.6+ (tested with 22.15). `npm run dev` starts both Vite on port 5173 and Colyseus on port 2567. The browser uses Vite's `/multiplayer` HTTP/WebSocket proxy, so both clients can use the same frontend address.

1. Open the app, enter your name, and choose **Create a room**.
2. Share the room code or invite link. The second player opens the app in another tab/browser or device and chooses **Join room**.
3. Choose **Back to the meadow** to play. **Play together** / the player count reopens room controls.

For a second device on your local network, open the **Network** URL printed by Vite on both devices (a localhost invite only works on your own computer). The host must allow inbound access to Vite's port through its firewall. **Explore solo for now** keeps the existing single-player experience available without a room server.

Rooms support eight players, with distinct spawn positions and colors. Position, jump height, and heading synchronize at up to 20 updates per second; remote characters interpolate smoothly without React state updates on every movement packet. The server removes characters on leaving and reserves a disconnected seat for 15 seconds to allow automatic reconnection. Rooms are temporary and end when empty or when the server restarts. Movement is client-controlled with server checks for finite values, speed, island bounds, and ownership; this is a free-roam prototype rather than authoritative competitive physics.

For future internet hosting, deploy the Colyseus server on a host that supports persistent WebSockets, running `npm run start:server` with Node 22.6+ and the project's server/shared/source files and dependencies. `PORT` and `HOST` configure its listener. Deploy the frontend `dist` separately and set `VITE_COLYSEUS_URL` to the public server's HTTPS/WSS endpoint **before building** (see `.env.example`). HTTPS pages require a secure backend endpoint. No public deployment is required for local testing.

`npm run dev:client` and `npm run dev:server` run the services separately. `npm run test:multiplayer` launches an ephemeral server and verifies two SDK clients joining, moving, jumping, resetting, room isolation, invalid updates, and leaving.

## Music visualizer

A white speaker cube is centered beyond the board's far horizontal edge, directly ahead when viewed from the starting position. Its center sits halfway between that board edge and the island outline. Each of its four upright faces displays a 25 by 20 grid of rainbow tiles. The top and bottom remain plain white. At the default 200% scale, the cube is 6.4 units wide, deep, and tall, on a low plinth. The starting camera angle frames the speaker above the board. **Settings → Music visualizer → Speaker scale** adjusts the entire installation live from 50% to 300%, preserving its ground-level anchor and saving the preference on this device. **Animated speaker display** can disable all visualization work while retaining music playback.

Use the music controls at the bottom right to start/pause the looping track and adjust volume. Playback starts on a click to satisfy browser audio requirements, and stays local to each browser rather than synchronizing the room's playback position. The MP3 is streamed on demand; the audio graph is reused on pause/resume and closed when the app unmounts.

For performance, the display uses four opaque quads (eight triangles in one draw call), rather than thousands of extruding boxes. A lightweight shader paints anti-aliased tiles and one uniform circular ring. Overall RMS loudness from 1,024 waveform samples drives the entire circle's radius together; separate frequency bands never distort different parts of the circle. The tile grid stays square. Subpixel tiles blend to their average color to reduce shimmering while moving. A single smoothed audio-level uniform updates at at most 30 Hz; a paused, settled display does no analysis. There are no spectrum texture uploads, per-tile React updates, PBR lighting or tile shadow passes. Change dimensions, grid density and position in `src/music/visualizerConfig.ts`. `SpeakerCabinet.tsx` renders the white enclosure separately.

Grass is excluded from the full current board footprint, and fully thinned blades skip expensive wind/lighting shader work. Once the board texture loads, scene materials are precompiled asynchronously, including offscreen objects, to reduce first-visit shader stalls.

## Dice

The bottom-left **Roll dice** button rolls two six-sided dice. The dice launch from the near edge with randomized velocity and spin, then tumble, collide, bounce and roll across the board using live `cannon-es` box-body physics. Floor friction, restitution and angular momentum determine natural resting poses. The panel shows question marks during the throw, then reveals both values, their sum, doubles, and who rolled as soon as both dice sleep. The button unlocks at the same time; 4.2 seconds is only a fallback limit.

Solo rolls use the browser's cryptographic random generator with rejection sampling to avoid modulo bias. In a Colyseus room, the server generates both faces using Node's `crypto.randomInt`; client-supplied outcomes are ignored. A 750 ms room-wide request cooldown prevents spam without making players wait out the animation limit. The last result is stored in the room schema, so all players—including late joiners—see the same values. These dice outcomes can be used by future board movement and turn rules.

Dice UI, state, resources and scene components live separately in `src/dice/`; shared types and solo random generation are in `shared/dice.ts`. `dicePhysics.ts` manages only two dynamic bodies, the board and four boundary colliders at a fixed 120 Hz. Sleeping bodies stop simulation work. A prediction pass assigns a constant cube-symmetry rotation to the printed faces before launch, allowing server-selected outcomes to match natural landings without steering bodies or snapping them onto a target face. Clients use the same room/roll seed for reproducible, frame-rate-independent motion. Dice retain their landing positions and share geometry, a texture atlas and a material. `npm test` checks unbiased outcomes, stable contacts, natural sleep, frame-rate independence and printed results; `npm run test:multiplayer` checks synchronized results, cooldown, late joins and room isolation.

