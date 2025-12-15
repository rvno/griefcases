import * as THREE from "three";

class ThirdPersonCamera {
  // the camera we're updating (perspective camera)
  #camera_ = null;
  #target_ = null;

  #currentPosition_ = new THREE.Vector3();
  #currentLookAt_ = new THREE.Vector3();

  #options_ = {
    cameraLerpFactor: 0.08,
    idealOffset_: new THREE.Vector3(),
    idealLookAt_: new THREE.Vector3(),
  };

  constructor(offset, lookat, target, camera, pane) {
    this.#options_.idealOffset_.copy(offset);
    this.#options_.idealLookAt_.copy(lookat);

    // the character
    this.#target_ = target;
    // the perspective camera
    this.#camera_ = camera;

    // Grab the proper offset immediately so we start at the right spot
    this.#currentPosition_.copy(this.#calculateIdealCameraPosition_());
    this.#currentLookAt_.copy(this.#calculateIdealCameraLookAt_());

    // Debug Params (only in dev mode)
    if (pane) {
      const cameraFolder = pane.addFolder({ title: "Camera" });
      cameraFolder.addBinding(this.#options_, "cameraLerpFactor", {
        min: 0.01,
        max: 0.5,
        step: 0.01,
      });
      cameraFolder.addBinding(this.#options_, "idealOffset_");
      cameraFolder.addBinding(this.#options_, "idealLookAt_");
    }
  }

  /**
   * The function returns the position vector for the 3rd person camera
   *  based off of the camera offset we define in options/params, and
   *  the target's position + rotation (quat)
   * @returns idealCameraPosition
   */
  #calculateIdealCameraPosition_() {
    // In our options, establish the start offset
    // For a "classic" 3rd person, start above (positive-y) and behind(neg-z)
    // - ^ a note for tweaking the code in the options/params, not here
    const idealPosition = this.#options_.idealOffset_.clone();

    // Apply the target's quaternion and position to the ideal offset
    // NOTE: similar to how we have to make sure to apply the
    //  character's rotation to the velocity factor we're adding
    idealPosition.applyQuaternion(this.#target_.quaternion);
    idealPosition.add(this.#target_.position);

    return idealPosition;
  }

  /**
   * The function returns the lookat pos vector based off the target
   * @returns idealLookAt position
   */
  #calculateIdealCameraLookAt_() {
    // NOTE: This looks directly at the target since we're using target position
    // const idealLookat = this.#target_.position.clone();

    // Update the cameraLookAt to point above + in front of the character
    const idealLookat = this.#options_.idealLookAt_.clone();
    idealLookat.applyQuaternion(this.#target_.quaternion);
    idealLookat.add(this.#target_.position);

    return idealLookat;
  }

  /**
   * Callback function to handle the frame by frame update logic
   * @param {*} elapsedTime
   */
  #updateCamera_(elapsedTime) {
    // Calculate ideal position/lookAt
    const idealCameraPosition = this.#calculateIdealCameraPosition_();
    const idealCameraLookAt = this.#calculateIdealCameraLookAt_();

    // NOTE: this is more of a "linear" follower
    // Interpolate towards ideal pos/LA from current pos/LA
    // this.#currentPosition_.copy(idealCameraPosition);
    // this.#currentLookAt_.copy(idealCameraLookAt);

    // NOTE: this is a smoother follower w/ lerping
    // - t effectively is our damping factor
    const t = 1.0 - Math.pow(this.#options_.cameraLerpFactor, elapsedTime);

    this.#currentPosition_.lerp(idealCameraPosition, t);
    this.#currentLookAt_.lerp(idealCameraLookAt, t);

    // Update the actual(perspective) camera
    this.#camera_.position.copy(this.#currentPosition_);
    this.#camera_.lookAt(this.#currentLookAt_);
  }

  /**
   * Our 'tick' function for the camera to increment frame by frame
   * @param {*} elapsedTime
   */
  step(elapsedTime) {
    this.#updateCamera_(elapsedTime);
  }
}

export { ThirdPersonCamera };
