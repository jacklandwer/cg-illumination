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
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Pass diffuse and specular illumination onto the fragment shader
    // diffuse_illum = vec3(0.0, 0.0, 0.0);
    // specular_illum = vec3(0.0, 0.0, 0.0);

    float gray = texture(heightmap, uv)[0];
    float d = 2.0 * height_scalar * (gray - 0.5);

    //new world position
    vec4 new_pos = vec4(world_pos);
    new_pos.y += d;

    //use nearby points to find normal vector
    //first find nearby uv
    vec2 nearby1uv = uv;
    nearby1uv.x += 0.001;

    //find displacement for nearby point
    float nearby1d = 2.0 * height_scalar * (texture(heightmap, nearby1uv)[0] - 0.5);

    vec3 nearby1 = vec3(new_pos.x + (0.001 * ground_size.x), world_pos.y+d, world_pos.z);

    //second nearby point
    vec2 nearby2uv = uv;
    nearby2uv.y += 0.001;

    float nearby2d = 2.0 * height_scalar * (texture(heightmap, nearby2uv)[0] - 0.5);
    vec3 nearby2 = vec3(new_pos.x, world_pos.y+d, world_pos.z + (0.001 * ground_size.y));

    //calculate NLRV vectors

    vec3 tangent = nearby1 - new_pos.xyz;
    vec3 bitangent = nearby2 - new_pos.xyz;
    vec3 normal = normalize(cross(bitangent, tangent));

    vec3 L = normalize(light_positions[0] - new_pos.xyz); // light normal 
    vec3 R = normalize(2.0 * dot(normal, L) * normal - L); // reflected light normal
    vec3 V = normalize(camera_position); // normalized camera

    //pass diffuse and specular
    diffuse_illum = vec3(light_colors[0]  * max(dot(normal, L), 0.0));
    specular_illum = vec3(light_colors[0]  * pow(max(dot(R, V), 0.0), mat_shininess));

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * new_pos;
}
