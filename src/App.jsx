import * as Three from 'three'
import './App.css'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import gsap from 'gsap'

const width = window.innerWidth
const height = window.innerHeight

const renderer = new Three.WebGLRenderer()
renderer.setSize( width, height )
renderer.shadowMap.enabled = true
renderer.setAnimationLoop( App )
document.querySelector( 'body' ).appendChild( renderer.domElement )

const textureLoader = new Three.TextureLoader()

const modelLoader = new GLTFLoader()

const camera = new Three.PerspectiveCamera( 75, width / height, 0.1, 1000 )
camera.position.set( 40, 10 , 0 )
camera.rotation.set( 90 * Math.PI / 4, 0, 0 )

const scene = new Three.Scene()

const light = new Three.DirectionalLight(0xffffff, 10)
light.position.set( 0, 1, 0 )
light.rotation.set( 45, 45, 0 )
light.castShadow = true
scene.add( light )

const ambientLight = new Three.AmbientLight( 0xffffff )
scene.add( ambientLight )

// controls
const controls = new OrbitControls( camera, renderer.domElement )

// model shelves
let shelves
modelLoader.load( "models/shelves/shelves.gltf",
  (gltf) => {
    shelves = gltf.scene
    shelves.scale.set( 2, 2, 2 )
    shelves.position.set( 0, -30, 0 )
    shelves.rotation.set( 0, 90 * Math.PI / 4, 0 )
    scene.add( shelves )
  },
  (xhr) => {
    console.log( ( xhr.loaded / xhr.total ) * 100 + "% loaded" )
  }
)

// model smartphone
let smartphone
modelLoader.load( "models/smartphone/scene.gltf",
  (gltf) => {
    smartphone = gltf.scene
    smartphone.scale.set( 0.125, 0.125, 0.125 )
    smartphone.position.set( 8, 6.62, -9 )
    smartphone.rotation.set( 0, 90 * Math.PI / 4, 0 )
    scene.add( smartphone )
  },
  (xhr) => {
    console.log( ( xhr.loaded / xhr.total ) * 100 + "% loaded" )
  }
)

// model samsung
let samsung
modelLoader.load( "models/samsung/scene.gltf",
  (gltf) => {
    samsung = gltf.scene
    samsung.scale.set( 30, 30, 30 )
    samsung.position.set( 0, 3.03, 1 )
    samsung.rotation.set( 0, 0, 0 )
    scene.add( samsung )
  },
  (xhr) => {
    console.log( ( xhr.loaded / xhr.total ) * 100 + "% loaded" )
  }
)

// model xiaomi
let xiaomi
modelLoader.load( "models/xiaomi/scene.gltf",
  (gltf) => {
    xiaomi = gltf.scene
    xiaomi.scale.set( 40, 40, 40 )
    xiaomi.position.set( 0, 2.55, 7 )
    xiaomi.rotation.set( 0, -88.9 * Math.PI / 4, 0 )
    scene.add( xiaomi )
  },
  (xhr) => {
    console.log( ( xhr.loaded / xhr.total ) * 100 + "% loaded" )
  }
)

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
  texture.mapping = Three.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture
})

let time = Date.now()

function App() {
  const currentTime = Date.now()
  const daltaTime = currentTime - time
  time = currentTime

  renderer.render( scene, camera )
}

export default App
