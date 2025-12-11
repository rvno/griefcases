import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import Stats from "three/addons/libs/Stats.module.js";

import { InputManager } from "./input-manager.js";
import { ThirdPersonCamera } from "./third-person-camera.js";

// for environments
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
// for models
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

class App {
  // Three "setup"
  #three_ = null;
  #camera_ = null;
  #scene_ = null;
  #clock_ = null;

  // Scene
  #sun_ = null;
  #character_ = null;
  #characterGroup_ = null;
  #environment_ = {};

  // Scene Controls
  #controls_ = null;
  #inputs_ = null;
  #thirdCamera_ = null;

  // Debug & Performance
  #pane_ = null;
  #stats_ = null;

  constructor() {}

  /**
   * Starts the project
   * - Runs setupProject
   * - Starts the draw loop
   */
  async initialize() {
    // clock param -> autostart
    this.#clock_ = new THREE.Clock(true);

    window.addEventListener("resize", () => {
      this.#onResize_();
    });

    await this.#setupProject_();
    // Call onResize to setup our initial dimensions
    this.#onResize_();

    // Start the draw loop
    this.#raf_();
  }

  /**
   * Project setup
   * - calls setupThree for setup
   * - calls setupBasicScene to add to the scene
   * - calls setupPane & Stats for debug/perf monitoring
   * - instantiates the InputManager class
   */
  async #setupProject_() {
    // Debug & Performance
    this.#setupPane_();
    this.#setupStats_();

    this.#setupThree_();
    this.#setupBasicScene_();
    await this.#setupCharacter_();

    // Input Management
    this.#inputs_ = new InputManager();
    this.#inputs_.initialize();

    // 3rd Person Camera
    this.#setup3rdCamera_(this.#pane_);
  }

  #setupPane_() {
    this.#pane_ = new Pane();
  }

  #setupStats_() {
    this.#stats_ = new Stats();
    // @TODO: consider three-perf lib
    document.body.appendChild(this.#stats_.dom);
  }

  /**
   * Sets up three - since we repeat code in onResize,
   *  there's more abstracted to that function.
   * - creates the renderer
   * - creates canvas from renderer using window dims
   * - establishes DPR and aspect ratio
   * - sets up camera
   * - creates empty scene
   */
  #setupThree_() {
    // Set up renderer
    this.#three_ = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(this.#three_.domElement);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    // Set up camera
    const fov = 70;
    const near = 0.1;
    const far = 1000;

    this.#camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.#camera_.position.set(3, 2, 3);
    this.#camera_.lookAt(new THREE.Vector3(0, 0, 0));

    // Sets up orbit controls
    this.#controls_ = new OrbitControls(this.#camera_, this.#three_.domElement);

    this.#scene_ = new THREE.Scene();
    this.#scene_.background = new THREE.Color(0x000000);

    // Enable Shadows
    // - enabling shadow map gives us the shadow
    this.#three_.shadowMap.enabled = true;
    this.#three_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.#three_.toneMapping = THREE.ACESFilmicToneMapping;
  }

  /**
   * Handles resize event
   * - recalculates the window dimensions and updates the canvas
   * - then updates the camera based on the new aspect ratio
   */
  #onResize_() {
    // Get current browser dimensions, calc aspect ratio
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio;
    const aspect = w / h;

    // Update canvas dimensions w/ DPR
    const canvas = this.#three_.domElement;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // Update renderer size
    this.#three_.setSize(w * dpr, h * dpr, false);

    // Update camera
    this.#camera_.aspect = aspect;
    this.#camera_.updateProjectionMatrix();
  }

  /**
   * Sets up the scene
   * - adds a cube
   */
  #setupBasicScene_() {
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
    this.#scene_.add(light);
    this.#scene_.add(light.target);
    this.#sun_ = light;

    // Add a light tweak pane folder
    const lightFolder = this.#pane_.addFolder({ title: "Sunlight" });
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
    this.#scene_.add(groundMesh);

    const bgFolder = this.#pane_.addFolder({ title: "Background" });
    this.#scene_.backgroundBlurriness = 0.4;
    this.#scene_.backgroundIntensity = 0.5;
    this.#scene_.environmentIntensity = 0.5;
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
        this.#LoadHDR_(`./skybox/${evt.value}`);
      });
    bgFolder.addBinding(this.#scene_, "backgroundBlurriness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    bgFolder.addBinding(this.#scene_, "backgroundIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    bgFolder.addBinding(this.#scene_, "environmentIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    this.#LoadHDR_(`./skybox/${this.#environment_.customParams.hdrTexture}`);
  }

  #LoadHDR_(path) {
    const rgbeLoader = new HDRLoader();
    rgbeLoader.load(path, (hdrTexture) => {
      hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

      this.#scene_.background = hdrTexture;
      this.#scene_.environment = hdrTexture;
    });
  }

  /**
   *
   * LoadGLB loads our GLB models async
   * NOTE: because of this, we need to use await accordingly
   *  and functions with await must have async
   *  reminder that async functions are called with await in general
   * @param {*} path
   * @returns promise resolution
   */
  async #LoadGLB_(path) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./libs/draco/");
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      loader.load(path, (gltf) => {
        resolve(gltf);
        console.log("done");
      });
    });

    // loader.load(
    //   path,
    //   (gltf) => {
    //     console.log("Model loaded:", path);
    //     console.log("Model scene:", gltf.scene);
    //     gltf.scene.traverse((c) => {
    //       if (c instanceof THREE.Mesh) {
    //         c.castShadow = true;
    //         c.receiveShadow = true;
    //       }
    //     });
    //     // this.#scene_.add(gltf.scene);
    //     model = gltf.scene;
    //     console.log(`Model ${path} added to scene`);
    //     return model;
    //   },
    //   (progress) => {
    //     console.log(
    //       "Loading progress:",
    //       (progress.loaded / progress.total) * 100 + "%"
    //     );
    //   },
    //   (error) => {
    //     console.error("Error loading model:", error);
    //   }
    // );
  }

  async #setupCharacter_() {
    const charGroup = new THREE.Group();

    const giraffe = await this.#LoadGLB_("./models/giraffe.glb");
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
    this.#scene_.add(charGroup);

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

    const charFolder = this.#pane_.addFolder({ title: "Character" });
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
      this.#camera_,
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

  /**
   * Our render function
   * - renders the scene
   */
  #render_() {
    this.#three_.render(this.#scene_, this.#camera_);
  }

  /**
   * Our raf loop to continuously draw
   * - "similar" to the p5.draw() function
   * - we're having the `stats` panel monitor each frame, it "wraps" the actions
   * - we're repeatedly calling `step` to continuously update something
   * - we're repeatedly rendering the scene to keep it up to date
   */
  #raf_() {
    requestAnimationFrame((t) => {
      this.#stats_.begin();

      const elapsedTime = this.#clock_.getDelta();
      // Updates within the draw cycle
      // Note: we pass the delta time from the THREE clock as our elapsedTime value
      this.#step_(elapsedTime);
      this.#render_();

      this.#stats_.end();

      this.#raf_();
    });
  }
}

let APP_ = null;

window.addEventListener("DOMContentLoaded", async () => {
  APP_ = new App();
  await APP_.initialize();
});
