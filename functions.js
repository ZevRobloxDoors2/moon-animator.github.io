// Basic Plugin Manager
class PluginManager {
    constructor(app) {
        this.app = app;
        this.installedPlugins = {};
    }

    openMenu() { document.getElementById('plugin-modal').classList.remove('hidden'); this.renderList(); }
    closeMenu() { document.getElementById('plugin-modal').classList.add('hidden'); }

    loadPluginFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Execute the plugin script in the global scope
                const scriptEl = document.createElement('script');
                scriptEl.textContent = e.target.result;
                document.body.appendChild(scriptEl);
                
                setTimeout(() => {
                    this.registerDetectedPlugins();
                    this.renderList();
                    this.app.showToast("Plugin Installed!");
                }, 100);
            } catch (err) {
                alert("Failed to load plugin: " + err);
            }
        };
        reader.readAsText(file);
        event.target.value = ""; 
    }

    registerDetectedPlugins() {
        if (window.MoonPlugins) {
            for (const [key, pluginObj] of Object.entries(window.MoonPlugins)) {
                if (!this.installedPlugins[key]) {
                    this.installedPlugins[key] = pluginObj;
                    if(pluginObj.onInstall) pluginObj.onInstall(this.app);
                }
            }
        }
    }

    togglePlugin(key) {
        const plugin = this.installedPlugins[key];
        plugin.enabled = !plugin.enabled;
        if (plugin.enabled && plugin.onEnable) plugin.onEnable();
        else if (!plugin.enabled && plugin.onDisable) plugin.onDisable();
        this.renderList();
    }

    renderList() {
        const list = document.getElementById('installed-plugins-list');
        list.innerHTML = '';
        const keys = Object.keys(this.installedPlugins);
        if (keys.length === 0) { list.innerHTML = '<p class="text-sm opacity-60">No plugins installed.</p>'; return; }

        keys.forEach(key => {
            const plugin = this.installedPlugins[key];
            const div = document.createElement('div');
            div.className = "flex justify-between items-center bg-black/30 p-2 rounded border border-[var(--border)]";
            div.innerHTML = `
                <span class="font-bold text-[var(--text-main)]">${plugin.name}</span>
                <button class="px-3 py-1 text-xs rounded ${plugin.enabled ? 'bg-red-600' : 'bg-green-600'} text-white font-bold"
                        onclick="app.pluginManager.togglePlugin('${key}')">
                    ${plugin.enabled ? 'Disable' : 'Enable'}
                </button>
            `;
            list.appendChild(div);
        });
    }
}

class AnimationApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.rig = {}; 
        this.partsList = ['Torso', 'Head', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'];
        
        this.pluginManager = new PluginManager(this);
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202025);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 8);
        this.camera.lookAt(0, 2, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        this.scene.add(new THREE.GridHelper(50, 50, 0x444444, 0x2a2a2a));

        this.buildR6Rig();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.animate();
    }

    buildR6Rig() {
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf6d743, roughness: 0.6 });
        const blueMat = new THREE.MeshStandardMaterial({ color: 0x0d69ac, roughness: 0.6 });
        const greenMat = new THREE.MeshStandardMaterial({ color: 0xa1c48c, roughness: 0.6 });

        this.rig.root = new THREE.Group();
        this.rig.root.position.y = 3; 
        this.scene.add(this.rig.root);

        const createPart = (name, w, h, d, colorMat, parent, px, py, pz, pivotOffset) => {
            const group = new THREE.Group();
            group.position.set(px, py, pz);
            
            // USING ROUNDED BOX GEOMETRY for Roblox Style!
            // Args: width, height, depth, segments, radius
            const geo = new THREE.RoundedBoxGeometry(w, h, d, 4, 0.1);
            geo.translate(0, pivotOffset, 0); 
            
            const mesh = new THREE.Mesh(geo, colorMat);
            group.add(mesh); parent.add(group);
            this.rig[name] = group;
            
            // Add to UI
            const list = document.getElementById('hierarchy-list');
            const div = document.createElement('div');
            div.className = "px-2 py-1 rounded hover:bg-black/20 cursor-pointer text-sm";
            div.innerText = name;
            list.appendChild(div);
            
            return group;
        };

        const torso = createPart('Torso', 2, 2, 1, blueMat, this.rig.root, 0, 0, 0, 0);
        createPart('Head', 1.2, 1.2, 1.2, yellowMat, torso, 0, 1.6, 0, 0);
        createPart('Left Arm', 1, 2, 1, yellowMat, torso, -1.5, 0, 0, 1);
        createPart('Right Arm', 1, 2, 1, yellowMat, torso, 1.5, 0, 0, 1);
        createPart('Left Leg', 1, 2, 1, greenMat, torso, -0.5, -2, 0, 1);
        createPart('Right Leg', 1, 2, 1, greenMat, torso, 0.5, -2, 0, 1);
    }

    showToast(msg) {
        const t = document.getElementById('action-toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the app
const app = new AnimationApp();
