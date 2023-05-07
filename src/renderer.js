import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { KeyboardEventTypes } from '@babylonjs/core';
import { CreateTorus, Mesh, VertexData } from '@babylonjs/core/Meshes';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.2, 0.4, 0.8, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.3, 0.3, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.2, 0.2, 0.2, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.3, 0.3, 0.3),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene' + idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.1, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap,
        };
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 32 }, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.1, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0),
        };
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', { width: 2, height: 1, depth: 1 }, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0),
        };
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        //translate lights
        scene.onKeyboardObservable.add((keypress) => {
            if (keypress.type === KeyboardEventTypes.KEYDOWN) {
                switch (keypress.event.key) {
                    case 'a':
                        current_scene.lights[this.active_light].position.x -= 1;
                        break;
                    case 'd':
                        current_scene.lights[this.active_light].position.x += 1;
                        break;
                    case 'f':
                        current_scene.lights[this.active_light].position.y -= 1;
                        break;
                    case 'r':
                        current_scene.lights[this.active_light].position.y += 1;
                        break;
                    case 'w':
                        current_scene.lights[this.active_light].position.z -= 1;
                        break;
                    case 's':
                        current_scene.lights[this.active_light].position.z += 1;
                        break;
                }
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    /*
      Create at least 3 scenes with a variety of colored, textured, and colored & textured models; various colored lights, etc. 
      Make sure to test models where you apply non-uniform scaling!
      */

    createScene1(scene_idx) { // Sam's scene
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 1.0; //0.1
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.2, 0.85, 0.25),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap,
        };
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 32 }, scene);
        sphere.position = new Vector3(4.5, -0.2, 5.0);
        sphere.metadata = {
            mat_color: new Color3(0.3, 0.55, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0),
        };
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', { width: 2, height: 1, depth: 1 }, scene);
        box.position = new Vector3(-1.0, -0.5, 3.5);
        box.metadata = {
            mat_color: new Color3(0.75, 0.25, 0.95),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0),
        };
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        //translate lights
        scene.onKeyboardObservable.add((keypress) => {
            if (keypress.type === KeyboardEventTypes.KEYDOWN) {
                switch (keypress.event.key) {
                    case 'a':
                        current_scene.lights[this.active_light].position.x -= 1;
                        break;
                    case 'd':
                        current_scene.lights[this.active_light].position.x += 1;
                        break;
                    case 'f':
                        current_scene.lights[this.active_light].position.y -= 1;
                        break;
                    case 'r':
                        current_scene.lights[this.active_light].position.y += 1;
                        break;
                    case 'w':
                        current_scene.lights[this.active_light].position.z -= 1;
                        break;
                    case 's':
                        current_scene.lights[this.active_light].position.z += 1;
                        break;
                }
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene2(scene_idx) { // Adrian's scene
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(3.75, 1.0, 7.5), scene);
        light0.diffuse = new Color3(0.7, 0.0, 0.0);
        light0.specular = new Color3(0.7, 0.0, 0.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(-3.75, 0.5, 7.5), scene);
        light1.diffuse = new Color3(0.0, 0.7, 0.0);
        light1.specular = new Color3(0.0, 0.7, 0.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(7.5, 1.0, 0.0), scene);
        light2.diffuse = new Color3(0.0, 0.0, 0.7);
        light2.specular = new Color3(0.0, 0.0, 0.7);
        current_scene.lights.push(light2);

        let light3 = new PointLight('light3', new Vector3(-7.5, 2.0, 0.0), scene);
        light3.diffuse = new Color3(0.5, 0.5, 0.0);
        light3.specular = new Color3(0.5, 0.5, 0.0);
        current_scene.lights.push(light3);

        let light4 = new PointLight('light4', new Vector3(3.75, 1.0, -7.5), scene);
        light4.diffuse = new Color3(0.5, 0.0, 0.5);
        light4.specular = new Color3(0.5, 0.0, 0.5);
        current_scene.lights.push(light4);

        let light5 = new PointLight('light5', new Vector3(-3.75, 2.0, -7.5), scene);
        light5.diffuse = new Color3(0.0, 0.5, 0.5);
        light5.specular = new Color3(0.0, 0.5, 0.5);
        current_scene.lights.push(light5);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/heightmap-modified.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.75, 0.75, 0.75),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 3,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 32 }, scene);
        sphere.position = new Vector3(2.5, 1.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.90, 0.70, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 8,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        // Custom Model
        let house = new Mesh("house", scene);
        let vertexData = new VertexData();

        let positions = [
            // Base (Vertex 0-3)
            6, 0, 2,    // vertex 0 (Back right)
            4, 0, 2,    // vertex 1 (Back left)
            4, 0, -2,   // vertex 2 (Front left)
            6, 0, -2,   // vertex 3 (Front right)

            // 1st wall (Vertex 0, 1, 4, 5)
            // 2nd wall (Vertex 1, 2, 5, 6)
            // 3rd wall (Vertex 2, 3, 6, 7)
            // 4th wall (Vertex 3, 0, 7, 4)

            // Roof
            // Left half (Vertex 10, 11, 8, 9)
            // Right half (Vertex 12, 13, 8, 9)
            // Left connector (Vertex 5, 6, 10, 11)
            // Right connector (Vertex 4, 7, 12, 13)
            // Front (Vertex 9, 11, 13)
            // Back (Vertex 8, 10, 12)
            6, 0.5, 2,      // vertex 4
            4, 0.5, 2,      // vertex 5
            4, 0.5, -2,     // vertex 6
            6, 0.5, -2,     // vertex 7
            5, 1, 2,     // vertex 8
            5, 1, -2,    // vertex 9
            3.8, 0.5, 2,    // vertex 10
            3.8, 0.5, -2,   // vertex 11
            6.2, 0.5, 2,    // vertex 12
            6.2, 0.5, -2    // vertex 13
        ];
        vertexData.positions = positions;

        let indices = [
            // Base (Vertex 0-3)
            0, 1, 2,
            2, 3, 0,
            // 1st wall (Vertex 0, 1, 4, 5)
            0, 1, 4,
            1, 4, 5,
            // 2nd wall (Vertex 1, 2, 5, 6)
            1, 2, 5,
            5, 6, 2,
            // 3rd wall (Vertex 2, 3, 6, 7)
            2, 3, 6,
            3, 6, 7,
            // 4th wall (Vertex 0, 3, 4, 7)
            0, 3, 4,
            3, 4, 7,

            // Roof
            // Left half (Vertex 10, 11, 8, 9)
            8, 9, 10,
            9, 10, 11,
            // Right half (Vertex 12, 13, 8, 9)
            8, 9, 12,
            9, 12, 13,
            // Left connector (Vertex 5, 6, 10, 11)
            5, 6, 10,
            6, 10, 11,
            // Right connector (Vertex 4, 7, 12, 13)
            4, 7, 12,
            7, 12, 13,
            // Front (Vertex 9, 11, 13)
            9, 11, 13,
            // Back (Vertex 8, 10, 12)
            8, 10, 12
        ];
        vertexData.indices = indices;

        let normals = [];
        VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        vertexData.applyToMesh(house);

        house.metadata = {
            mat_color: new Color3(0.9, 0.2, 0.5),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }

        house.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(house);

        let donut = CreateTorus('donut', { segments: 32 }, scene);
        donut.position = new Vector3(5.5, 0.5, 5.0);
        donut.metadata = {
            mat_color: new Color3(0.0, 0.70, 0.50),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        donut.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(donut);

        //translate lights
        scene.onKeyboardObservable.add((keypress) => {
            if (keypress.type === KeyboardEventTypes.KEYDOWN) {
                switch (keypress.event.key) {
                    case 'a':
                        current_scene.lights[this.active_light].position.x -= 1;
                        break;
                    case 'd':
                        current_scene.lights[this.active_light].position.x += 1;
                        break;
                    case 'f':
                        current_scene.lights[this.active_light].position.y -= 1;
                        break;
                    case 'r':
                        current_scene.lights[this.active_light].position.y += 1;
                        break;
                    case 'w':
                        current_scene.lights[this.active_light].position.z -= 1;
                        break;
                    case 's':
                        current_scene.lights[this.active_light].position.z += 1;
                        break;
                }
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene3(scene_idx) { // Jack's scene
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 1.0; //0.1
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene); 
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.20, 0.85, 0.25),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 32 }, scene);
        sphere.position = new Vector3(4.45, 1.25, 4.4);
        sphere.metadata = {
            mat_color: new Color3(0.30, 0.55, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', { width: 2, height: 1, depth: 1 }, scene);
        box.position = new Vector3(-1.0, 0.5, 3.5);
        box.metadata = {
            mat_color: new Color3(0.75, 0.25, 0.95),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        //translate lights
        scene.onKeyboardObservable.add((keypress) => {
            if (keypress.type === KeyboardEventTypes.KEYDOWN) {
                switch (keypress.event.key) {
                    case 'a':
                        current_scene.lights[this.active_light].position.x -= 1;
                        break;
                    case 'd':
                        current_scene.lights[this.active_light].position.x += 1;
                        break;
                    case 'f':
                        current_scene.lights[this.active_light].position.y -= 1;
                        break;
                    case 'r':
                        current_scene.lights[this.active_light].position.y += 1;
                        break;
                    case 'w':
                        current_scene.lights[this.active_light].position.z -= 1;
                        break;
                    case 's':
                        current_scene.lights[this.active_light].position.z += 1;
                        break;
                }
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });

    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }

    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer };
