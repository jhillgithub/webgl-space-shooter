# Notes

## Part 1 notes

we need to create a renderer class and do a clear color and clear the color buffer bit. This was not explained well yet.

## Part 2 - Rendering Triangle

GPU Pipeline:

1. data as vertices

- vertex points as an array buffer
- screen coords are -1 to 1 starting at the middle of the screen at 0

2. vertex shader

- responsible for saying where the data will be on the screen via gl_Position
- runs once per vertex

3. Primitive assembly

- can draw things like lines between vertices to create the triangles

4. Rasterization

- assigns pixels within the triangles

5. Pixel shader

- runs for every pixel
- determines the final color of the pixels
- this is the fragment shader
- set fragColor as the output

6. Frame Buffer to draw things on screen

---

steps to compile and run vertex shader

1. import shader files as raw strings

```ts
import vertexShaderSource from "./shaders/part1/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/part1/fragment.glsl?raw";
```

2. add createShader method to compile the shaders

```ts
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
```

3. createProgram method to compile the shader program

```ts
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
```

4. createBuffer to create data buffers

```ts
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
```

5. create the shaders, shader program, and buffers in the constructor. Note, the first buffer is the vertices and the first param is the location (location in the shader file) and the second param is the (type vec2 in this case)
   the second buffer is the rbg per vertex which is location 1 and type vec3

```ts
constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;

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

    this.createBuffer([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5]);

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.createBuffer([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);
    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(1);
  }
```

Finally, draw the arrays

```ts
public render(): void {
    this.gl.clearColor(0.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
```

Here is the vertex.glsl

```glsl
#version 300 es
precision mediump float;

layout(location=0) in vec2 a_position;
layout(location=1) in vec3 a_color;

out vec3 v_color;

void main()
{
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}
```

here is the fragment.glsl

```glsl
#version 300 es
precision mediump float;

in vec3 v_color;
out vec4 fragColor;

void main()
{
  fragColor = vec4(v_color, 1.0);
}
```

---

Note: this draws the primitives which in this case is triangles. However, you can also draw points or lines. This corresponds to the primitive assembly step of the graphics pipeline where you choose the shape to draw.

For points, you can do this:

```ts
this.gl.drawArrays(this.gl.POINTS, 0, 3);
```

But, you also need to set a larger point size in the vertex shader so you can see the points. this is done via gl_PointSize

```glsl
gl_PointSize = 20.0;
```

In order to draw lines, you need to increase the number of points in the data buffer so that there is a start and stop for each segment. You also need to duplicate the colors.

```ts
this.createBuffer([
  -0.5, -0.5,
  -0.5, 0.5,
  -0.5, 0.5,
  0.5, -0.5,
  0.5, -0.5,
  -0.5, -0.5
]);

this.createBuffer({
  1,0,0,
  1,0,0,
  0,1,0,
  0,1,0,
  0,0,1,
  0,0,1
})
```

and then increase the number of points

```ts
this.gl.drawArrays(this.gl.LINES, 0, 6);
```

## Part 3 - Texturing

mipmap will generate different sizes

---

you can await your texture to load and then do the logic in the case that you don't want to request the animation loop.

---

You can also create a placeholder image until the texture loads via:

```ts
this.gl.texImage2D(
  this.gl.TEXTURE_2D,
  0,
  this.gl.RGBA,
  1, // width of 1 pixel
  1, // height of 1 pixel
  0, // border of 0 pixels
  this.gl.RGBA,
  this.gl.UNSIGNED_BYTE,
  new Uint8Array([255, 0, 255, 255]) // rgba
);
```

---

the image loads upside down due to legacy reasons from c-lang.

You can set this globally via

```ts
this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
```

---

you can repeat the image or show part of the image by adjustting the texture coordinates values used to create the texture buffer. The image goes from 0 to 1, so changing the points to go from 0 to 2 will repeat, or 0 to 0.5 will show half.

## Part 4 - Drawing with an Index Buffer

Index buffers allow you to reuse vertex points.

```ts
const indexBuffer = this.createIndexBuffer(new Uint8Array([0, 1, 2, 2, 1, 3]));
```

```ts
private createIndexBuffer(
    data: Uint8Array | Uint16Array | Uint32Array
  ): WebGLBuffer {
    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }
```

you then change the draw method from drawArrays to drawElements

```ts
// this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_BYTE, 0);
```

## Interleaved Buffers

You can combine the position buffer, texBuffer, and colorBuffer into one
x, y, u, v, r, g, b

```ts
// prettier-ignore
    const buffer = this.createBuffer([
      // x, y, u, v, r, g, b
      -0.5, -0.5, 0, 0, 1, 1, 1,
      -0.5, 0.5, 0, 1, 1, 1, 1,
      0.5, -0.5, 1, 0, 1, 1, 1,
      0.5, 0.5, 1, 1, 1, 1, 1,
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

    const indexBuffer = this.createIndexBuffer(
      new Uint8Array([0, 1, 2, 2, 1, 3])
    );
  }
```
