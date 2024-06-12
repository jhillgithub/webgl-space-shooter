class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
  }

  public render() {
    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}

const renderer = new Renderer();
renderer.render();
