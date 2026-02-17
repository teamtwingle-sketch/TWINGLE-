
// Sound Effects Utility

// Standard sound URLs (using reliable public domain or free-to-use CDN assets)
// Fallbacks are handled if audio fails to load
const SOUNDS = {
    match: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", // Success/Win sound
    swipe: "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3", // Whoosh
    message: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3", // Pop/Bubble
    notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Gentle Bell
};

class SoundManager {
    constructor() {
        this.cache = {};
        this.enabled = true;

        // Preload sounds
        if (typeof window !== 'undefined') {
            Object.keys(SOUNDS).forEach(key => {
                this.cache[key] = new Audio(SOUNDS[key]);
                this.cache[key].volume = 0.5; // Default volume
            });
        }
    }

    play(key) {
        if (!this.enabled || !this.cache[key]) return;

        const audio = this.cache[key];

        // Reset to start if already playing (allows rapid fire)
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented
                // This is expected if user hasn't interacted with document yet
                // We silently fail or log standard debug info
                // console.debug("Audio play prevented:", error);
            });
        }
    }
}

const soundManager = new SoundManager();
export default soundManager;
