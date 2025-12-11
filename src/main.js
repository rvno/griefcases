import * as THREE from "three";

import { App } from "./app.js";
import { InputManager } from "./input-manager.js";
import { ThirdPersonCamera } from "./third-person-camera.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

class Project extends App {
  // Scene
  #sun_ = null;
  #character_ = null;
  #characterGroup_ = null;
  #objects_ = [];

  // Environment
  #environment_ = {};

  // Scene Controls
  #inputs_ = null;
  #thirdCamera_ = null;

  // Depth Effect
  #renderTarget_ = null;
  #depthCopy_ = null;
  #depthCopyMaterial_ = null;
  #colourCopyMaterial_ = null;
  #transparentScene_ = null;

  #viewScene_ = null;
  #viewCamera_ = null;
  #viewQuad_ = null;

  constructor() {
    super();
  }

  /**
   * Override for onSetupProject
   * - calls setupBasicScene to add to the scene
   * - instantiates the InputManager class
   * - instantiates the 3rd person camera
   */
  async onSetupProject() {
    await this.#setupEnvironment_();
    await this.#setupDepth_();

    await this.#setupBasicScene_();

    await this.#setupCharacter_();

    // Input Management
    this.#inputs_ = new InputManager();
    this.#inputs_.initialize();

    // 3rd Person Camera
    this.#setup3rdCamera_(this.Pane);
  }

  /**
   * Sets up the scene
   * - adds a cube
   */
  async #setupBasicScene_() {
    // Setup Light
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(5, 20, 5);
    light.target.position.set(0, 0, 0);
    // Light shadow settings - makes the shadows crisper
    light.castShadow = true;
    light.shadow.mapSize.setScalar(1024);
    // NOTE: just an observation - examples seem to use the same base value for light, with appropriate +/- factor
    light.shadow.camera.left = 2;
    light.shadow.camera.right = -2;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = -2;
    light.shadow.mapSize.set(2048, 2048);
    // Add the light to the scene
    this.Scene.add(light);
    this.Scene.add(light.target);
    this.#sun_ = light;

