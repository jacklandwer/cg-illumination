#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;

// Output
smooth out vec3 model_normal;
out vec2 model_uv;
out vec3 model_position;

void main() {
    // Pass vertex normal onto the fragment shader
    mat3 world_transpose = mat3(inverse(transpose(world)));
    model_normal = normalize(world_transpose * normal);

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;
 
    // Pass position
    model_position = vec3(world * vec4(position, 1));

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
