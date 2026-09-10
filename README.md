# Rob Your Neighbor

A small browser-based 3D stealth prototype inspired by the **genre** of neighbor-hiding games.

## Play

Open `index.html` in a modern browser. It uses Three.js and cannon-es from jsDelivr.

### Controls

- **WASD** — move
- **Shift** — sprint (creates more noise)
- **Mouse** — look
- **E** — pick up / drop furniture
- **F** — open / close nearby doors
- **Esc** — release the mouse

## Gameplay

Steal furniture from the house and carry it back to the front/safe area. Furniture has physics and makes a noise when dropped. The neighbor normally patrols between rooms and can stumble across the player naturally.

The neighbor has a worry meter. Missing furniture gradually increases suspicion, while loud events such as sprinting, opening doors, and dropping furniture create noise. When worry reaches 100%, the neighbor learns the player's current position, uses the house navigation graph to chase that location, and then searches nearby.

This is the first playable prototype; future iterations can add better collision, hiding spots, more sophisticated navigation, vision/line-of-sight, animations, sound effects, multiple floors, and a larger house.
