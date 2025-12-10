import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class App {
  #three_ = null;
  #controls_ = null;
  #camera_ = null;
  #scene_ = null;

  constructor() {}

  async initialize() {
    await this.#setupProject_();
  }

  /**
   * Project setup
   * - calls setupThree for setup
   * - calls setupBasicScene to add to the scene
   * - calls raf to start the draw loop
   */
  async #setupProject_() {
    this.#setupThree_();
    this.#setupBasicScene_();
    this.#raf_();
  }

  /**
   * Sets up three.
   * - creates the renderer
   * - creates canvas from renderer using window dims
   * - establishes DPR and aspect ratio
   * - sets up camera
   * - creates empty scene
   */
  #setupThree_() {
    this.#three_ = new THREE.WebGLRenderer({ antialias: true });
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.#three_.setSize(w, h);
    document.body.appendChild(this.#three_.domElement);
    const canvas = this.#three_.domElement;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const aspect = w / h;
    const dpr = window.devicePixelRatio;
    this.#three_.setSize(w * dpr, h * dpr, false);

    // Set up camera
    const fov = 70;
    const near = 0.1;
    const far = 1000;

    this.#camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.#camera_.updateProjectionMatrix();
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
