# rit-opoly

A small stationary floating island built with React Three Fiber, React, TypeScript, and Three.js. It includes a capsule player, a central board placeholder, mint grass with wind and player interaction, rocks, and flowers.

Run `npm install` and `npm run dev` to play locally. On Windows PowerShell, use `npm.cmd` if script execution is disabled.

- WASD / arrow keys: camera-relative movement
- Click and drag: orbit the camera around the player
- Mouse wheel: zoom
- Shift: sprint
- Space: jump
- R / Back to start: reset player and camera
- Touch devices: directional buttons and drag to look
- Settings (top right): live tuning; Escape closes the panel

Default walking speed is 6 units/second and sprint speed is 10. Board and rock collisions plus an inset edge boundary keep the player on the island. Movement pauses while settings are open, and input focus stays with the controls. The board remains a visual placeholder without game rules or multiplayer.

Settings include walk/sprint speed, jump strength, grass density, height, sway amount, sway speed, color, grass shadows, render scale, and automatic render-quality adjustment. Values save locally on this device; Restore defaults resets them. Sprint speed is always at least walking speed. The settings panel shows FPS, frame time, draw calls, triangle count, and the current render scale.

Grass is generated once into independently culled 8-by-8-unit batches. Batches are invisible rendering divisions: all use the same economical five-vertex blade shape and shadow behavior. Thinning is evaluated at each blade's world position, with smooth transitions independent of batch boundaries. Conservative CPU draw limits skip blades that cannot contribute, and blade width compensates for reduced distant density. Changes to density adjust draw counts; height, sway, and color update shader values without rebuilding instance buffers. Grass does not cast expensive per-blade shadows. Repeated flowers and board tiles use instancing. Automatic quality can lower render resolution under sustained load and gradually restore it up to the selected maximum.

Sway uses a shared 64-by-64 turbulence texture generated once. Blades move quickly back and forth over a small distance, with anchored roots and faster tip flutter. Wind does not lower the blades. Sway amount controls excursion; Sway speed independently controls timing. Zero amount disables sway completely. Animation updates GPU uniforms without rebuilding grass or updating individual blades on the CPU.

Source structure:

- `src/App.tsx`: app state and composition
- `src/game/GameCanvas.tsx`, `GameScene.tsx`: React Three Fiber canvas and scene composition
- `src/game/Player.tsx`, `PlayerAvatar.tsx`, `FollowCamera.tsx`: movement, character, and camera
- `src/game/Board.tsx`, `BoardTiles.tsx`, `Island.tsx`, `Rocks.tsx`, `Flowers.tsx`, `Lighting.tsx`: individual scene components
- `src/game/Grass.tsx`, `grass/GrassPatch.tsx`: grass components
- `src/game/grass/`: reusable layout, geometry, shader, and level-of-detail helpers
- `src/components/`: HUD, touch controls, settings, and performance readout
- `src/hooks/`: keyboard input, camera input, and persisted settings
- `src/settings/gameSettings.ts`: typed defaults, limits, and validation
- `src/game/world.ts`: island dimensions, procedural terrain, and collision constraints

Run `npm run build` for TypeScript checking and a production build. Run `npm test` for terrain, collision, settings, and grass layout/detail checks (Node 22.6+).
