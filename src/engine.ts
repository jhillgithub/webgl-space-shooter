import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";

export class Engine {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private spriteRenderer!: SpriteRenderer;

  constructor() {}

  public async initialize() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2", {
      alpha: false,
    }) as WebGL2RenderingContext;
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    await Content.initialize(this.gl);

    this.spriteRenderer = new SpriteRenderer(
      this.gl,
      this.canvas.width,
      this.canvas.height
    );
    await this.spriteRenderer.initialize();
  }

  public draw(): void {
    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.spriteRenderer.begin();
    this.spriteRenderer.drawSprite(
      Content.playerTexture,
      new Rect(100, 100, 99, 75)
    );
    this.spriteRenderer.drawSprite(Content.ufoBlue, new Rect(300, 300, 91, 91));

    this.spriteRenderer.drawSprite(
      Content.playerTexture,
      new Rect(150, 100, 99, 75)
    );
    this.spriteRenderer.drawSprite(Content.ufoBlue, new Rect(300, 100, 91, 91));
    this.spriteRenderer.drawSprite(Content.ufoBlue, new Rect(100, 300, 91, 91));
    this.spriteRenderer.end();

    window.requestAnimationFrame(() => this.draw());
  }
}
