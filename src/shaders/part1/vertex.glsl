#version 300 es
precision mediump float;

layout(location=0) in vec2 a_position;
layout(location=1) in vec2 aTextureCoords;
layout(location=2) in vec3 a_color;

out vec2 vTextureCoords;
out vec3 v_color;

uniform mat4 projectionViewMatrix;



void main()
{
  gl_Position = projectionViewMatrix * vec4(a_position, 0.0, 1.0);
  vTextureCoords = aTextureCoords;
  v_color = a_color;
}