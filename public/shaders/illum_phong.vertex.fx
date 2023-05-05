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
out vec3 model_normal;
out vec2 model_uv;

void main() {
    /*
    // Pass vertex normal onto the fragment shader
    model_normal = normal;
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);;
    */


    // Transform vertex normal to world space and normalize it
    mat3 normal_matrix = transpose(inverse(mat3(world)));
    vec3 world_normal = normalize(normal_matrix * normal);
    // Pass vertex normal and texcoord onto the fragment shader
    model_normal = world_normal;
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
    

}
