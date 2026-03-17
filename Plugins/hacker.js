// Plugins/hacker.js

// Initialize the global plugin object if it doesn't exist
window.MoonPlugins = window.MoonPlugins || {};

// Register our Hacker Theme
window.MoonPlugins.HackerTheme = {
    name: "Hacker Theme v1.1 (Matrix Rain)",
    enabled: false,
    rainInterval: null,
    resizeHandler: null,

    // Called once when the user loads the JS file via the plugin manager
    onInstall: function(app) {
        console.log("Hacker Theme installed into memory.");
        this.app = app; // Store reference to the main app if we need it
    },

    // Called when the user clicks 'Enable'
    onEnable: function() {
        const root = document.documentElement;
        
        // Hijack the CSS variables for Hacker colors
        root.style.setProperty('--bg-main', '#050a05');
        root.style.setProperty('--panel-bg', 'rgba(0, 15, 0, 0.85)');
        root.style.setProperty('--text-main', '#00ff41'); // Neon Green
        root.style.setProperty('--accent', '#008f11'); // Darker Matrix Green
        root.style.setProperty('--border', '#003b00');
        root.style.setProperty('--input-bg', '#000000');
        root.style.setProperty('--font-main', '"Courier New", Courier, monospace');
        
        // Inject the Matrix Rain canvas
        this.startMatrixRain();
        
        console.log("System override... Hacker Mode Engaged.");
    },

    // Called when the user clicks 'Disable'
    onDisable: function() {
        const root = document.documentElement;
        
        // Remove overrides, restoring default CSS
        root.style.removeProperty('--bg-main');
        root.style.removeProperty('--panel-bg');
        root.style.removeProperty('--text-main');
        root.style.removeProperty('--accent');
        root.style.removeProperty('--border');
        root.style.removeProperty('--input-bg');
        root.style.removeProperty('--font-main');
        
        // Remove the Matrix Rain canvas
        this.stopMatrixRain();
        
        console.log("Hacker Mode disabled. Returning to normal.");
    },

    // --- VFX Features ---
    startMatrixRain: function() {
        // Create a canvas element for the rain
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-rain-canvas';
        
        // Style it to sit behind everything but above the base background color
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '0'; 
        canvas.style.pointerEvents = 'none'; // Ensure clicks pass through to the 3D rig
        canvas.style.opacity = '0.4'; // Subtle so it doesn't distract from animating
        
        // Insert it right behind the 3D canvas container
        document.body.insertBefore(canvas, document.body.firstChild);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*]*';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        // Initialize drops
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }
        
        // Draw the rain
        this.rainInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(5, 10, 5, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0'; // Neon green text
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }, 33);
        
        // Handle window resize dynamically
        this.resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', this.resizeHandler);
    },

    stopMatrixRain: function() {
        if (this.rainInterval) clearInterval(this.rainInterval);
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
        
        const canvas = document.getElementById('matrix-rain-canvas');
        if (canvas) canvas.remove();
    }
};
