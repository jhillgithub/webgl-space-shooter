export class ProgramUtil {
  public static createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.error(`prgram failed to link ${gl.getProgramInfoLog(program)}`);
      gl.deleteProgram(program);
    }
    return program;
  }

  public static createShader(
    gl: WebGL2RenderingContext,
    type: number,
    shaderSource: string
  ): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.error(`shader failed to compile ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }
}
