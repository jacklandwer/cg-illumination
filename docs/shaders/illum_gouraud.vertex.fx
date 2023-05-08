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
uniform float mat_shininess;
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
    // Initialize diffuse and specular
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);

    // Initialize position and vertex normal
    vec3 model_position = vec3(world * vec4(position, 1.0));

    mat3 world_transpose = mat3(inverse(transpose(world)));
    vec3 model_normal = normalize(world_transpose * normal);
    
    for (int i = 0; i < num_lights; i++) {
        //calculate vectors
        vec3 N = model_normal; // surface normal
        vec3 L = normalize(light_positions[i] - model_position); // light direction
        vec3 R = reflect(-L, N);; // reflected light direction
        vec3 V = normalize(camera_position - model_position); // view direction

        //pass diffuse and specular
        diffuse_illum += vec3(light_colors[i]  * max(dot(N, L), 0.0));
        specular_illum += vec3(light_colors[i]  * pow(max(dot(R, V), 0.0), mat_shininess));
    }

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);

}
