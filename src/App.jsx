import * as Three from 'three';
import './App.css';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

// Obtener el elemento de lienzo personalizado desde el HTML
const canvas = document.querySelector('canvas.webgl');

// Configuración inicial del tamaño del renderizador
const width = window.innerWidth;
const height = window.innerHeight;

// Configuración del renderizador WebGL
const renderer = new Three.WebGLRenderer({ canvas: canvas });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(App);
document.querySelector('body').appendChild(renderer.domElement);

// Inicializa el cargador de modelos GLTF
const modelLoader = new GLTFLoader();

// Configuración de la cámara
const camera = new Three.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(40, -2.8, 0);
camera.rotation.set(0, 90 * Math.PI / 4, 0);

// Crea la escena 3D
const scene = new Three.Scene();

// Configuración de la iluminación
const light = new Three.DirectionalLight(0xffffff, 10);
light.position.set(0, 1, 0);
light.rotation.set(45, 45, 0);
light.castShadow = true;
scene.add(light);

const ambientLight = new Three.AmbientLight(0xffffff);
scene.add(ambientLight);

// Declaración de referencias para los modelos 3D que se van a cargar
let shelves, smartphone, samsung, xiaomi;

// Función auxiliar para mover la cámara hacia un modelo específico
const tiltCameraToModel = (model) => {
  if (!model) return;

  const targetPosition = new Three.Vector3();
  model.getWorldPosition(targetPosition);

  const offset = new Three.Vector3(10, 2, -1);
  const cameraTargetPosition = targetPosition.clone().add(offset);
  cameraTargetPosition.x = targetPosition.x + offset.x;

  const cameraZ = model === smartphone ? cameraTargetPosition.z + 4 : cameraTargetPosition.z;

  gsap.to(camera.position, {
    x: 10,
    y: 5.03,
    z: cameraZ,
    duration: 1.5,
    ease: "power2.out",
  });
};

// Carga el modelo de los estantes
modelLoader.load("models/shelves/shelves.gltf", (gltf) => {
  shelves = gltf.scene;
  shelves.scale.set(2, 2, 2);
  shelves.position.set(0, -30, 0);
  shelves.rotation.set(0, 90 * Math.PI / 4, 0);
  scene.add(shelves);
});

// Carga el modelo del smartphone
modelLoader.load("models/smartphone/scene.gltf", (gltf) => {
  smartphone = gltf.scene;
  smartphone.scale.set(0.125, 0.125, 0.125);
  smartphone.position.set(8, 6.62, -9);
  smartphone.rotation.set(0, 90 * Math.PI / 4, 0);
  scene.add(smartphone);

  smartphone.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: smartphone };
    }
  });
});

// Carga los modelos de Samsung y Xiaomi
modelLoader.load("models/samsung/scene.gltf", (gltf) => {
  samsung = gltf.scene;
  samsung.scale.set(30, 30, 30);
  samsung.position.set(0, 3.03, 1);
  samsung.rotation.set(0, 0, 0);
  scene.add(samsung);

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

  xiaomi.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: xiaomi };
    }
  });
});

// Maneja el redimensionamiento de la ventana del navegador
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Carga una textura HDRI para usar como fondo y entorno de la escena
const hdrLoader = new RGBELoader();
hdrLoader.load('hdri/phone_shop_4k.hdr', (texture) => {
  texture.mapping = Three.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// Animación de flotación de los modelos
let floatingAnimation = null;
let lastSelectedModel = null;

const floatModel = (model) => {
  if (!model) return;

  if (lastSelectedModel && lastSelectedModel !== model) {
    gsap.killTweensOf(lastSelectedModel.position);
    lastSelectedModel.position.y = lastSelectedModel.userData.originalY;
  }

  model.userData.originalY = model.position.y;

  floatingAnimation = gsap.to(model.position, {
    y: model.position.y + 1,
    duration: 1,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });

  lastSelectedModel = model;
};

const stopFloating = (model) => {
  if (!model) return;

  gsap.killTweensOf(model.position);
  model.position.y = model.userData.originalY;
};

// Configuración de un raycaster para detectar interacciones con los modelos
const raycaster = new Three.Raycaster();
const mouse = new Three.Vector2();

const returnButton = document.querySelector('.return');

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (!returnButton.classList.contains('visible')) {
    returnButton.classList.add('visible');
  }

  for (const point of points) {
    if (point.element.classList.contains('visible')) {
      point.element.classList.remove('visible');
    }
  }

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const intersectedModel = intersects[0].object.userData.model;
    tiltCameraToModel(intersectedModel);

    if (intersectedModel === smartphone) {
      infos[0].element.classList.add('visible')
    }
    else {
      infos[0].element.classList.remove('visible')
    }

    if (intersectedModel === samsung) {
      infos[1].element.classList.add('visible')
    }
    else {
      infos[1].element.classList.remove('visible')
    }

    if (intersectedModel === xiaomi) {
      infos[2].element.classList.add('visible')
    }
    else {
      infos[2].element.classList.remove('visible')
    }

    if (lastSelectedModel === intersectedModel) {
      stopFloating(intersectedModel);
      lastSelectedModel = null;
    } else {
      floatModel(intersectedModel);
    }
  }
});

