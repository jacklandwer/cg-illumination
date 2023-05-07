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
out vec3 model_position;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Calculate vertex displacement
    float gray = texture(heightmap, uv)[0];
    float d = 2.0 * height_scalar * (gray - 0.5);

    // Calculate new world height
    vec4 new_pos = vec4(world_pos);
    new_pos.y += d;

    // Find nearby points
    vec3 nearpoint1 = vec3(world_pos.x + (0.001 * ground_size.x), world_pos.y+d, world_pos.z);
    vec3 nearpoint2 = vec3(world_pos.x, world_pos.y+d, world_pos.z + (0.001 * ground_size.y));

    // Calculate normal
    vec3 tangent = nearpoint1 - new_pos.xyz;
    vec3 bitangent = nearpoint2 - new_pos.xyz;
    vec3 normal = normalize(cross(bitangent, tangent));

    // Pass UV, normal,and position to fragment
    model_uv = uv;
    model_position = vec3(world * vec4(position, 1.0));
    mat3 world_transpose = mat3(inverse(transpose(world)));
    model_normal = normalize(world_transpose * normal);

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * new_pos;
}
