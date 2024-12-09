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
camera.position.set( 40, 20 , 0 )
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
let model
modelLoader.load( "models/shelves/shelves.gltf",
  (gltf) => {
    model = gltf.scene
    model.scale.set( 2, 2, 2 )
    model.position.set( 0, -30, 0 )
    model.rotation.set( 0, 90 * Math.PI / 4, 0 )
    scene.add( model )
    // carregat
  },
  (xhr) => {
    console.log( ( xhr.loaded / xhr.total ) * 100 + "% loaded" )
    // cada iteracio
  },
  (error) => {
    // error
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

  if (model) {
  }

  renderer.render( scene, camera )
}

export default App
