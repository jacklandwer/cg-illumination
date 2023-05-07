#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec2 model_uv;
in vec3 model_position;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    vec3 ambient_value = vec3(0.0, 0.0, 0.0);
    vec3 diffuse_value = vec3(0.0, 0.0, 0.0);
    vec3 specular_value = vec3(0.0, 0.0, 0.0);

    // Ambient: Ia * Ka
    ambient_value += ambient * mat_color;

    for (int i = 0; i < num_lights; i++) {
        // Diffuse: Ip * Kd * dot(N, L)
            // L (Light Direction)
        vec3 light_dir = normalize(light_positions[i] - model_position);
            // dot(N, L)
        float n_dot_l = max(dot(model_normal, light_dir), 0.0);
            // Calculate diffuse
        diffuse_value += light_colors[i] * mat_color * n_dot_l;

        // Specular: Ip * Ks * dot(R, V)^n
            // V (View direction)
        vec3 view_dir = normalize(camera_position - model_position);
            // R (Reflected light direction)
        vec3 reflect_dir = reflect(-light_dir, model_normal);
            // dot(R, V)
        float r_dot_v = max(dot(view_dir, reflect_dir), 0.0);
            // Calculate specular
        specular_value += light_colors[i] * mat_specular * pow(r_dot_v, mat_shininess);
    }
    // Color
    vec3 final_lighting = (ambient_value + diffuse_value + specular_value) * texture(mat_texture, model_uv).rgb;
    FragColor = vec4(clamp(final_lighting, 0.0, 1.0), 1.0);
}
