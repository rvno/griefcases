class InputManager {
  #keys_ = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  #mapping_ = {
    87: "forward",
    83: "backward",
    65: "left",
    68: "right",
    38: "forward",
    40: "backward",
    37: "left",
    39: "right",
  };

  constructor() {}

  /**
   * Expose the key actions so that we may pass it to other classes
   */
  get Actions() {
    return this.#keys_;
  }

  initialize() {
    window.addEventListener("keydown", (e) => {
      this.#onKeyDown_(e);
    });

    window.addEventListener("keyup", (e) => {
      this.#onKeyUp_(e);
    });
  }

  /**
   *
   * OnKey abstract function
   * - because onKeyDown and OnKeyUp have similar logic, this is a minor abstraction
   * - we basically just update the "pressed" state contained in #keys {}
   * - `true` -> keydown, `false` -> keyup
   * @param {*} e - event
   * @param {*} bool - boolean indicating whether the key is pressed
   */
  #onKey_(e, bool) {
    const key = this.#mapping_[e.keyCode];

    if (key) {
      this.#keys_[key] = bool;
    }
  }

  /**
   *
   * Our keydown listener callback
   * - takes the keyCode and passes it to OnKey
   * @param {*} e
   */
  #onKeyDown_(e) {
    const key = this.#mapping_[e.keyCode];

    if (key) {
      this.#onKey_(e, true);
    }
  }

  /**
   *
   * Our keyup listener callback
   * - takes the keyCode and passes it to OnKey
   * @param {*} e
   */
  #onKeyUp_(e) {
    const key = this.#mapping_[e.keyCode];

    if (key) {
      this.#onKey_(e, false);
    }
  }
}

export { InputManager };
