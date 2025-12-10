import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class App {
  #three_ = null;
  #controls_ = null;
  #camera_ = null;
  #scene_ = null;

  constructor() {}

  /**
   * Starts the project
   * - Runs setupProject
   * - Starts the draw loop
   */
  async initialize() {
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
   */
  async #setupProject_() {
    this.#setupThree_();
    this.#setupBasicScene_();
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
  }

  /**
   * Sets up the scene
   * - adds a cube
   */
  #setupBasicScene_() {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    this.#scene_.add(boxMesh);
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

  // Our "draw" function
  #render_() {
    this.#three_.render(this.#scene_, this.#camera_);
  }

  // Our raf loop to continuously draw
  #raf_() {
    requestAnimationFrame((t) => {
      this.#render_();
      this.#raf_();
    });
  }
}

let APP_ = null;

window.addEventListener("DOMContentLoaded", async () => {
  APP_ = new App();
  await APP_.initialize();
});
