#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;

void main() {
    /*
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Pass vertex normal onto the fragment shader
    model_normal = vec3(0.0, 1.0, 0.0);
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
    */

    
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Apply height displacement
    vec2 normalized_pos = (position.xy + vec2(0.5)) / ground_size;
    float height = texture(heightmap, normalized_pos).r * height_scalar;
    vec4 displaced_pos = vec4(position.x, position.y + height, position.z, 1.0);

    // Calculate normal for displaced vertex
    vec3 normal = normalize(cross(dFdx(displaced_pos.xyz), dFdy(displaced_pos.xyz)));

    // Pass vertex normal and texcoord onto the fragment shader
    model_normal = normal;
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * displaced_pos;


}
