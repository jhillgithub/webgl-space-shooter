import vertexShaderSource from "./shaders/part1/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/part1/fragment.glsl?raw";
import textureUri from "./assets/textures/test.png";

class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);

    this.texture = this.loadTexture(textureUri)!;

    const positionBuffer = this.createBuffer([
      -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
    ]);

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    const textureCoords = [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0];
    const textureBuffer = this.createBuffer(textureCoords);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(1);

    const colorBuffer = this.createBuffer([
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);
    this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(2);
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!success) {
      console.error(
        `prgram failed to link ${this.gl.getProgramInfoLog(program)}`
      );
      this.gl.deleteProgram(program);
    }
    return program;
  }

  private createShader(type: number, shaderSource: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);

    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      console.error(
        `shader failed to compile ${this.gl.getShaderInfoLog(shader)}`
      );
    }
    return shader;
  }

  private createBuffer(data: number[]): WebGLBuffer {
    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(data),
      this.gl.STATIC_DRAW
    );
    return buffer;
  }

  private loadTexture(uri: string): WebGLTexture {
    const texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    const image = new Image();
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      );
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    };
    image.src = uri;
    return texture;
  }

  public draw(): void {
    this.gl.clearColor(0.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    window.requestAnimationFrame(() => this.draw());
  }
}

const renderer = new Renderer();
renderer.draw();
