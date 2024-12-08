import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Set up the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Adjust camera position to focus on the model

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1); // Dark background 
document.body.appendChild(renderer.domElement);

// Set up ambient lighting with lower intensity for soft shadows
const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Dim ambient light
scene.add(ambientLight);

// Directional light for better shading with a brighter intensity
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Load the GLB model (Make sure this model is of the character you're trying to display)
const loader = new GLTFLoader();
loader.load(
  'public/franxx_girl.glb', // Replace with path to the model of the character
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Scale and position the model
    model.scale.set(2, 2, 2); // Scale the model appropriately
    model.position.set(0, -1, 0); // Position it for better visibility

    // Rotate the model to make the character face the right side
    model.rotation.y = 0; // Rotation set to 0, facing the right

    // Apply custom colors and materials to mimic the outfit
    model.traverse((child) => {
      if (child.isMesh) {
        // Change material to reflect character's outfit (e.g., red and white for the Franxx character)
        if (child.name.includes('Outfit') || child.name.includes('Body')) { // Make sure the correct mesh is targeted
          child.material = new THREE.MeshStandardMaterial({
            color: 0xff0000, // Red color for the outfit
            emissive: 0xff0000, // Red glow for emissive effect
            emissiveIntensity: 0.4,
            roughness: 0.5,
            metalness: 0.0
          });
        }

        // If the model has separate parts for skin, face, or accessories, you can target them like this:
        if (child.name.includes('Face')) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xfad0a1, // Light skin tone
            emissive: 0xfad0a1,
            emissiveIntensity: 0.3,
            roughness: 0.6,
            metalness: 0.0
          });
        }
      }
    });

    // Animation mixer for any animations in the model
    const mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;

    if (animations.length > 0) {
      const action = mixer.clipAction(animations[0]); // Play the first animation
      action.play();
    }

    // Animation loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    }

    animate();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
