import vertexShaderSource from "./shaders/part1/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/part1/fragment.glsl?raw";
import { Texture } from "./texture";
import { Content } from "./content";
import { Camera } from "./camera";
import { Rect } from "./rect";
import { BufferUtil } from "./buffer-util";

export class Renderer {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private camera!: Camera;
  private projectionViewMatrixLocation!: WebGLUniformLocation;
  private buffer!: WebGLBuffer;
  private data!: Float32Array = new Float32Array(7 * 4);

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
    this.buffer = BufferUtil.createArrayBuffer(this.gl, this.data);

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
    const indexBuffer = BufferUtil.createIndexBuffer(
      this.gl,
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

  public drawSprite(texture: Texture, rect: Rect) {
    this.gl.useProgram(this.program);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);

    this.gl.uniformMatrix4fv(
      this.projectionViewMatrixLocation,
      false,
      this.camera.projectionViewMatrix
    );

    // top left
    this.data[0] = rect.x; // x
    this.data[1] = rect.y; // y
    this.data[2] = 0; // u
    this.data[3] = 1; // v
    this.data[4] = 1; // r
    this.data[5] = 1; // g
    this.data[6] = 1; // b

    // top right
    this.data[7] = rect.x + rect.width;
    this.data[8] = rect.y;
    this.data[9] = 1;
    this.data[10] = 1;
    this.data[11] = 1;
    this.data[12] = 1;
    this.data[13] = 1;

    // bottom right
    this.data[14] = rect.x + rect.width;
    this.data[15] = rect.y + rect.height;
    this.data[16] = 1;
    this.data[17] = 0;
    this.data[18] = 1;
    this.data[19] = 1;
    this.data[20] = 1;

    // bottom left
    this.data[21] = rect.x;
    this.data[22] = rect.y + rect.height;
    this.data[23] = 0;
    this.data[24] = 0;
    this.data[25] = 1;
    this.data[26] = 1;
    this.data[27] = 1;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.data);

    // this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_BYTE, 0);
  }

  public draw(): void {
    this.camera.update();

    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.drawSprite(Content.playerTexture, new Rect(100, 100, 99, 75));
    this.drawSprite(Content.ufoBlue, new Rect(300, 100, 91, 91));
    this.drawSprite(Content.ufoBlue, new Rect(100, 300, 91, 91));

    window.requestAnimationFrame(() => this.draw());
  }
}
