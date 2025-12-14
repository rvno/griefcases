import gsap from "gsap";

// Audio track paths
const TRACKS = {
  memories: "public/sounds/Memories-FirahFabe.mp3",
  trustTheProcess: "public/sounds/Trust_the_process_wip1.mp3",
};

/**
 * AudioManager
 * Manages audio playback with crossfading between tracks based on section changes
 */
export class AudioManager {
  #tracks = {};
  #currentTrack = null;
  #isAudioLoaded = false;
  #isSoundEnabled = false;
  #audioButton = null;
  #crossfadeDuration = 2; // seconds
  #sectionManager = null;
  #isFirstToggle = true;

  constructor() {
    this.#createAudioElements();
    this.#createAudioButton();
  }

  /**
   * Create and configure audio elements from TRACKS constant
   */
  #createAudioElements() {
    const trackKeys = Object.keys(TRACKS);
    let loadedCount = 0;

    trackKeys.forEach((key) => {
      const audio = new Audio(TRACKS[key]);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = "auto";

      // Track loading state
      audio.addEventListener("canplaythrough", () => {
        loadedCount++;
        if (loadedCount === trackKeys.length) {
          this.#isAudioLoaded = true;
          console.log("All audio tracks loaded");
        }
      });

      this.#tracks[key] = audio;
    });
  }

  /**
   * Create audio control button
   */
  #createAudioButton() {
    const mainOverlay = document.querySelector(".main-overlay");
    if (!mainOverlay) {
      console.error("Main overlay not found");
      return;
    }

    this.#audioButton = document.createElement("button");
    this.#audioButton.classList.add("audio-toggle");
    this.#audioButton.textContent = "Sound Off";
    this.#audioButton.style.opacity = "0";
    this.#audioButton.style.pointerEvents = "none";

    this.#audioButton.addEventListener("click", () => {
      this.toggleSound();
    });

    mainOverlay.appendChild(this.#audioButton);
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.#isSoundEnabled = !this.#isSoundEnabled;

    if (this.#isSoundEnabled) {
      this.#audioButton.textContent = "Sound On";

      // On first toggle, determine active section and play appropriate track
      if (this.#isFirstToggle) {
        this.#isFirstToggle = false;
        const activeSection = this.#determineActiveSection();

        if (activeSection) {
          // This will set #currentTrack and start playing
          this.onSectionChange(activeSection);
        }
      } else {
        // Resume current track if one should be playing
        if (this.#currentTrack) {
          this.#currentTrack.play();
          gsap.to(this.#currentTrack, {
            volume: 1,
            duration: this.#crossfadeDuration,
            ease: "power2.inOut",
          });
        }
      }
    } else {
      this.#audioButton.textContent = "Sound Off";
      // Fade out and pause current track
      if (this.#currentTrack) {
        gsap.to(this.#currentTrack, {
          volume: 0,
          duration: this.#crossfadeDuration,
          ease: "power2.inOut",
          onComplete: () => {
            this.#currentTrack.pause();
          },
        });
      }
    }
  }

  /**
   * Determine the active section based on section manager or URL hash
   * @returns {string|null} - Active section name
   */
  #determineActiveSection() {
    // First, check URL hash
    const hash = window.location.hash;
    if (hash) {
      // Extract section ID from hash (e.g., "#section-eight" -> "eight")
      const hashSection = hash.replace("#", "").replace("section-", "");

      // Validate it's a known section
      if (["g", "eight", "hourglass", "infinity"].includes(hashSection)) {
        return hashSection;
      }
    }

    // Fall back to section manager's active section
    if (this.#sectionManager) {
      const activeSection = this.#sectionManager.getActiveSection();
      if (activeSection) {
        return activeSection;
      }
    }

    // Default to first section if nothing else
    return "g";
  }

  /**
   * Set the section manager reference
   * @param {SectionManager} sectionManager - The section manager instance
   */
  setSectionManager(sectionManager) {
    this.#sectionManager = sectionManager;
  }

  /**
   * Handle section change to switch tracks if needed
   * @param {string} section - Section name (e.g., "g", "eight", "hourglass", "infinity")
   */
  onSectionChange(section) {
    if (!this.#isAudioLoaded || !this.#isSoundEnabled) return;

    // Determine which track to play
    // "g" or "eight" -> memories
    // "hourglass" or "infinity" -> trust the process
    const shouldPlayMemories = section === "g" || section === "eight";
    const targetTrack = shouldPlayMemories
      ? this.#tracks.memories
      : this.#tracks.trustTheProcess;

    // If this is already the current track, do nothing
    if (this.#currentTrack === targetTrack) return;

    const previousTrack = this.#currentTrack;
    this.#currentTrack = targetTrack;

    // Reset incoming track to beginning
    targetTrack.currentTime = 0;

    if (previousTrack) {
      // Crossfade from previous to new track
      this.#crossfade(previousTrack, targetTrack);
    } else {
      // No previous track, just fade in the new one
      targetTrack.play();
      gsap.to(targetTrack, {
        volume: 1,
        duration: this.#crossfadeDuration,
        ease: "power2.inOut",
      });
    }
  }

  /**
   * Crossfade between two audio tracks
   */
  #crossfade(fromTrack, toTrack) {
    // Start playing the new track at volume 0
    toTrack.volume = 0;
    toTrack.play();

    // Fade out old track
    gsap.to(fromTrack, {
      volume: 0,
      duration: this.#crossfadeDuration,
      ease: "power2.inOut",
      onComplete: () => {
        fromTrack.pause();
        fromTrack.currentTime = 0; // Reset to beginning
      },
    });

    // Fade in new track
    gsap.to(toTrack, {
      volume: 1,
      duration: this.#crossfadeDuration,
      ease: "power2.inOut",
    });
  }

  /**
   * Show the audio button when ready
   * @param {boolean} isReady - Whether the site is ready (images + audio loaded)
   */
  setReady(isReady) {
    if (isReady && this.#isAudioLoaded && this.#audioButton) {
      gsap.to(this.#audioButton, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        onStart: () => {
          this.#audioButton.style.pointerEvents = "auto";
        },
      });
    }
  }

  /**
   * Check if all audio is loaded
   * @returns {boolean}
   */
  isAudioLoaded() {
    return this.#isAudioLoaded;
  }

  /**
   * Check if sound is enabled
   * @returns {boolean}
   */
  isSoundEnabled() {
    return this.#isSoundEnabled;
  }

  /**
   * Cleanup
   */
  destroy() {
    Object.values(this.#tracks).forEach((track) => {
      track.pause();
    });
    this.#tracks = {};

    if (this.#audioButton) {
      this.#audioButton.remove();
      this.#audioButton = null;
    }
  }
}
