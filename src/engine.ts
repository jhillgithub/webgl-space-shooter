import { Color } from "./color";
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
      Content.testUvTexture,
      new Rect(100, 100, 99, 75)
    );

    const playerSprite = Content.sprites["playerShip1_blue"];
    playerSprite.drawRect.x += 0.1;
    playerSprite.drawRect.y += 0.1;
    this.spriteRenderer.drawSpriteSource(
      playerSprite.texture,
      playerSprite.drawRect,
      playerSprite.sourceRect
    );

    const shieldSprite = Content.sprites["shield3"];
    this.spriteRenderer.drawSpriteSource(
      shieldSprite.texture,
      shieldSprite.drawRect,
      shieldSprite.sourceRect,
      new Color(0, 1, 0)
    );

    // move shield with player
    shieldSprite.drawRect.x = playerSprite.drawRect.x - 22;
    shieldSprite.drawRect.y = playerSprite.drawRect.y - 25;

    // // Test UV Image
    // const size = 248;
    // this.spriteRenderer.drawSpriteSource(
    //   Content.testUvTexture,
    //   new Rect(0, 0, 100, 100),
    //   new Rect(0, 0, size, size)
    // );
    this.spriteRenderer.end();

    window.requestAnimationFrame(() => this.draw());
  }
}
