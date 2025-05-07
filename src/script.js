import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { Sky } from 'three/examples/jsm/Addons.js';
import fireWorksVertexShader from './shaders/fireWorks/vertex.glsl';
import fireWorksFragmentShader from './shaders/fireWorks/fragment.glsl';
import flagVertexShader from './shaders/flag/vertex.glsl';
import flagFragmentShader from './shaders/flag/fragment.glsl';


/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
gui.close();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

const starFleet = textureLoader.load('/textures/MrMoore.jpg');


/**
 * Sizes
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
    sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);
    
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
})
    
/**
 * Camera
*/
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-1, 0, 3.5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// Audio
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();

const initAudio = () => {
    // Resume the AudioContext (required by browser)
    if (THREE.AudioContext.getContext().state === 'suspended') {
        THREE.AudioContext.getContext().resume();
        
    }

    audioLoader.load( '/music/groove-on-the-edge-jazz-funk-instrumental-305429.mp3', (buffer) => {
        sound.setBuffer( buffer );
        sound.setVolume(2);
        sound.play();
    });
};

window.addEventListener('click', () => {
    initAudio();
}, { once: true }); 

window.addEventListener('touchstart', () => {
    initAudio();
}, { once: true }); 

   
   /**
    * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
    
    // abmeint light for flag
    const ambientLight = new THREE.AmbientLight('#ffffff', 2);
    scene.add(ambientLight);
    
    /**
     * Flag pole
    */
// TODO: rethink adding a flagpole

/**
 * Flag
 */
// Geometry
const flagGeometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const count = flagGeometry.attributes.position.count;
const random = new Float32Array(count);

for (let i = 0; i < count; i++) {

    random[i] = Math.random();
};

flagGeometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));

const flagParameters = {};
flagParameters.maxHeight = 1.3;

// Material
const flagMaterial = new THREE.RawShaderMaterial({
    vertexShader: flagVertexShader,
    fragmentShader: flagFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
        uFrequency:new THREE.Uniform(new THREE.Vector2(10, 5)),
        uTime:new THREE.Uniform(0),
        uColor:new THREE.Uniform(new THREE.Color('orange')),
        uTexture:new THREE.Uniform(starFleet),
        uMaxHeight: new THREE.Uniform(flagParameters.maxHeight),
    }, 
});

const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.scale.y = 3/4;
flag.position.set(0, -1.3, 0);
scene.add(flag);



/**
 * FireWorks
*/
const textures = [
    textureLoader.load('./particles/1.png'),
    textureLoader.load('./particles/2.png'),
    textureLoader.load('./particles/3.png'),
    textureLoader.load('./particles/4.png'),
    textureLoader.load('./particles/5.png'),
    textureLoader.load('./particles/6.png'),
    textureLoader.load('./particles/7.png'),
    textureLoader.load('./particles/8.png'),
];

const createFirework = (count, position, size, texture, radius, color) => {

    const positionArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);
    const timeMultipliersArray = new Float32Array(count);
    

    for(let i = 0; i < count; i++) {

        const i3 = i * 3;

        const shperical = new THREE.Spherical(
            radius * (0.75 + Math.random() * 0.25), 
            Math.random() * Math.PI, 
            Math.random() * Math.PI * 2
        );
        const position = new THREE.Vector3();
        position.setFromSpherical(shperical);

        positionArray[i3 + 0] = position.x;
        positionArray[i3 + 1] = position.y;
        positionArray[i3 + 2] = position.z;

        sizeArray[i] = Math.random();

        timeMultipliersArray[i] = 1 + Math.random();
    };

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(positionArray, 1));
    geometry.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliersArray, 1));

    texture.flipY = false;
    const material = new THREE.ShaderMaterial({
        vertexShader: fireWorksVertexShader,
        fragmentShader: fireWorksFragmentShader,
        uniforms: 
        {
            uSize:  new THREE.Uniform(size),
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0),
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    // Points
    const fireWork = new THREE.Points(geometry, material);
    fireWork.position.copy(position);
    scene.add(fireWork);

    // Destroy
    const destroy = () => {
        scene.remove(fireWork);
        geometry.dispose();
        material.dispose();
    }

    
    // Animate
    gsap.to(
        material.uniforms.uProgress,
        { value: 1, duration: 3, ease: 'linear', onComplete: destroy}
    )
};

const createRandomFirework = () => {

    const count = Math.round(400 + Math.random() * 1000);
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2, //x
        Math.random(),             //y
        (Math.random() - 0.5) * 2  //z
    );
    const size = 0.1 + Math.random() * 0.1;
    const texture = textures[Math.floor(Math.random() * textures.length)];
    const radius = Math.random() + 0.5;
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.7);

    createFirework(count, position, size, texture, radius, color);
};

createRandomFirework();


window.addEventListener('click', createRandomFirework);

/**
 * Sky
 */

const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );

const sun = new THREE.Vector3();



/// GUI

const skyParameters = {
    turbidity: 6.2,
    rayleigh: 2.267,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.389,
    elevation: -1.67,
    azimuth: 175,
    exposure: renderer.toneMappingExposure
};

function updateSky() {

    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = skyParameters.turbidity;
    uniforms[ 'rayleigh' ].value = skyParameters.rayleigh;
    uniforms[ 'mieCoefficient' ].value = skyParameters.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = skyParameters.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - skyParameters.elevation );
    const theta = THREE.MathUtils.degToRad( skyParameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    renderer.toneMappingExposure = skyParameters.exposure;
    renderer.render( scene, camera );

};


gui.add( skyParameters, 'turbidity', 0.0, 20.0, 0.1 ).onChange( updateSky );
gui.add( skyParameters, 'rayleigh', 0.0, 4, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'elevation', -3, 10, 0.01 ).onChange( updateSky );
gui.add( skyParameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSky );
gui.add( skyParameters, 'exposure', 0, 1, 0.0001 ).onChange( updateSky );

updateSky();

/**
 * Animate
 */
const clock = new THREE.Clock();

let lastFireworkTime = 0;
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // update material
    flagMaterial.uniforms.uTime.value = elapsedTime;

    // initial fireworks
    if (elapsedTime < 25 && elapsedTime - lastFireworkTime >= 1) {
        createRandomFirework();
        lastFireworkTime = elapsedTime;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();