    // Add a light tweak pane folder
    const lightFolder = this.Pane.addFolder({ title: "Sunlight" });
    lightFolder.addBinding(this.#sun_, "color", {
      view: "color",
      color: { type: "float" },
    });
    lightFolder.addBinding(this.#sun_, "intensity", {
      min: 0,
      max: 5,
      step: 0.01,
    });

    // Add ground mesh
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    // Position the mesh below the box
    groundMesh.position.y = -0.5;
    // Rotate the plane so it's horizontal
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.Scene.add(groundMesh);

    // Depth Portion
    // create a cube in the middle
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0,
      roughness: 0.8,
    });
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(4, 0, 3);
    cube.receivehadow = true;
    cube.castShadow = true;
    this.addToScene(cube);

    // create a forcefield thing
    const forceFieldMaterial = await this.LoadShader_("depth-test", {
      depthTexture: { value: this.#depthCopy_.texture },
      cameraNearFar: {
        value: new THREE.Vector2(this.Camera.near, this.Camera.far),
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      // map is the texture we're applying to the shader
      map: {
        value: await this.loadTexture("./textures/circle.ktx2", true),
      },
      time: { value: 0 },
      fadeTop: { value: 0.0 },
      fadeBottom: { value: 0.0 },
      color1: { value: new THREE.Vector3(0.0, 0.0, 1.0) }, // Blue
      color2: { value: new THREE.Vector3(1.0, 0.5, 0.0) }, // Orange
    });

    forceFieldMaterial.uniforms.map.value.wrapS = THREE.RepeatWrapping;
    forceFieldMaterial.uniforms.map.value.wrapT = THREE.RepeatWrapping;
    forceFieldMaterial.transparent = true;
    forceFieldMaterial.side = THREE.DoubleSide;
    forceFieldMaterial.depthTest = true;
    forceFieldMaterial.depthWrite = false;
    forceFieldMaterial.blending = THREE.AdditiveBlending;

    const forceField = new THREE.Mesh(cubeGeometry, forceFieldMaterial);
    const forceFieldScale = 2;
    forceField.scale.setScalar(forceFieldScale);
    forceField.position.copy(cube.position);

    // Calculate fade bounds based on forcefield dimensions
    // Get the geometry's bounding box to find actual dimensions
    cubeGeometry.computeBoundingBox();
    const bbox = cubeGeometry.boundingBox;
    const geometryHeight = bbox.max.y - bbox.min.y;

    // Calculate world-space height after scaling
    const worldHeight = geometryHeight * forceFieldScale;
    const halfHeight = worldHeight / 2;

    // Fade happens only in the last 25% from the top
    // Top of forcefield is at: cube.position.y + halfHeight
    // 75% height (where fade starts): cube.position.y + halfHeight - (worldHeight * 0.75)
    const topOfField = cube.position.y + halfHeight;
    const fadeStartHeight = worldHeight * 0.25; // 25% of total height

    forceFieldMaterial.uniforms.fadeTop.value = topOfField;
    forceFieldMaterial.uniforms.fadeBottom.value = topOfField - fadeStartHeight;

    this.#transparentScene_.add(forceField);

    // Create forcefield tweak pane folder
    const forceFieldFolder = this.Pane.addFolder({ title: "Forcefield" });

    // Custom params for tweakpane
    const forceFieldParams = {
      scale: forceFieldScale,
      color1: { r: 0.0, g: 0.0, b: 1.0 },
      color2: { r: 1.0, g: 0.5, b: 0.0 },
    };

    forceFieldFolder
      .addBinding(forceFieldParams, "scale", { min: 0.1, max: 10.0, step: 0.1 })
      .on("change", (evt) => {
        forceField.scale.setScalar(evt.value);

        // Recalculate fade bounds based on new scale
        const newWorldHeight = geometryHeight * evt.value;
        const newHalfHeight = newWorldHeight / 2;
        const newTopOfField = cube.position.y + newHalfHeight;
        const newFadeStartHeight = newWorldHeight * 0.25;

        forceFieldMaterial.uniforms.fadeTop.value = newTopOfField;
        forceFieldMaterial.uniforms.fadeBottom.value =
          newTopOfField - newFadeStartHeight;
      });

    forceFieldFolder
      .addBinding(forceFieldParams, "color1", {
        view: "color",
        color: { type: "float" },
      })
      .on("change", (evt) => {
        forceFieldMaterial.uniforms.color1.value.set(
          evt.value.r,
          evt.value.g,
          evt.value.b
        );
      });

    forceFieldFolder
      .addBinding(forceFieldParams, "color2", {
        view: "color",
        color: { type: "float" },
      })
      .on("change", (evt) => {
        forceFieldMaterial.uniforms.color2.value.set(
          evt.value.r,
          evt.value.g,
          evt.value.b
        );
      });

    // load turtle

    const turtle = await this.LoadGLB_("./models/turtle.glb");
    turtle.scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.shadowSide = THREE.DoubleSide;
      }
    });
    // @TODO: need to adjust model pivot point in Blender
    // turtle.scene.scale.setScalar(0.5);
    const turtleParams = {
      scalar: 1,
      position: { x: -3, y: -2.75, z: 4 },
      rotation: { x: 0, y: 0, z: 0 },
    };
    turtle.scene.position.set(
      turtleParams.position.x,
      turtleParams.position.y,
      turtleParams.position.z
    );
    this.Scene.add(turtle.scene);
    this.#objects_.push({ name: "turtle", mesh: turtle.scene });
    this.#createModelBinding_("turtle", turtle.scene, this.Pane, turtleParams);
  }

  #createModelBinding_(name, model, pane, params) {
    const folder = pane.addFolder({ title: name });

    // We mainly want the position and scale so we can just tweak
    //  the orientation in the scene
    folder.addBinding(params, "position").on("change", (evt) => {
      const currentValue = evt.value;
      model.position.set(evt.value.x, evt.value.y, evt.value.z);
    });
    folder.addBinding(params, "scalar").on("change", (evt) => {
      const currentValue = evt.value;
      model.scale.setScalar(evt.value);
    });
    folder.addBinding(params, "rotation").on("change", (evt) => {
      const currentValue = evt.value;
      model.rotation.set(evt.value.x, evt.value.y, evt.value.z);
    });
  }

  async #setupDepth_() {
    const renderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    };

    this.#renderTarget_ = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      renderTargetOptions
    );

    // Depth
    this.#renderTarget_.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );

    const depthOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      type: THREE.FloatType,
    };
    this.#depthCopy_ = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      depthOptions
    );

    this.#depthCopyMaterial_ = await this.LoadShader_("depth-copy", {
      depthTexture: { value: null },
    });
    this.#depthCopyMaterial_.depthTest = false;
    this.#depthCopyMaterial_.depthWrite = false;

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMaterial = new THREE.MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(quadGeo, quadMaterial);

    this.#colourCopyMaterial_ = quadMaterial;
    // we use these to draw the render target and depth texture on the screen
    this.#viewScene_ = new THREE.Scene();
    this.#viewCamera_ = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.#viewQuad_ = quad;

    this.#viewScene_.add(quad);

    this.#transparentScene_ = new THREE.Scene();
  }

  createComposer() {
    const options = {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    };
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      options
    );
    rt.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );

    // this allows us to use our composer rather than the one created in app js
    const composer = new EffectComposer(this.Renderer, rt);

    return composer;
  }

  createMainRenderPass() {
    class MainRenderPass extends RenderPass {
      #app_ = null;

      constructor(scene, camera, app) {
        super(scene, camera);
        this.#app_ = app;
      }

      render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        this.#app_.renderMainPass(readBuffer);
      }
    }

    return new MainRenderPass(this.Scene, this.Camera, this);
  }

  // this method was made by copying onRender below
  renderMainPass(readBuffer) {
    // renders the scene and depth
    this.Renderer.setRenderTarget(readBuffer);
    this.Renderer.render(this.Scene, this.Camera);
    this.Renderer.setRenderTarget(null);

    // copy the depth texture
    this.#depthCopyMaterial_.uniforms.depthTexture.value =
      readBuffer.depthTexture;
    this.#viewQuad_.material = this.#depthCopyMaterial_;
    this.#viewQuad_.position.set(0, 0, -1);
    this.#viewQuad_.scale.setScalar(1);
    this.Renderer.setRenderTarget(this.#depthCopy_);
    this.Renderer.render(this.#viewScene_, this.#viewCamera_);
    this.Renderer.setRenderTarget(null);
    this.#viewQuad_.material = this.#colourCopyMaterial_;

    // render the transparent scene
    this.Renderer.autoClear = false;
    this.Renderer.setRenderTarget(readBuffer);
    this.Renderer.render(this.#transparentScene_, this.Camera);
    this.Renderer.setRenderTarget(null);

    this.Renderer.autoClear = true;
  }

  async #setupCharacter_() {
    const charGroup = new THREE.Group();

    const giraffe = await this.LoadGLB_("./models/giraffe.glb");
    giraffe.scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.shadowSide = THREE.DoubleSide;
      }
    });
    // @TODO: need to adjust model pivot point in Blender
    giraffe.scene.scale.setScalar(0.5);
    giraffe.scene.position.set(0, -1, 0);

    // capsule character placeholder mesh
    // const charGeo = new THREE.CapsuleGeometry(0.5, 0.5, 10, 20);
    // const charMat = new THREE.MeshStandardMaterial({ color: 0x004343 });
    // const char = new THREE.Mesh(charGeo, charMat);
    // char.position.set(0, 0.4, 0);
    // char.castShadow = true;
    // char.receiveShadow = true;

    // create character parts
    const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMat1 = new THREE.MeshStandardMaterial({ color: 0xff8080 });
    const boxMesh1 = new THREE.Mesh(boxGeo, boxMat1);
    boxMesh1.position.set(0.75, 0.75, 0);
    boxMesh1.castShadow = true;
    boxMesh1.receiveShadow = true;

    const boxMat2 = new THREE.MeshStandardMaterial({ color: 0x8080ff });
    const boxMesh2 = new THREE.Mesh(boxGeo, boxMat2);
    boxMesh2.position.set(-0.75, 0.75, 0);
    boxMesh2.castShadow = true;
    boxMesh2.receiveShadow = true;

    const boxMat3 = new THREE.MeshStandardMaterial({ color: 0x80ff80 });
    const boxMesh3 = new THREE.Mesh(boxGeo, boxMat3);
    boxMesh3.position.set(0, 0.75, 0.75);
    boxMesh3.castShadow = true;
    boxMesh3.receiveShadow = true;

    // Assemble character parts
    // charGroup.add(char);
    charGroup.add(giraffe.scene);
    charGroup.add(boxMesh1);
    charGroup.add(boxMesh2);
    charGroup.add(boxMesh3);

    this.#character_ = giraffe.scene;
    this.#characterGroup_ = charGroup;
    this.Scene.add(charGroup);

    // Create a character tweak pane folder
    this.#character_.customParams = {
      wireframe: false,
      transparent: false,
      opacity: 1,
      color: { r: 1, g: 1, b: 1 },
      position: { x: 0, y: -1.5, z: 0 },
      rotFactor: 0.2,
    };
    let previousValues = {
      position: { x: 0, y: -1.5, z: 0 },
      rotFactor: 0.2,
    };

    const charFolder = this.Pane.addFolder({ title: "Character" });
    // NOTE: boolean params can just follow `addBinding(paramObject, paramProperty)`
    charFolder
      .addBinding(this.#character_.customParams, "wireframe")
      .on("change", (evt) => {
        this.#character_.traverse((c) => {
          if (c.isMesh) {
            c.material.wireframe = evt.value;
          }
        });
      });
    // NOTE: transparent + opacity are tied together, must have transparent true for opacity to kick in
    charFolder
      .addBinding(this.#character_.customParams, "transparent")
      .on("change", (evt) => {
        this.#character_.traverse((c) => {
          if (c.isMesh) {
            c.material.transparent = evt.value;
            c.material.needsUpdate = true;
          }
        });
      });
    // NOTE: params with ranges can follow `addBinding(paramObject, paramProperty, {min: min, max: max, step: step})`
    charFolder
      .addBinding(this.#character_.customParams, "opacity", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", (evt) => {
        this.#character_.traverse((c) => {
          if (c.isMesh) {
            c.material.opacity = evt.value;
          }
        });
      });

    // NOTE: color param has a "view" object where you can set a colorpicker
    // NOTE: we're not using this since we're now using a model
    //  - it looks like it matches the paramObject structure(r,g,b) in our case for THREE.Color
    // charFolder
    //   .addBinding(this.#character_.customParams, "color", {
    //     view: "color",
    //     color: { type: "float" },
    //   })
    //   .on("change", (evt) => {
    //     this.#character_.traverse((c) => {
    //       if (c.isMesh) {
    //         c.material.color.set(evt.value);
    //       }
    //     });
    //   });
    charFolder
      .addBinding(this.#character_.customParams, "position")
      .on("change", (evt) => {
        const currentValue = evt.value;
        this.#character_.position.set(evt.value.x, evt.value.y, evt.value.z);

        // Find the difference between previous and current position
        const deltaVec = new THREE.Vector3().subVectors(
          new THREE.Vector3().copy(currentValue),
          new THREE.Vector3().copy(previousValues.position)
        );

        // Update additional parts position by adding the deltaVec
        boxMesh1.position.add(deltaVec);
        boxMesh2.position.add(deltaVec);
        boxMesh3.position.add(deltaVec);

        // Update previous position for next change
        previousValues.position = { ...currentValue };
      });
    charFolder.addBinding(this.#character_.customParams, "rotFactor", {
      min: 0,
      max: 3,
      step: 0.01,
    });
  }

  async #setupEnvironment_() {
    const bgFolder = this.Pane.addFolder({ title: "Background" });
    this.Scene.backgroundBlurriness = 0.4;
    this.Scene.backgroundIntensity = 0.5;
    this.Scene.environmentIntensity = 0.5;
    this.#environment_.customParams = {
      hdrTexture: "autumn_field_puresky_1k.hdr",
    };

    bgFolder
      .addBinding(this.#environment_.customParams, "hdrTexture", {
        options: {
          "Autumn Field": "autumn_field_puresky_1k.hdr",
          "Rosendal Park Sunset": "rosendal_park_sunset_1k.hdr",
          "Zwartkops Sunset": "zwartkops_straight_sunset_1k.hdr",
        },
      })
      .on("change", (evt) => {
        this.LoadHDR_(`./skybox/${evt.value}`);
      });
    bgFolder.addBinding(this.Scene, "backgroundBlurriness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    bgFolder.addBinding(this.Scene, "backgroundIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    bgFolder.addBinding(this.Scene, "environmentIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    await this.LoadHDR_(
      `./skybox/${this.#environment_.customParams.hdrTexture}`
    );
  }

  /**
   * Creates our `ThirdPersonCamera` instance
   * - passes the pane so we can tweak it within the class itself
   * @param {*} pane
   */
  #setup3rdCamera_(pane) {
    this.#thirdCamera_ = new ThirdPersonCamera(
      new THREE.Vector3(0, 1, -3),
      new THREE.Vector3(0, 1, 5),
      this.#characterGroup_,
      this.Camera,
      pane
    );
  }

  /**
   *
   * Our "tick" function
   * - what we're doing every frame
   * - we're essentially invoking other functions that handle the logic for different respective elements
   * @param {*} elapsedTime
   */
  #step_(elapsedTime) {
    this.#updateCharacterMovement_(elapsedTime);
    this.#updateCamera_(elapsedTime);
    this.#updateSun_(elapsedTime);
  }

  /**
   * Utilizes InputManager to update/handle the character movement logic
   * - utilized within the `step` function
   * @param {*} elapsedTime
   */
  #updateCharacterMovement_(elapsedTime) {
    const MOVE_SPEED = 1;
    let angle = 0;

    // Retrieve InputManager actions
    const actions = this.#inputs_.Actions;
    const velocity = new THREE.Vector3();

    if (actions.forward) {
      velocity.z += MOVE_SPEED * elapsedTime;
    } else if (actions.backward) {
      velocity.z -= MOVE_SPEED * elapsedTime;
    }

    if (actions.left) {
      angle += elapsedTime;
    } else if (actions.right) {
      angle -= elapsedTime;
    }

    // Apply the proper rotation to the world space,
    // so that the character moves with the correct rotation
    // quaternion deals with the character's rotation
    velocity.applyQuaternion(this.#characterGroup_.quaternion);

    // NOTE: Make sure to apply the quaternion (character's rotation) first
    // Moves the character forward/backward
    this.#characterGroup_.position.add(velocity);
    // Rotates the character in place left/right
    this.#characterGroup_.rotateY(angle);
  }

  /**
   * Update camera function
   * - utilizies the `step` function from the `ThirdPersonCamera` class
   * - that function, like our step function, is a "tick" function,
   * - so we call it within our `App` `step` function
   * @param {*} elapsedTime
   */
  #updateCamera_(elapsedTime) {
    this.#thirdCamera_.step(elapsedTime);
  }

  #updateSun_(elapsedTime) {
    // Follow the character around with the light
    // arbitrary initial direction
    // this.#sun_.position.set(1,2,1)

    // NOTE: without this, the light position keeps moving
    this.#sun_.position.set(1, 2, 1);

    // HAPPY ACCIDENT - random shadow + darkening stretch
    this.#sun_.position.add(this.#characterGroup_.position);

    // Set sun/light target to character's position
    this.#sun_.target.position.copy(this.#characterGroup_.position);
  }

  onStep(elapsedTime, totalElapsedTime) {
    this.#transparentScene_.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.material.uniforms) {
          obj.material.uniforms.time.value = totalElapsedTime;
        }
      }
    });

    this.#updateCharacterMovement_(elapsedTime);
    this.#updateCamera_(elapsedTime);
    this.#updateSun_(elapsedTime);
  }
}

let APP_ = new Project();

window.addEventListener("DOMContentLoaded", async () => {
  await APP_.initialize();
});
