import * as Three from 'three' // Importa la biblioteca Three.js para trabajar con gráficos 3D
import './App.css' // Importa los estilos CSS de la aplicación
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader" // Cargador para modelos GLTF (formato 3D)
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js' // Cargador para texturas HDRI
import gsap from 'gsap' // Biblioteca para animaciones

// Configuración inicial del tamaño del renderizador
const width = window.innerWidth
const height = window.innerHeight

// Configuración del renderizador WebGL
const renderer = new Three.WebGLRenderer()
renderer.setSize(width, height) // Ajusta el tamaño del renderizador al tamaño de la ventana
renderer.shadowMap.enabled = true // Habilita las sombras en la escena
renderer.setAnimationLoop(App) // Configura el bucle de animación para la aplicación
document.querySelector('body').appendChild(renderer.domElement) // Agrega el renderizador al DOM

// Inicializa el cargador de modelos GLTF
const modelLoader = new GLTFLoader()

// Configuración de la cámara
const camera = new Three.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.position.set(40, -2.8, 0) // Establece la posición inicial de la cámara
camera.rotation.set(0, 90 * Math.PI / 4, 0) // Establece la rotación inicial de la cámara

// Crea la escena 3D
const scene = new Three.Scene()

// Configuración de la iluminación
const light = new Three.DirectionalLight(0xffffff, 10) // Luz direccional blanca con intensidad 10
light.position.set(0, 1, 0) // Posiciona la luz
light.rotation.set(45, 45, 0) // Establece la rotación de la luz
light.castShadow = true // Habilita la capacidad de la luz de generar sombras
scene.add(light) // Agrega la luz a la escena

const ambientLight = new Three.AmbientLight(0xffffff) // Luz ambiental (ilumina la escena sin dirección)
scene.add(ambientLight) // Agrega la luz ambiental a la escena

// Declaración de referencias para los modelos 3D que se van a cargar
let shelves, smartphone, samsung, xiaomi

// Función auxiliar para mover la cámara hacia un modelo específico
const tiltCameraToModel = (model) => {
  if (!model) return

  const targetPosition = new Three.Vector3()
  model.getWorldPosition(targetPosition) // Obtiene la posición mundial del modelo

  // Calcula un desplazamiento para ajustar la vista de la cámara
  const offset = new Three.Vector3(10, 2, -1)
  const cameraTargetPosition = targetPosition.clone().add(offset)
  cameraTargetPosition.x = targetPosition.x + offset.x // Ajusta la posición X de la cámara

  // Si el modelo es el smartphone, ajusta la posición Z de la cámara
  const cameraZ = model === smartphone ? cameraTargetPosition.z + 4 : cameraTargetPosition.z

  // Anima la posición de la cámara usando GSAP
  gsap.to(camera.position, {
    x: 10,
    y: 5.03,
    z: cameraZ,
    duration: 1.5,
    ease: "power2.out"
  })
}

// Carga el modelo de los estantes
modelLoader.load("models/shelves/shelves.gltf", (gltf) => {
  shelves = gltf.scene // Asigna el modelo de los estantes a la variable
  shelves.scale.set(2, 2, 2) // Ajusta la escala del modelo
  shelves.position.set(0, -30, 0) // Posiciona el modelo
  shelves.rotation.set(0, 90 * Math.PI / 4, 0) // Establece la rotación inicial
  scene.add(shelves) // Agrega el modelo a la escena
})

// Carga el modelo del smartphone
modelLoader.load("models/smartphone/scene.gltf", (gltf) => {
  smartphone = gltf.scene // Asigna el modelo del smartphone a la variable
  smartphone.scale.set(0.125, 0.125, 0.125) // Ajusta la escala del modelo
  smartphone.position.set(8, 6.62, -9) // Posiciona el modelo en la escena
  smartphone.rotation.set(0, 90 * Math.PI / 4, 0) // Establece la rotación inicial
  scene.add(smartphone) // Agrega el modelo a la escena

  // Asocia eventos de clic con el modelo
  smartphone.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: smartphone }
    }
  })
})

// Carga los modelos de Samsung y Xiaomi
modelLoader.load("models/samsung/scene.gltf", (gltf) => {
  samsung = gltf.scene // Asigna el modelo de Samsung a la variable
  samsung.scale.set(30, 30, 30) // Ajusta la escala
  samsung.position.set(0, 3.03, 1) // Posiciona el modelo
  samsung.rotation.set(0, 0, 0) // Establece la rotación
  scene.add(samsung) // Agrega el modelo a la escena

  samsung.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: samsung }
    }
  })
})

modelLoader.load("models/xiaomi/scene.gltf", (gltf) => {
  xiaomi = gltf.scene // Asigna el modelo de Xiaomi a la variable
  xiaomi.scale.set(40, 40, 40) // Ajusta la escala
  xiaomi.position.set(0, 2.55, 7) // Posiciona el modelo
  xiaomi.rotation.set(0, -88.9 * Math.PI / 4, 0) // Establece la rotación
  scene.add(xiaomi) // Agrega el modelo a la escena

  xiaomi.traverse((child) => {
    if (child.isMesh) {
      child.userData = { model: xiaomi }
    }
  })
})

