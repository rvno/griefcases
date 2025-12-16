import * as THREE from "three";
import { getAssetPath } from "./utils/asset-path.js";

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
  #characterItems_ = []; // Orbiting items around character
  #objects_ = [];
  #floor_ = null; // Floor mesh reference
  #boundaryThreshold_ = 1.5; // Distance from floor edge where character is blocked

  // Proximity detection
  #interactionThreshold_ = 1.28; // Distance threshold for object interaction
  #interactedObjects_ = new Set(); // Track which objects have been interacted with
  #lastProximityCheck_ = 0; // Last time proximity check was performed
  #proximityCheckInterval_ = 0.1; // Throttle interval in seconds
  #targetCharacterOpacity_ = 0.25; // Target opacity for character (starts at initial value)
  #hourglassMaskElement_ = null; // Reference to hourglass mask element
  #initialHourglassMaskOpacity_ = null; // Initial opacity of hourglass mask
  #targetHourglassMaskOpacity_ = null; // Target opacity for hourglass mask

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
  #forceFieldBaseMaterial_ = null;
  #forceFieldMaterials_ = [];

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
    await this.#setupForceFieldMaterial_();

    await this.#setupBasicScene_();

    await this.#setupCharacter_();

    // Input Management
    this.#inputs_ = new InputManager();
    this.#inputs_.initialize();

    // 3rd Person Camera (pass Pane which may be null in production)
    this.#setup3rdCamera_(this.Pane);

    // Setup hourglass mask element reference
    this.#setupHourglassMask_();
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

    // Add a light tweak pane folder (only in dev mode)
    if (this.Pane) {
      const lightFolder = this.Pane.addFolder({
        title: "Sunlight",
        expanded: false,
      });
      lightFolder.addBinding(this.#sun_, "color", {
        view: "color",
        color: { type: "float" },
      });
      lightFolder.addBinding(this.#sun_, "intensity", {
        min: 0,
        max: 5,
        step: 0.01,
      });
    }

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

    // Store floor reference for boundary detection
    this.#floor_ = groundMesh;

    // Load turtle model once and create 8 instances positioned around boundary
    const turtleModel = await this.LoadGLB_("./models/turtle.glb");

    // Calculate boundary position based on floor dimensions and threshold
    const floorWidth = groundGeometry.parameters.width;
    const floorHeight = groundGeometry.parameters.height;
    const boundaryX = floorWidth / 2 - this.#boundaryThreshold_;
    const boundaryZ = floorHeight / 2 - this.#boundaryThreshold_;

    // Define 8 turtle positions around the boundary
    // 4 corners + 4 edge midpoints
    const turtlePositions = [
      // Corners
      { x: boundaryX, z: boundaryZ, name: "NE Corner" }, // Top-right
      { x: -boundaryX, z: boundaryZ, name: "NW Corner" }, // Top-left
      { x: -boundaryX, z: -boundaryZ, name: "SW Corner" }, // Bottom-left
      { x: boundaryX, z: -boundaryZ, name: "SE Corner" }, // Bottom-right
      // Edge midpoints
      { x: 0, z: boundaryZ, name: "North Edge" }, // Top middle
      { x: -boundaryX, z: 0, name: "West Edge" }, // Left middle
      { x: 0, z: -boundaryZ, name: "South Edge" }, // Bottom middle
      { x: boundaryX, z: 0, name: "East Edge" }, // Right middle
    ];

    const turtleParams = {
      scalar: 0.37,
      y: -1.15,
      rotation: { x: -0.05, y: 0, z: 0 },
    };

    // Create and position each turtle
    turtlePositions.forEach((pos, index) => {
      const turtle = turtleModel.clone();
      turtle.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          c.shadowSide = THREE.DoubleSide;
        }
      });

      // Position the turtle
      turtle.position.set(pos.x, turtleParams.y, pos.z);
      turtle.scale.setScalar(turtleParams.scalar);

      // Calculate angle to face center (origin at 0,0)
      // Direction vector from turtle position to center
      const directionX = 0 - pos.x;
      const directionZ = 0 - pos.z;
      // atan2 gives the angle in radians
      // In Three.js Y-axis rotation, we use atan2(x, z) not atan2(z, x)
      const angleToCenter = Math.atan2(directionX, directionZ);

      // Apply rotations: base X rotation + Y rotation to face center
      turtle.rotation.set(
        turtleParams.rotation.x,
        angleToCenter,
        turtleParams.rotation.z
      );

      this.Scene.add(turtle);
      const forcefield = this.#createForceFieldForModel_(turtle);

      if (this.Pane) {
        this.#createModelBinding_(`turtle_${index}`, turtle, this.Pane, {
          scalar: turtleParams.scalar,
          position: { x: pos.x, y: turtleParams.y, z: pos.z },
          rotation: {
            x: turtleParams.rotation.x,
            y: angleToCenter,
            z: turtleParams.rotation.z,
          },
        });
      }

      this.#objects_.push({
        name: `turtle_${index} (${pos.name})`,
        mesh: turtle,
        forcefield: forcefield,
      });
    });
  }

  #createModelBinding_(name, model, pane, params) {
    const folder = pane.addFolder({ title: name, expanded: false });

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

  #createForceFieldForModel_(model) {
    // Clone the base material so each forcefield can have independent fade values
    const forceFieldMaterial = this.#forceFieldBaseMaterial_.clone();

    // NOTE: After cloning, we must re-assign shared texture references
    // ShaderMaterial.clone() creates new uniform objects, but we need these specific textures
    // to be shared across all instances (depth buffer and pattern texture)
    forceFieldMaterial.uniforms.depthTexture.value = this.#depthCopy_.texture;
    forceFieldMaterial.uniforms.map.value =
      this.#forceFieldBaseMaterial_.uniforms.map.value;

    // Add to array so we can update all materials when Tweakpane changes colors
    this.#forceFieldMaterials_.push(forceFieldMaterial);

    // Get the world-space bounding box (includes model's scale and transforms)
    const modelBox3 = new THREE.Box3();
    modelBox3.setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    modelBox3.getCenter(center);
    modelBox3.getSize(size);
    const modelHeight = size.y;

    // Create forcefield geometry matching the world-space size
    const forceFieldGeo = new THREE.BoxGeometry(size.x, size.y, size.z);

    const forceField = new THREE.Mesh(forceFieldGeo, forceFieldMaterial);
    const forceFieldScale = 1.5;
    forceField.scale.setScalar(forceFieldScale);

    // NOTE: Use bounding box center instead of model.position for positioning
    // This is critical for models with non-centered pivots or scaled transforms.
    // For example, the turtle model (scale 0.37, position y: -1.15) has a pivot that
    // doesn't align with its visual center. Using the bounding box center ensures
    // the forcefield properly encapsulates the visible geometry regardless of
    // the model's pivot point or local transforms.
    forceField.position.copy(center);

    // Calculate world-space height after scaling
    const worldHeight = modelHeight * forceFieldScale;
    const halfHeight = worldHeight / 2;

    // Fade happens only in the last 25% from the top
    // NOTE: Using center.y ensures fade aligns with the actual geometry,
    // not the model's pivot point
    const topOfField = center.y + halfHeight;
    const fadeStartHeight = worldHeight * 0.25; // 25% of total height

    forceFieldMaterial.uniforms.fadeTop.value = topOfField;
    forceFieldMaterial.uniforms.fadeBottom.value = topOfField - fadeStartHeight;

    this.#transparentScene_.add(forceField);

    return forceField;
  }

  async #setupForceFieldMaterial_() {
    // Create the base forcefield material that will be shared across all forcefields
    this.#forceFieldBaseMaterial_ = await this.LoadShader_("depth-test", {
      depthTexture: { value: this.#depthCopy_.texture },
      cameraNearFar: {
        value: new THREE.Vector2(this.Camera.near, this.Camera.far),
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      map: {
        value: await this.loadTexture(
          getAssetPath("textures/placeholder-paw.ktx2"),
          true
        ),
      },
      time: { value: 0 },
      fadeTop: { value: 0.0 },
      fadeBottom: { value: 0.0 },
      color1: { value: new THREE.Vector3(0.02, 0.11, 0.2) },
      color2: { value: new THREE.Vector3(0.03, 0.21, 0.44) },
    });

    this.#forceFieldBaseMaterial_.uniforms.map.value.wrapS =
      THREE.RepeatWrapping;
    this.#forceFieldBaseMaterial_.uniforms.map.value.wrapT =
      THREE.RepeatWrapping;
    this.#forceFieldBaseMaterial_.transparent = true;
    this.#forceFieldBaseMaterial_.side = THREE.DoubleSide;
    this.#forceFieldBaseMaterial_.depthTest = true;
    this.#forceFieldBaseMaterial_.depthWrite = false;
    this.#forceFieldBaseMaterial_.blending = THREE.AdditiveBlending;

    // Create forcefield tweak pane folder (only in dev mode)
    if (this.Pane) {
      const forceFieldFolder = this.Pane.addFolder({
        title: "Forcefield",
        expanded: false,
      });

      // Custom params for tweakpane
      const forceFieldParams = {
        color1: { r: 0.02, g: 0.11, b: 0.2 },
        color2: { r: 0.03, g: 0.21, b: 0.44 },
      };

      forceFieldFolder
        .addBinding(forceFieldParams, "color1", {
          view: "color",
          color: { type: "float" },
        })
        .on("change", (evt) => {
          // Update all forcefield materials
          this.#forceFieldMaterials_.forEach((material) => {
            material.uniforms.color1.value.set(
              evt.value.r,
              evt.value.g,
              evt.value.b
            );
          });
        });

      forceFieldFolder
        .addBinding(forceFieldParams, "color2", {
          view: "color",
          color: { type: "float" },
        })
        .on("change", (evt) => {
          // Update all forcefield materials
          this.#forceFieldMaterials_.forEach((material) => {
            material.uniforms.color2.value.set(
              evt.value.r,
              evt.value.g,
              evt.value.b
            );
          });
        });
    }
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
    giraffe.traverse((c) => {
      if (c.isMesh) {
        c.material.transparent = true;
        c.material.opacity = 0.25;
        c.castShadow = true;
        c.receiveShadow = true;
        c.shadowSide = THREE.DoubleSide;
      }
    });
    // @TODO: need to adjust model pivot point in Blender
    giraffe.scale.setScalar(0.5);
    giraffe.position.set(0, -1, 0);

    // capsule character placeholder mesh
    // const charGeo = new THREE.CapsuleGeometry(0.5, 0.5, 10, 20);
    // const charMat = new THREE.MeshStandardMaterial({ color: 0x004343 });
    // const char = new THREE.Mesh(charGeo, charMat);
    // char.position.set(0, 0.4, 0);
    // char.castShadow = true;
    // char.receiveShadow = true;

    // create character parts
    const boxGeo = new THREE.CylinderGeometry(0.27, 0.05, 0.5, 8);
    const boxMat1 = new THREE.MeshStandardMaterial({
      color: 0xff8080,
      transparent: true,
      opacity: 0.7,
    });
    const boxMesh1 = new THREE.Mesh(boxGeo, boxMat1);
    boxMesh1.scale.setScalar(0.35); // Scale down by 65% (35% of original)
    boxMesh1.position.set(0.75, 0.25, 0);
    boxMesh1.castShadow = true;
    boxMesh1.receiveShadow = true;

    const boxMat2 = new THREE.MeshStandardMaterial({
      color: 0x8080ff,
      transparent: true,
      opacity: 0.35,
    });
    const boxMesh2 = new THREE.Mesh(boxGeo, boxMat2);
    boxMesh2.scale.setScalar(0.35); // Scale down by 65% (35% of original)
    boxMesh2.position.set(-0.75, 0.25, 0);
    boxMesh2.castShadow = true;
    boxMesh2.receiveShadow = true;

    const boxMat3 = new THREE.MeshStandardMaterial({
      color: 0x80ff80,
      transparent: true,
      opacity: 0.15,
    });
    const boxMesh3 = new THREE.Mesh(boxGeo, boxMat3);
    boxMesh3.scale.setScalar(0.35); // Scale down by 65% (35% of original)
    boxMesh3.position.set(0, 0.55, -0.75);
    boxMesh3.castShadow = true;
    boxMesh3.receiveShadow = true;

    const boxMat4 = new THREE.MeshStandardMaterial({
      color: 0xffff80,
      transparent: true,
      opacity: 0.5,
    });
    const boxMesh4 = new THREE.Mesh(boxGeo, boxMat4);
    boxMesh4.scale.setScalar(0.35); // Scale down by 65% (35% of original)
    boxMesh4.position.set(-0.75, 0.25, -0.75);
    boxMesh4.castShadow = true;
    boxMesh4.receiveShadow = true;

    // Assemble character parts
    // charGroup.add(char);
    charGroup.add(giraffe);
    charGroup.add(boxMesh1);
    charGroup.add(boxMesh2);
    charGroup.add(boxMesh3);
    charGroup.add(boxMesh4);

    this.#character_ = giraffe;
    this.#characterGroup_ = charGroup;
    this.Scene.add(charGroup);

    // Store character items for orbital animation
    // Each item stores: mesh, initial distance from center, initial angle, oscillation offset
    // Items are positioned at the corners of a square around the character
    this.#characterItems_ = [
      {
        mesh: boxMesh1,
        distance: Math.sqrt(0.75 * 0.75 + 0.75 * 0.75), // diagonal distance (corner of square)
        angle: Math.atan2(0.75, 0.75), // Top-right corner (45°)
        baseY: 0.25, // base Y position
        oscillationSpeed: 1.0, // oscillation frequency multiplier
        oscillationAmount: 0.3, // how much it moves up/down
        orbitSpeed: 0.5, // rotation speed multiplier
        visible: true, // render toggle
        name: "Item 1 (Red)", // for UI
      },
      {
        mesh: boxMesh2,
        distance: Math.sqrt(0.75 * 0.75 + 0.75 * 0.75), // diagonal distance (corner of square)
        angle: Math.atan2(0.75, -0.75), // Top-left corner (135°)
        baseY: 0.25,
        oscillationSpeed: 1.3,
        oscillationAmount: 0.25,
        orbitSpeed: 0.5,
        visible: true, // render toggle
        name: "Item 2 (Blue)", // for UI
      },
      {
        mesh: boxMesh3,
        distance: Math.sqrt(0.75 * 0.75 + 0.75 * 0.75), // diagonal distance (corner of square)
        angle: Math.atan2(-0.75, -0.75), // Bottom-left corner (225°)
        baseY: 0.55,
        oscillationSpeed: 0.8,
        oscillationAmount: 0.35,
        orbitSpeed: 0.5,
        visible: true, // render toggle
        name: "Item 3 (Green)", // for UI
      },
      {
        mesh: boxMesh4,
        distance: Math.sqrt(0.75 * 0.75 + 0.75 * 0.75), // diagonal distance (corner of square)
        angle: Math.atan2(-0.75, 0.75), // Bottom-right corner (315°)
        baseY: 0.25, // base Y position
        oscillationSpeed: 1.1, // oscillation frequency multiplier
        oscillationAmount: 0.28, // how much it moves up/down
        orbitSpeed: 0.5, // rotation speed multiplier
        visible: true, // render toggle
        name: "Item 4 (Yellow)", // for UI
      },
    ];

    // Create a character tweak pane folder
    this.#character_.customParams = {
      wireframe: false,
      transparent: true,
      opacity: 0.25,
      // color: { r: 1, g: 1, b: 1 },
      position: { x: 0, y: -1.5, z: 0 },
      rotFactor: 0.2,
      boundaryThreshold: this.#boundaryThreshold_,
      interactionThreshold: this.#interactionThreshold_,
    };
    let previousValues = {
      position: { x: 0, y: -1.5, z: 0 },
      rotFactor: 0.2,
    };

    // Only add Tweakpane controls in dev mode
    if (this.Pane) {
      const charFolder = this.Pane.addFolder({
        title: "Character",
        expanded: false,
      });
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

      // Boundary threshold control
      charFolder
        .addBinding(this.#character_.customParams, "boundaryThreshold", {
          label: "Boundary Threshold",
          min: 0,
          max: 10,
          step: 0.1,
        })
        .on("change", (evt) => {
          this.#boundaryThreshold_ = evt.value;
        });

      // Interaction threshold control
      charFolder
        .addBinding(this.#character_.customParams, "interactionThreshold", {
          label: "Interaction Threshold",
          min: 0,
          max: 15,
          step: 0.1,
        })
        .on("change", (evt) => {
          this.#interactionThreshold_ = evt.value;
        });

      // Character Items visibility controls
      const itemsFolder = this.Pane.addFolder({
        title: "Character Items",
        expanded: false,
      });

      this.#characterItems_.forEach((item) => {
        itemsFolder
          .addBinding(item, "visible", { label: item.name })
          .on("change", (evt) => {
            item.mesh.visible = evt.value;
          });
      });
    }
  }

  async #setupEnvironment_() {
    this.Scene.backgroundBlurriness = 0.4;
    this.Scene.backgroundIntensity = 0.5;
    this.Scene.environmentIntensity = 0.5;

    // @TODO: custom shader fog for better performance and height/wave control
    this.#environment_.customParams = {
      fogColor: new THREE.Color(0.34, 0.38, 0.71),
      fogDensity: 0.13,
      hdrTexture: "autumn_field_puresky_1k.hdr",
    };
    this.Scene.fog = new THREE.FogExp2(
      this.#environment_.customParams.fogColor,
      this.#environment_.customParams.fogDensity
    );

    // Only add Tweakpane controls in dev mode
    if (this.Pane) {
      const bgFolder = this.Pane.addFolder({
        title: "Background",
        expanded: false,
      });

      bgFolder
        .addBinding(this.#environment_.customParams, "fogColor", {
          view: "color",
          color: { type: "float" },
        })
        .on("change", (evt) => {
          this.Scene.fog.color.set(evt.value.r, evt.value.g, evt.value.b);
        });
      bgFolder
        .addBinding(this.#environment_.customParams, "fogDensity", {
          min: 0,
          max: 1,
          step: 0.001,
        })
        .on("change", (evt) => {
          this.Scene.fog.density = evt.value;
        });
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
    }

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
   * NOTE: we don't use this anymore since we use onStep - our overrideable function from APP
   * Our "tick" function
   * - what we're doing every frame
   * - we're essentially invoking other functions that handle the logic for different respective elements
   * @param {*} elapsedTime
   */
  // #step_(elapsedTime) {
  //   this.#updateCharacterMovement_(elapsedTime);
  //   this.#updateCamera_(elapsedTime);
  //   this.#updateSun_(elapsedTime);
  // }

  /**
   * Setup hourglass mask element reference and get initial opacity
   */
  #setupHourglassMask_() {
    this.#hourglassMaskElement_ = document.querySelector('.masked-section--hourglass');
    if (this.#hourglassMaskElement_) {
      // Get computed style to find initial ::after opacity
      const style = window.getComputedStyle(this.#hourglassMaskElement_, '::after');
      const initialOpacity = parseFloat(style.opacity);
      this.#initialHourglassMaskOpacity_ = isNaN(initialOpacity) ? 1 : initialOpacity;
      this.#targetHourglassMaskOpacity_ = this.#initialHourglassMaskOpacity_;

      console.log(`Hourglass mask initial opacity: ${this.#initialHourglassMaskOpacity_}`);
    }
  }

  /**
   * Checks proximity between character and objects in the scene
   * - Calculates distance from character center to object bounding box centers
   * - Increases character opacity incrementally with each discovery (with lerping)
   * - Changes forcefield color to active state
   * - Updates hourglass mask opacity
   * - Tracks completion when all objects have been interacted with
   */
  #checkObjectProximity_() {
    // Get character position (using the group position which is the center)
    const characterPos = this.#characterGroup_.position;

    this.#objects_.forEach((object) => {
      // Calculate bounding box center of the object
      const boundingBox = new THREE.Box3().setFromObject(object.mesh);
      const objectCenter = new THREE.Vector3();
      boundingBox.getCenter(objectCenter);

      // Calculate distance between character center and object center
      const distance = characterPos.distanceTo(objectCenter);

      // Check if within interaction threshold
      if (distance <= this.#interactionThreshold_) {
        // Check if this object hasn't been interacted with yet
        if (!this.#interactedObjects_.has(object.name)) {
          this.#interactedObjects_.add(object.name);

          // Calculate target opacity increment
          const startingOpacity = 0.25; // Use fixed starting opacity
          const targetOpacity = 1.0;
          const opacityDifference = targetOpacity - startingOpacity;
          const opacityIncrement = opacityDifference / this.#objects_.length;

          // Calculate new target opacity based on number of discovered objects
          this.#targetCharacterOpacity_ = startingOpacity + (opacityIncrement * this.#interactedObjects_.size);

          // Update forcefield color to active state
          if (object.forcefield && object.forcefield.material) {
            const material = object.forcefield.material;
            if (material.uniforms && material.uniforms.color2) {
              material.uniforms.color2.value.set(0.33, 0.20, 0.02);
              console.log(`Updated forcefield color for ${object.name}:`, material.uniforms.color2.value);
            } else {
              console.warn(`No color2 uniform found for ${object.name}`);
            }
          } else {
            console.warn(`No forcefield or material for ${object.name}`);
          }

          // Update hourglass mask target opacity
          if (this.#hourglassMaskElement_ && this.#initialHourglassMaskOpacity_ !== null) {
            const maskOpacityDifference = this.#initialHourglassMaskOpacity_ - 0;
            const maskOpacityDecrement = maskOpacityDifference / this.#objects_.length;
            this.#targetHourglassMaskOpacity_ = this.#initialHourglassMaskOpacity_ - (maskOpacityDecrement * this.#interactedObjects_.size);
          }

          console.log(`Discovered ${object.name} (${this.#interactedObjects_.size}/${this.#objects_.length}). Target opacity: ${this.#targetCharacterOpacity_.toFixed(2)}`);

          // Check if all objects have been discovered
          if (this.#interactedObjects_.size === this.#objects_.length) {
            console.log("Completed! All objects discovered!");
          }
        }
      }
    });
  }

  /**
   * Utilizes InputManager to update/handle the character movement logic
   * - utilized within the `step` function
   *
   * CHANGELOG (2025-12-15): Proximity-Based Interaction System
   * =========================================================
   * Added proximity detection system that tracks when the character approaches objects (turtles).
   *
   * HOW IT WORKS:
   * 1. Distance Calculation:
   *    - Every 0.1 seconds (throttled for performance), calculates distance between character
   *      center position and each object's bounding box center using THREE.Vector3.distanceTo()
   *    - Configurable threshold (default: 1.28 units, adjustable via Tweakpane)
   *
   * 2. Interaction Detection:
   *    - When distance <= threshold, object is "discovered"
   *    - Tracked via Set (#interactedObjects_) to prevent duplicate interactions
   *    - Each discovery triggers three synchronized effects (see below)
   *
   * 3. Visual Feedback Effects (all use smooth lerping in onStep):
   *    a) Character Opacity:
   *       - Starts at 0.25 (25%), increments toward 1.0 (100%) with each discovery
   *       - Increment = (1.0 - 0.25) / 8 objects = 0.09375 per discovery
   *       - Lerps smoothly (factor: 0.05) toward target opacity each frame
   *
   *    b) Forcefield Color:
   *       - Changes object's forcefield color2 uniform from blue to orange
   *       - New color: RGB(0.33, 0.20, 0.02) - warm amber/golden tone
   *       - Instant change (no lerping) provides immediate visual confirmation
   *
   *    c) Hourglass Mask Opacity:
   *       - CSS ::after pseudo-element on .masked-section--hourglass
   *       - Starts at 0.48 (48%), decrements toward 0 (fully transparent)
   *       - Decrement = 0.48 / 8 objects = 0.06 per discovery
   *       - Lerps smoothly via CSS custom property --hourglass-mask-opacity
   *
   * 4. Throttling:
   *    - Distance checks throttled to every 0.1s using totalElapsedTime
   *    - Prevents performance issues from continuous bounding box calculations
   *    - See #proximityCheckInterval_ and #lastProximityCheck_
   *
   * 5. Completion:
   *    - When all 8 objects discovered, logs "Completed!" to console
   *    - Character reaches full opacity (1.0)
   *    - Hourglass mask becomes fully transparent (0)
   *
   * RELATED CODE:
   * - #checkObjectProximity_() - Distance calculation and interaction logic
   * - onStep() lines 987-1025 - Lerping implementation for smooth transitions
   * - #setupHourglassMask_() - CSS custom property initialization
   * - base.css lines 707-722 - Hourglass mask CSS with custom property
   *
   * @param {*} elapsedTime - Delta time since last frame
   * @param {*} totalElapsedTime - Total elapsed time since app start
   */
  #updateCharacterMovement_(elapsedTime, totalElapsedTime) {
    const MOVE_SPEED = 2.8;
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

    // Calculate new position
    const newPosition = this.#characterGroup_.position.clone().add(velocity);

    // Check boundary constraints based on floor dimensions
    if (this.#floor_) {
      // Get floor dimensions from geometry (PlaneGeometry width/height)
      const floorGeometry = this.#floor_.geometry;
      const floorWidth = floorGeometry.parameters.width;
      const floorHeight = floorGeometry.parameters.height;

      // Calculate boundary limits with threshold
      const halfWidth = floorWidth / 2 - this.#boundaryThreshold_;
      const halfHeight = floorHeight / 2 - this.#boundaryThreshold_;

      // Clamp position to stay within boundaries
      newPosition.x = THREE.MathUtils.clamp(
        newPosition.x,
        -halfWidth,
        halfWidth
      );
      newPosition.z = THREE.MathUtils.clamp(
        newPosition.z,
        -halfHeight,
        halfHeight
      );
    }

    // Check the character's position relative to objects within the scene.
    // Throttle proximity checks for performance using elapsed time
    if (
      totalElapsedTime - this.#lastProximityCheck_ >
      this.#proximityCheckInterval_
    ) {
      this.#lastProximityCheck_ = totalElapsedTime;
      this.#checkObjectProximity_();
    }

    // NOTE: Make sure to apply the quaternion (character's rotation) first
    // Moves the character forward/backward
    this.#characterGroup_.position.copy(newPosition);
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
   * Updates character items (orbital cylinders) with rotation and oscillation
   * - Items orbit around the character in the XZ plane
   * - Each item oscillates up and down with different speeds/amounts
   * @param {*} totalElapsedTime - Total time elapsed since start
   */
  #updateCharacterItems_(totalElapsedTime) {
    this.#characterItems_.forEach((item) => {
      // Only update visible items
      if (!item.visible) return;

      // Update orbital angle based on time and item's orbit speed
      const currentAngle = item.angle + totalElapsedTime * item.orbitSpeed;

      // Calculate new position in XZ plane (orbital motion)
      const x = Math.cos(currentAngle) * item.distance;
      const z = Math.sin(currentAngle) * item.distance;

      // Calculate Y position with oscillation (sine wave)
      const oscillation =
        Math.sin(totalElapsedTime * item.oscillationSpeed) *
        item.oscillationAmount;
      const y = item.baseY + oscillation;

      // Update mesh position (relative to character group)
      item.mesh.position.set(x, y, z);
    });
  }

  onStep(elapsedTime, totalElapsedTime) {
    this.#transparentScene_.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.material.uniforms) {
          obj.material.uniforms.time.value = totalElapsedTime;
        }
      }
    });

    this.#updateCharacterMovement_(elapsedTime, totalElapsedTime);
    this.#updateCharacterItems_(totalElapsedTime);
    this.#updateCamera_(elapsedTime);
    this.#updateSun_(elapsedTime);

    // Lerp character opacity towards target
    if (this.#character_) {
      const lerpFactor = 0.05; // Smooth lerp factor (lower = smoother)
      let needsUpdate = false;

      this.#character_.traverse((c) => {
        if (c.isMesh) {
          const currentOpacity = c.material.opacity;
          const newOpacity = THREE.MathUtils.lerp(currentOpacity, this.#targetCharacterOpacity_, lerpFactor);

          if (Math.abs(newOpacity - currentOpacity) > 0.001) {
            c.material.opacity = newOpacity;
            needsUpdate = true;
          }
        }
      });

      // Update customParams if opacity changed
      if (needsUpdate) {
        const firstMesh = this.#character_.children.find(c => c.isMesh);
        if (firstMesh) {
          this.#character_.customParams.opacity = firstMesh.material.opacity;
        }
      }
    }

    // Lerp hourglass mask opacity towards target
    if (this.#hourglassMaskElement_ && this.#targetHourglassMaskOpacity_ !== null) {
      // We can't directly lerp CSS ::after opacity, so we use CSS custom properties
      const currentOpacity = parseFloat(
        getComputedStyle(this.#hourglassMaskElement_).getPropertyValue('--hourglass-mask-opacity') || this.#initialHourglassMaskOpacity_
      );
      const lerpFactor = 0.05;
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, this.#targetHourglassMaskOpacity_, lerpFactor);

      if (Math.abs(newOpacity - currentOpacity) > 0.001) {
        this.#hourglassMaskElement_.style.setProperty('--hourglass-mask-opacity', newOpacity);
      }
    }
  }

  // Getter for boundary threshold (can be referenced elsewhere)
  get BoundaryThreshold() {
    return this.#boundaryThreshold_;
  }
}

let APP_ = new Project();

window.addEventListener("DOMContentLoaded", async () => {
  await APP_.initialize();
});
