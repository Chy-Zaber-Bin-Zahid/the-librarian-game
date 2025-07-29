import { GameLoop } from './GameLoop.js';
import { StateManager } from './states/StateManager.js';
import { InputManager } from './systems/InputManager.js';
import { AssetLoader } from './systems/AssetLoader.js';
import { Camera } from './systems/Camera.js';
import { Renderer } from './systems/Renderer.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    console.log('Canvas element:', this.canvas);
    
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.width = 1280;
    this.height = 720;
    this.setupCanvas();
    
    // Core systems
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );
    
    this.stateManager = new StateManager(this);
    this.inputManager = new InputManager(this.canvas);
    this.assetLoader = new AssetLoader();
    this.camera = new Camera(this.width, this.height);
    this.renderer = new Renderer(this.ctx, this.camera);
    
    // Debug info
    this.debug = {
      showFPS: false, // Disabled by default
      showCollisionBoxes: false,
      showGrid: false
    };
    
    // Game-specific data
    this.gameData = {
      chaosLevel: 0,
      maxChaos: 100,
      playerLevel: 1,
      xp: 0,
      xpToNext: 100,
      elapsedTime: 0,
      targetTime: 30 * 60, // 30 minutes in seconds
      isPaused: false
    };
  }
  
  setupCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Handle window resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }
  
  handleResize() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scale = Math.min(
      containerWidth / this.width,
      containerHeight / this.height
    );
    
    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;
  }
  
  async init() {
    // Load assets
    await this.loadAssets();
    
    // Initialize states
    await this.stateManager.init();
    
    // Hide loading screen
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
    
    // Start with menu state
    this.stateManager.changeState('menu');
    
    // Start game loop
    this.gameLoop.start();
  }
  
  async loadAssets() {
    // Generate placeholder assets for development
    this.assetLoader.generatePlaceholderAssets();
    
    // Later we'll load real assets like this:
    // const assets = {
    //   images: { ... },
    //   audio: { ... },
    //   data: { ... }
    // };
    // await this.assetLoader.loadAll(assets);
  }
  
  update(deltaTime) {
    // Update current state BEFORE clearing input events
    this.stateManager.update(deltaTime);
    
    // Update camera
    this.camera.update(deltaTime);
    
    // Update input AFTER game logic has processed events
    this.inputManager.update();
  }
  
  render(interpolation) {
    // Clear canvas
    this.renderer.clear();
    
    // Render current state
    this.stateManager.render(this.renderer, interpolation);
    
    // Render debug info (disabled)
    // if (this.debug.showFPS) {
    //   this.renderDebugInfo();
    // }
  }
  
  renderDebugInfo() {
    const fps = this.gameLoop.getFPS();
    
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillRect(this.width - 80, 5, 70, 25);
    
    this.ctx.fillStyle = '#000';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`FPS: ${fps}`, this.width - 10, 22);
    
    this.ctx.restore();
  }
}