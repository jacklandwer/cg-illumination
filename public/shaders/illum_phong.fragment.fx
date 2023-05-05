#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec2 model_uv;

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
    // Color
    //FragColor = vec4(mat_color * texture(mat_texture, model_uv).rgb, 1.0);


    // Ambient light
    vec3 ambient_color = ambient * mat_color;

    // Diffuse and specular light
    vec3 diffuse_color = vec3(0.0);
    vec3 specular_color = vec3(0.0);

    for (int i = 0; i < num_lights; i++) {
        vec3 light_dir = normalize(light_positions[i] - vec3(gl_FragCoord.xy, 0.0));
        vec3 view_dir = normalize(camera_position - vec3(gl_FragCoord.xy, 0.0));
        vec3 halfway_dir = normalize(light_dir + view_dir);

        float diffuse_factor = max(dot(model_normal, light_dir), 0.0);
        vec3 diffuse_contribution = diffuse_factor * light_colors[i];

        float specular_factor = pow(max(dot(model_normal, halfway_dir), 0.0), mat_shininess);
        vec3 specular_contribution = specular_factor * mat_specular * light_colors[i];

        diffuse_color += diffuse_contribution;
        specular_color += specular_contribution;
    }

    // Final color
    vec3 final_color = ambient_color + diffuse_color + specular_color;
    FragColor = vec4(final_color, 1.0) * texture(mat_texture, model_uv);


}
