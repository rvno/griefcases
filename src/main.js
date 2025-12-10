import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import Stats from "three/addons/libs/Stats.module.js";

class App {
  // Three "setup"
  #three_ = null;
  #controls_ = null;
  #camera_ = null;
  #scene_ = null;
  #clock_ = null;

  // Scene
  #sun_ = null;
  #box_ = null;

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
   */
  async #setupProject_() {
    // Debug & Performance
    this.#setupPane_();
    this.#setupStats_();

    this.#setupThree_();
    this.#setupBasicScene_();
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
    this.#camera_.position.set(2, 1, 2);
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

    // Add a box
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00f0,
    });
    this.#box_ = new THREE.Mesh(boxGeometry, boxMaterial);
    this.#box_.castShadow = true;
    this.#scene_.add(this.#box_);

    // Create a box tweak pane folder
    this.#box_.customParams = {
      wireframe: false,
      transparent: false,
      opacity: 1,
      color: this.#box_.material.color,
      position: { x: 0, y: 0, z: 0 },
      rotFactor: 0.2,
    };
    const boxFolder = this.#pane_.addFolder({ title: "Box" });
    // NOTE: boolean params can just follow `addBinding(paramObject, paramProperty)`
    boxFolder
      .addBinding(this.#box_.customParams, "wireframe")
      .on("change", (evt) => {
        this.#box_.material.wireframe = evt.value;
      });
    // NOTE: transparent + opacity are tied together, must have transparent true for opacity to kick in
    boxFolder
      .addBinding(this.#box_.customParams, "transparent")
      .on("change", (evt) => {
        this.#box_.material.transparent = evt.value;
        // make sure to update material after tweaking it
        this.#box_.material.needsUpdate = true;
      });
    // NOTE: params with ranges can follow `addBinding(paramObject, paramProperty, {min: min, max: max, step: step})`
    boxFolder
      .addBinding(this.#box_.customParams, "opacity", { min: 0, max: 0 })
      .on("change", (evt) => {
        this.#box_.material.opacity = evt.value;
      });
    // NOTE: color param has a "view" object where you can set a colorpicker
    //  - it looks like it matches the paramObject structure(r,g,b) in our case for THREE.Color
    boxFolder
      .addBinding(this.#box_.customParams, "color", {
        view: "color",
        color: { type: "float" },
      })
      .on("change", (evt) => {
        this.#box_.material.color.set(evt.value);
      });
    boxFolder
      .addBinding(this.#box_.customParams, "position")
      .on("change", (evt) => {
        this.#box_.position.set(evt.value.x, evt.value.y, evt.value.z);
      });
    boxFolder.addBinding(this.#box_.customParams, "rotFactor", {
      min: 0,
      max: 3,
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
  }

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

  // Our "tick" function
  #step_(elapsedTime) {
    this.#box_.rotation.y += this.#box_.customParams.rotFactor * elapsedTime;
  }

  // Our "draw" function
  #render_() {
    this.#three_.render(this.#scene_, this.#camera_);
  }

  // Our raf loop to continuously draw
  #raf_() {
    requestAnimationFrame((t) => {
      this.#stats_.begin();

      // Updates within the draw cycle
      // Note: we pass the delta time from the THREE clock as our elapsedTime value
      this.#step_(this.#clock_.getDelta());
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
