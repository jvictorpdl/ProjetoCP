import './style.css'
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' 

let camera, scene, renderer;
let controls, water, sun, tempo= 1;

const loader = new GLTFLoader();

loader.load("assets/lightHouse/scene.gltf", function (gltf){
  scene.add( gltf.scene );
  gltf.scene.scale.set(10, 10, 10)
  gltf.scene.position.set(0, 230, 0);
})

loader.load("assets/floatingIslands/scene.gltf", function (gltf){

  scene.add( gltf.scene );
  gltf.scene.scale.set(3, 3, 3)
  gltf.scene.position.set(0, 120, 0);
})

loader.load("assets/islandLP/scene.gltf", function (gltf){

  scene.add( gltf.scene );
  gltf.scene.scale.set(20, 20, 20);
  gltf.scene.position.set(1000, 36.7, 1000);
  gltf.scene.rotation.y = 20;
})
loader.load("assets/Dragon/scene.gltf", function (gltf){

  scene.add( gltf.scene );
  gltf.scene.scale.set(20, 20, 20);
  gltf.scene.position.set(0,500, 0);
  gltf.scene.rotation.y = 20;
})

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );


  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 30, 30, 100 );

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI/2;

  scene.add( water );

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  let renderTarget;

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90- parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth);

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    if ( renderTarget !== undefined ) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene( sky );

    scene.environment = renderTarget.texture;

  }

  updateSun();

  controls = new OrbitControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set( 0, 10, 0 );
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  requestAnimationFrame( animate );

  tempo+= 0.05;
  water.position.y = Math.sin(tempo);
  
  render();

}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

  renderer.render( scene, camera );

}

const light = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( light );