import vertexShaderSource from "./shaders/part1/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/part1/fragment.glsl?raw";
import { Texture } from "./texture";
import { Content } from "./content";
import { Camera } from "./camera";
import { Rect } from "./rect";

export class Renderer {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private camera!: Camera;
  private projectionViewMatrixLocation!: WebGLUniformLocation;
  private buffer!: WebGLBuffer;

  constructor() {}

  public async initialize() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.camera = new Camera(this.canvas.width, this.canvas.height);

    await Content.initialize(this.gl);

    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.projectionViewMatrixLocation = this.gl.getUniformLocation(
      this.program,
      "projectionViewMatrix"
    )!;
    this.gl.useProgram(this.program);

    const x = 100;
    const y = 100;
    const w = 200;
    const h = 200;

    // prettier-ignore
    this.buffer = this.createBuffer([
      // x, y, u, v, r, g, b
      x, y, 0, 1, 1, 1, 1,  // left top
      x+w, y, 1, 1, 1, 1, 1,   // right top
      x+w, y+h, 1, 0, 1, 1, 1,  // right bottom
      x, y+h, 0, 0, 1, 1, 1, // left bottom
    ]);

    const stride =
      2 * Float32Array.BYTES_PER_ELEMENT +
      2 * Float32Array.BYTES_PER_ELEMENT +
      3 * Float32Array.BYTES_PER_ELEMENT;

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.enableVertexAttribArray(0);

    this.gl.vertexAttribPointer(
      1,
      2,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    this.gl.enableVertexAttribArray(1);

    this.gl.vertexAttribPointer(
      2,
      3,
      this.gl.FLOAT,
      false,
      stride,
      4 * Float32Array.BYTES_PER_ELEMENT
    );
    this.gl.enableVertexAttribArray(2);

    // prettier-ignore
    const indexBuffer = this.createIndexBuffer(
      new Uint8Array([
        0, 1, 3,
        1, 2, 3
        ])
    );
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

  private createIndexBuffer(
    data: Uint8Array | Uint16Array | Uint32Array
  ): WebGLBuffer {
    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }

  public draw(): void {
    this.camera.update();

    this.gl.clearColor(0.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.bindTexture(this.gl.TEXTURE_2D, Content.playerTexture.texture);

    this.gl.uniformMatrix4fv(
      this.projectionViewMatrixLocation,
      false,
      this.camera.projectionViewMatrix
    );

    // this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_BYTE, 0);

    window.requestAnimationFrame(() => this.draw());
  }
}