// Puntos interactivos en la escena
const infos = [
  {
    position: new Three.Vector3(8, 6.62, -9),
    element: document.querySelector('.info-0'),
    modelID: 'model_1',
    text: 'Smartphone',
  },
  {
    position: new Three.Vector3(0, 3.03, 1),
    element: document.querySelector('.info-1'),
    modelID: 'model_2',
    text: 'Samsung',
  },
  {
    position: new Three.Vector3(0, 2.55, 7),
    element: document.querySelector('.info-2'),
    modelID: 'model_3',
    text: 'Xiaomi',
  },
];

// Puntos interactivos en la escena
const points = [
  {
    position: new Three.Vector3(8, 6.62, -9),
    element: document.querySelector('.point-0'),
    modelID: 'model_1',
    text: 'Smartphone',
  },
  {
    position: new Three.Vector3(0, 3.03, 1),
    element: document.querySelector('.point-1'),
    modelID: 'model_2',
    text: 'Samsung',
  },
  {
    position: new Three.Vector3(0, 2.55, 7),
    element: document.querySelector('.point-2'),
    modelID: 'model_3',
    text: 'Xiaomi',
  },
];

let sceneReady = false
const loadingManager = new Three.LoadingManager(
    () =>    {

        window.setTimeout(() =>
        {
            sceneReady = true
        }, 2000)
    }
)

const tick = () =>{
  if(sceneReady) {
    for(const point of points)    {
      for(const point of points)    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)
        raycaster.setFromCamera(screenPosition, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)
  
        if(intersects.length === 0)   {
          point.element.classList.add('visible')
        }
        else  {
          const intersectionDistance = intersects[0].distance
          const pointDistance = point.position.distanceTo(camera.position)
          if(intersectionDistance < pointDistance)    {
            point.element.classList.remove('visible')
          }
          else  {
            point.element.classList.add('visible')
          }
        }
      }
    }
  }
}

// Configuración de la posición inicial de la cámara
const initialCameraPosition = new Three.Vector3(40, -2.8, 0);
const initialCameraRotation = new Three.Euler(0, 90 * Math.PI / 4, 0);

// Función para restablecer la cámara
const resetCameraPosition = () => {
  gsap.to(camera.position, {
    x: initialCameraPosition.x,
    y: initialCameraPosition.y,
    z: initialCameraPosition.z,
    duration: 1.5,
    ease: "power2.out",
  });

  gsap.to(camera.rotation, {
    x: initialCameraRotation.x,
    y: initialCameraRotation.y,
    z: initialCameraRotation.z,
    duration: 1.5,
    ease: "power2.out",
  });

  // Oculta el botón de retorno
  returnButton.classList.remove('visible');

  for (const point of points) {
    point.element.classList.add('visible');
  }

  for (const info of infos) {
    if (info.element.classList.contains('visible')) {
      info.element.classList.remove('visible');
    }
  }

  // Detener la animación flotante
  if (lastSelectedModel) {
    stopFloating(lastSelectedModel);
    lastSelectedModel = null;
  }
};

// Agrega el evento al botón de retorno
returnButton.addEventListener('click', resetCameraPosition);


function App() {
  loadingManager
  tick();
  renderer.render(scene, camera);
}

export default App;
