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

## Part 3 - Texturing

## Part 4 - Drawing with an Index Buffer

##

```

```

```

```
