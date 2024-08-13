#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec3 v_color;
in vec2 vTextureCoords;
out vec4 fragColor;


void main()
{
  fragColor = texture(uTexture, vTextureCoords) * vec4(v_color, 1.0);
}