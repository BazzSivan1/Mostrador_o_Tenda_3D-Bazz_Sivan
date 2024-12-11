import * as Three from 'three';
import './App.css';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new Three.WebGLRenderer();
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(App);
document.querySelector('body').appendChild(renderer.domElement);

const textureLoader = new Three.TextureLoader();

const modelLoader = new GLTFLoader();

const camera = new Three.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(40, -2.8, 0); // Inicialización de la posición de la cámara
camera.rotation.set(0, 90 * Math.PI / 4, 0); // Rotación inicial de la cámara

const scene = new Three.Scene();

const light = new Three.DirectionalLight(0xffffff, 10);
light.position.set(0, 1, 0);
light.rotation.set(45, 45, 0);
light.castShadow = true;
scene.add(light);

const ambientLight = new Three.AmbientLight(0xffffff);
scene.add(ambientLight);

// Model references for interaction
let shelves, smartphone, samsung, xiaomi;

// Helper function to move camera towards a model without changing rotation
const tiltCameraToModel = (model) => {
  if (!model) return;

  const targetPosition = new Three.Vector3();
  model.getWorldPosition(targetPosition);

  // Usamos el offset base de Samsung
  const offset = new Three.Vector3(10, 2, -1);

  // Ajustamos la posición X del offset para centrar el modelo seleccionado
  const cameraTargetPosition = targetPosition.clone().add(offset);
  cameraTargetPosition.x = targetPosition.x + offset.x; // Ajuste correcto de X

  // Condicional para ajustar la posición X de la cámara si el modelo es el smartphone
  const cameraZ = model === smartphone ? cameraTargetPosition.z + 4 : cameraTargetPosition.z;

  // Animamos la cámara hacia la nueva posición
  gsap.to(camera.position, {
    x: 10,
    y: 5.03,
    z: cameraZ,
    duration: 1.5,
    ease: "power2.out",
  });
};

// Load models
modelLoader.load("models/shelves/shelves.gltf", (gltf) => {
  shelves = gltf.scene;
  shelves.scale.set(2, 2, 2);
  shelves.position.set(0, -30, 0);
  shelves.rotation.set(0, 90 * Math.PI / 4, 0);
  scene.add(shelves);
});

modelLoader.load("models/smartphone/scene.gltf", (gltf) => {
  smartphone = gltf.scene;
  smartphone.scale.set(0.125, 0.125, 0.125);
  smartphone.position.set(8, 6.62, -9);
  smartphone.rotation.set(0, 90 * Math.PI / 4, 0);
  scene.add(smartphone);

  // Add click event to move camera
  smartphone.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: smartphone };
    }
  });
});

modelLoader.load("models/samsung/scene.gltf", (gltf) => {
  samsung = gltf.scene;
  samsung.scale.set(30, 30, 30);
  samsung.position.set(0, 3.03, 1);
  samsung.rotation.set(0, 0, 0);
  scene.add(samsung);

  // Add click event to move camera
  samsung.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: samsung };
    }
  });
});

modelLoader.load("models/xiaomi/scene.gltf", (gltf) => {
  xiaomi = gltf.scene;
  xiaomi.scale.set(40, 40, 40);
  xiaomi.position.set(0, 2.55, 7);
  xiaomi.rotation.set(0, -88.9 * Math.PI / 4, 0);
  scene.add(xiaomi);

  // Add click event to move camera
  xiaomi.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: xiaomi };
    }
  });
});

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

const hdrLoader = new RGBELoader();
hdrLoader.load('hdri/phone_shop_4k.hdr', (texture) => {
  texture.mapping = Three.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// Variable para almacenar la animación de flotación
let floatingAnimation = null;
let lastSelectedModel = null; // Para almacenar el modelo que estaba flotando

// Función para hacer que el modelo flote hacia arriba y hacia abajo
const floatModel = (model) => {
  if (!model) return;

  // Si el modelo ya estaba flotando, detener la animación y restaurar su posición
  if (lastSelectedModel && lastSelectedModel !== model) {
    gsap.killTweensOf(lastSelectedModel.position); // Detener la animación del modelo anterior
    lastSelectedModel.position.y = lastSelectedModel.userData.originalY; // Restaurar la posición original
  }

  // Guardamos la posición original del modelo
  model.userData.originalY = model.position.y;

  // Animamos el modelo para que flote de arriba a abajo
  floatingAnimation = gsap.to(model.position, {
    y: model.position.y + 1, // Flota 1 unidad hacia arriba
    duration: 1, // Duración de un ciclo
    yoyo: true, // Hace que vuelva a su posición original
    repeat: -1, // Repite infinitamente
    ease: "sine.inOut", // Efecto de flotación suave
  });

  // Guardamos el modelo actual como el último modelo flotando
  lastSelectedModel = model;
};

// Función para detener la flotación y restaurar la posición
const stopFloating = (model) => {
  if (!model) return;

  // Detener la animación de flotación
  gsap.killTweensOf(model.position);

  // Restaurar la posición original del modelo
  model.position.y = model.userData.originalY;
};

// Raycaster para interacción
const raycaster = new Three.Raycaster();
const mouse = new Three.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const intersectedModel = intersects[0].object.userData.model;
    tiltCameraToModel(intersectedModel); // Mover la cámara al modelo

    // Si el modelo ya estaba flotando, lo detenemos y lo restauramos
    if (lastSelectedModel === intersectedModel) {
      stopFloating(intersectedModel);
      lastSelectedModel = null; // Desmarcar el modelo
    } else {
      // Si es un modelo diferente, hacemos que flote
      floatModel(intersectedModel);
    }
  }
});

let time = Date.now();

function App() {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;
  
  console.log( camera.position )

  renderer.render(scene, camera);
}

export default App;
