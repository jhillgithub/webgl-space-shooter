import { Engine } from "./engine";

const engine = new Engine();
engine.initialize().then(() => {
  engine.draw();
});