// Maneja el redimensionamiento de la ventana del navegador
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight

  renderer.setSize(width, height) // Ajusta el tamaño del renderizador
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Ajusta el ratio de píxeles

  camera.aspect = width / height // Ajusta la relación de aspecto de la cámara
  camera.updateProjectionMatrix() // Actualiza la matriz de proyección de la cámara
})

// Carga una textura HDRI para usar como fondo y entorno de la escena
const hdrLoader = new RGBELoader()
hdrLoader.load('hdri/phone_shop_4k.hdr', (texture) => {
  texture.mapping = Three.EquirectangularReflectionMapping // Aplica mapeo equirectangular
  scene.background = texture // Establece la textura como fondo
  scene.environment = texture // Configura la textura como entorno
})

// Animación de flotación de los modelos
let floatingAnimation = null
let lastSelectedModel = null // Guarda el último modelo flotante

// Función para hacer flotar un modelo
const floatModel = (model) => {
  if (!model) return

  if (lastSelectedModel && lastSelectedModel !== model) {
    gsap.killTweensOf(lastSelectedModel.position) // Detiene la animación del modelo anterior
    lastSelectedModel.position.y = lastSelectedModel.userData.originalY // Restaura la posición original
  }

  model.userData.originalY = model.position.y // Guarda la posición original del modelo

  floatingAnimation = gsap.to(model.position, {
    y: model.position.y + 1, // Hace que el modelo suba
    duration: 1, // Duración de la animación
    yoyo: true, // Hace que el modelo vuelva a su posición original
    repeat: -1, // Repite la animación indefinidamente
    ease: "sine.inOut" // Efecto de suavizado
  })

  lastSelectedModel = model // Guarda el modelo actual
}

// Detiene la animación de flotación y restaura la posición
const stopFloating = (model) => {
  if (!model) return

  gsap.killTweensOf(model.position) // Detiene la animación
  model.position.y = model.userData.originalY // Restaura la posición original
}

// Configuración de un raycaster para detectar interacciones con los modelos
const raycaster = new Three.Raycaster()
const mouse = new Three.Vector2()

// Evento de clic para interactuar con los modelos
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1 // Normaliza la posición X del mouse
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1 // Normaliza la posición Y del mouse

  raycaster.setFromCamera(mouse, camera) // Actualiza el raycaster según la posición del mouse

  const intersects = raycaster.intersectObjects(scene.children, true) // Detecta los modelos que el rayo intersecta
  if (intersects.length > 0) {
    const intersectedModel = intersects[0].object.userData.model // Obtiene el modelo que fue tocado
    tiltCameraToModel(intersectedModel) // Mueve la cámara hacia el modelo tocado

    if (lastSelectedModel === intersectedModel) {
      stopFloating(intersectedModel) // Detiene la animación de flotación si el modelo ya está flotando
      lastSelectedModel = null // Desmarca el modelo
    } else {
      floatModel(intersectedModel) // Inicia la flotación del modelo
    }
  }
})

// Variables de tiempo para la animación
let time = Date.now()

// Puntos interactivos en la escena
const points = [
  {
    position: new Three.Vector3(8, 6.62, -9),
    element: document.querySelector('.point-0')
  },
  {
    position: new Three.Vector3(0, 3.03, 1),
    element: document.querySelector('.point-1')
  },
  {
    position: new Three.Vector3(0, 2.55, 7),
    element: document.querySelector('.point-2')
  }
]

let sceneReady = false
const loadingManager = new Three.LoadingManager(
  // Al cargar todos los recursos
  () => {
    window.setTimeout(() => {
      sceneReady = true // Marca la escena como lista para ser renderizada
    }, 2000)
  }
)

// Función principal del bucle de animación
const tick = () => {
  if(sceneReady) {
    // Actualiza la posición de los puntos interactivos
    for(const point of points) {
      const screenPosition = point.position.clone()
      screenPosition.project(camera) // Convierte la posición 3D del punto a 2D

      // Calcula las coordenadas en píxeles para la pantalla
      const translateX = screenPosition.x * sizes.width * 0.5
      const translateY = screenPosition.y * sizes.height * 0.5

      // Actualiza la posición en pantalla del elemento
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`

      // Configura el raycaster para detectar interacciones con los modelos
      raycaster.setFromCamera(screenPosition, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      // Si el punto no está siendo cubierto por ningún modelo, lo muestra
      if(intersects.length === 0) {
        point.element.classList.add('visible')
      } else {
        // Si el punto está cubierto por un modelo, ocúltalo
        const intersectionDistance = intersects[0].distance
        const pointDistance = point.position.distanceTo(camera.position)

        if(intersectionDistance < pointDistance) {
          point.element.classList.remove('visible')
        } else {
          point.element.classList.add('visible')
        }
      }
    }
  }
}

// Función principal de renderizado
function App() {
  const currentTime = Date.now()
  const deltaTime = currentTime - time
  time = currentTime

  tick()

  renderer.render(scene, camera) // Renderiza la escena y la cámara
}

export default App
