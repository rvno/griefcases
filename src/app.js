import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import Stats from "stats-gl";

// for environments
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
// for models
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// for texture
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

// Effects
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BloomPass } from "./bloomPass.js";

class App {
  // Three "setup"
  #three_ = null;
  #camera_ = null;
  #scene_ = null;
  #clock_ = null;

  // Scene Controls
  #controls_ = null;

  // Loaders
  #ktx2Loader_ = null;

  // Effect Composer/Post Processing
  #composer_ = null;

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

    await this.#setupLoaders_();

    // Initialize post fx

    const postFXFolder = this.#pane_.addFolder({
      title: "PostFX",
      expanded: false,
    });

    await this.#setupPostProcessing_(postFXFolder);

    await this.onSetupProject();
  }

  #setupPane_() {
    this.#pane_ = new Pane();
  }

  #setupStats_() {
    this.#stats_ = new Stats();
    // @TODO: consider three-perf lib
    document.body.appendChild(this.#stats_.dom);
  }

  async #setupLoaders_() {
    this.#ktx2Loader_ = new KTX2Loader();
    this.#ktx2Loader_.setTranscoderPath("./libs/basis/");
    this.#ktx2Loader_.detectSupport(this.#three_);
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
    const canvas = document.getElementById("three");
    this.#three_ = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    // document.body.appendChild(this.#three_.domElement);
    this.#three_.domElement.setAttribute("id", "three");
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

    // Update composer
    this.#composer_.setSize(w * dpr, h * dpr);
  }

  /**
   *
   * Our "tick" function
   * - what we're doing every frame
   * - we're essentially invoking other functions that handle the logic for different respective elements
   * @param {*} elapsedTime
   */
  #step_(elapsedTime) {
    const totalElapsedTime = this.#clock_.getElapsedTime();
    // overrideable function - handle any tick/incremental updates
    this.onStep(elapsedTime, totalElapsedTime);
  }

  /**
   * Our render function
   * - NOTE: not saying this ss a "draw" function like p5
   *   because the "draws" happen more in our "tick" functions - `step`
   * - renders the scene
   */
  #render_() {
    // this.#three_.render(this.#scene_, this.#camera_);
    // Note: because we're using the same scene + camera, we're able to just use our new effect composer
    this.#composer_.render();

    // our overrideable function
    this.onRender();
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
      const elapsedTime = this.#clock_.getDelta();
      // Updates within the draw cycle
      // Note: we pass the delta time from the THREE clock as our elapsedTime value
      this.#step_(elapsedTime);
      this.#render_();

      this.#stats_.update();

      this.#raf_();
    });
  }

  /**
   *
   * Exposes addToScene function that allows us to call
   *  this.addToScene to add an object
   * @param {*} object
   */
  addToScene(object) {
    this.#scene_.add(object);
  }

  /**
   * invokes EffectComposer using our webgl renderer
   * @returns EffectComposer
   */
  createComposer() {
    return new EffectComposer(this.#three_);
  }

  /**
   * Creates a new RenderPass
   * @returns RenderPass
   */
  createMainRenderPass() {
    return new RenderPass(this.#scene_, this.#camera_);
  }

  /**
   *
   * PostProcessing setup
   * - we create a composer that takes at a minimum -  render and output pass
   * - we then create passes for the different effects
   * - those get added to the composer
   * @param {*} pane
   */
  async #setupPostProcessing_(pane) {
    this.#composer_ = this.createComposer();
    const renderPass = this.createMainRenderPass();
    const outputPass = new OutputPass();

    // Shader pass
    const vsh = await fetch("./shaders/vignette-vsh.glsl");
    const fsh = await fetch("./shaders/vignette-fsh.glsl");

    const vshText = await vsh.text();
    const fshText = await fsh.text();

    const shaderData = {
      vertexShader: vshText,
      fragmentShader: fshText,
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        intensity: { value: 0.4 },
        dropoff: { value: 0.25 },
      },
    };

    // Vignette Pass
    const vignettePass = new ShaderPass(shaderData);
    const shaderOptions = {
      intensity: shaderData.uniforms.intensity.value,
      dropoff: shaderData.uniforms.dropoff.value,
    };
    const shaderFolder = pane.addFolder({ title: "vignette" });
    shaderFolder.addBinding(vignettePass, "enabled");
    shaderFolder
      .addBinding(shaderOptions, "intensity", { min: 0.0, max: 1.0 })
      .on("change", (e) => {
        vignettePass.material.uniforms.intensity.value = e.value;
      });
    shaderFolder
      .addBinding(shaderOptions, "dropoff", { min: 0.0, max: 1.0 })
      .on("change", (e) => {
        vignettePass.material.uniforms.dropoff.value = e.value;
      });

    // Bloom Pass
    const simonBloom = new BloomPass();
    const simonFolder = pane.addFolder({ title: "Bloom" });
    simonFolder.addBinding(simonBloom, "enabled");
    const prefilterFolder = simonFolder.addFolder({
      title: "Prefilter",
      expanded: false,
    });
    prefilterFolder.addBinding(simonBloom.Settings.render, "brightness", {
      min: 0.0,
      max: 2.0,
    });
    prefilterFolder.addBinding(simonBloom.Settings.render, "contrast", {
      min: 0.0,
      max: 2.0,
    });
    prefilterFolder.addBinding(simonBloom.Settings.render, "saturation", {
      min: 0.0,
      max: 2.0,
    });
    simonFolder.addBinding(simonBloom.Settings.composite, "strength", {
      min: 0.0,
      max: 2.0,
    });
    simonFolder.addBinding(simonBloom.Settings.composite, "mixFactor", {
      min: 0.0,
      max: 1.0,
    });

    this.#composer_.addPass(renderPass);
    this.#composer_.addPass(simonBloom);
    this.#composer_.addPass(vignettePass);
    this.#composer_.addPass(outputPass);
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
  async LoadGLB_(path) {
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

  /**
   *
   * Loads an environment texture
   * @param {*} path
   * @returns
   */
  async LoadHDR_(path) {
    const rgbeLoader = new HDRLoader();
    return new Promise((resolve, reject) => {
      rgbeLoader.load(path, (hdrTexture) => {
        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        this.#scene_.background = hdrTexture;
        this.#scene_.environment = hdrTexture;

        resolve();
      });
    });
  }

  async #loadKTX2_(path, srgb = true) {
    return new Promise((resolve, reject) => {
      this.#ktx2Loader_.load(path, (texture) => {
        if (srgb) {
          texture.colorSpace = THREE.SRGBColorSpace;
        }
        resolve(texture);
      });
    });
  }

  async loadTexture(path, srgb = true) {
    if (path.endsWith(".ktx2")) {
      return this.#loadKTX2_(path, srgb);
    } else {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(path, (texture) => {
          if (srgb) {
            texture.colorSpace = THREE.SRGBColorSpace;
          }
          resolve(texture);
        });
      });
    }
  }

  /**
   *
   * Loads shader files
   * @param {*} name
   * @param {*} uniforms
   * @returns
   */
  async LoadShader_(name, uniforms) {
    const vsh = await fetch(`./shaders/${name}-vsh.glsl`).then((r) => r.text());
    const fsh = await fetch(`./shaders/${name}-fsh.glsl`).then((r) => r.text());

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vsh,
      fragmentShader: fsh,
    });
  }

  // Override these methods
  async onSetupProject() {}

  onRender() {}

  // override any 'tick' based logic
  onStep(elapsedTime, totalElapsedTime) {}

  // Getters
  get Scene() {
    return this.#scene_;
  }

  get Pane() {
    return this.#pane_;
  }

  get Camera() {
    return this.#camera_;
  }

  get Renderer() {
    return this.#three_;
  }
}

export { App };
