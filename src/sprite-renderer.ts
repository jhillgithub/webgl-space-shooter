import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { ProgramUtil } from "./program-util";
import { Rect } from "./rect";
import fragmentShaderSource from "./shaders/part1/fragment.glsl?raw";
import vertexShaderSource from "./shaders/part1/vertex.glsl?raw";
import { Texture } from "./texture";

export class SpriteRenderer {
  private program!: WebGLProgram;
  private camera!: Camera;
  private projectionViewMatrixLocation!: WebGLUniformLocation;
  private buffer!: WebGLBuffer;
  private data: Float32Array = new Float32Array(7 * 4);

  constructor(
    private gl: WebGL2RenderingContext,
    private width: number,
    private height: number
  ) {}

  public async initialize() {
    this.camera = new Camera(this.width, this.height);

    const vertexShader = ProgramUtil.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = ProgramUtil.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.program = ProgramUtil.createProgram(
      this.gl,
      vertexShader,
      fragmentShader
    );
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

  public begin() {
    this.camera.update();

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  public end() {}

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
}
