import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

let cena = new THREE.Scene();
let carregador = new GLTFLoader();
let mixer; // variável para armazenar o mixer da animação
let actionOpenDrawerLeft,
  actionOpenDrawerRight,
  actionOpenDoorLeft,
  actionOpenDoorRight; // movemos estas variáveis para fora do escopo do bloco

carregador.load("vintageDesk.gltf", function (gltf) {
  cena.add(gltf.scene);

  // Encontrar a animação pelo nome
  const clipeOpenDrawerLeft = THREE.AnimationClip.findByName(
    gltf.animations,
    "Drawer_RightOpen"
  );
  const clipeOpenDrawerRight = THREE.AnimationClip.findByName(
    gltf.animations,
    "Drawer_LeftOpen"
  );
  const clipeOpenDoorRight = THREE.AnimationClip.findByName(
    gltf.animations,
    "Door_LeftOpen"
  );
  const clipeOpenDoorLeft = THREE.AnimationClip.findByName(
    gltf.animations,
    "Door_RightOpen"
  );

  // Criar mixer e controladores de animação
  mixer = new THREE.AnimationMixer(gltf.scene);
  actionOpenDrawerLeft = mixer.clipAction(clipeOpenDrawerLeft);
  actionOpenDrawerRight = mixer.clipAction(clipeOpenDrawerRight);
  actionOpenDoorLeft = mixer.clipAction(clipeOpenDoorLeft);
  actionOpenDoorRight = mixer.clipAction(clipeOpenDoorRight);
});

let camara = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camara.position.set(0, 2, 4);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let grelha = new THREE.GridHelper();
cena.add(grelha);

let eixos = new THREE.AxesHelper(3);
cena.add(eixos);

new OrbitControls(camara, renderer.domElement);

let delta = 0;
let relogio = new THREE.Clock();
let latencia_minima = 1 / 60;

function animar() {
  requestAnimationFrame(animar);
  delta += relogio.getDelta();

  if (delta < latencia_minima) return;

  if (mixer) {
    mixer.update(latencia_minima); // Atualizar o mixer
  }

  renderer.render(cena, camara);
  delta = delta % latencia_minima;
}

function luzes(cena) {
  const luzAmbiente = new THREE.AmbientLight("lightgreen");
  cena.add(luzAmbiente);

  const luzPonto = new THREE.PointLight("white");
  luzPonto.position.set(0, 2, 2);
  luzPonto.intensity = 15;
  cena.add(luzPonto);

  const luzDirecional = new THREE.DirectionalLight("white");
  luzDirecional.position.set(3, 2, 0);
  luzDirecional.intensity = 30;
  cena.add(luzDirecional);
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener("click", onClick);

function onClick(event) {
  // Calcula as coordenadas normalizadas do mouse
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Atualiza o raycaster
  raycaster.setFromCamera(mouse, camara);

  // Encontrar os objetos desejados pelos nomes
  const gaveta_L = cena.getObjectByName("Gaveta_L");
  const gaveta_R = cena.getObjectByName("Gaveta_R");
  const porta_L = cena.getObjectByName("Porta_L");
  const porta_R = cena.getObjectByName("Porta_R");

  // Verifica a interseção entre o raio e os objetos específicos
  var intersectsGaveta_L = raycaster.intersectObject(gaveta_L, true);
  var intersectsGaveta_R = raycaster.intersectObject(gaveta_R, true);
  var intersectsPorta_L = raycaster.intersectObject(porta_L, true);
  var intersectsPorta_R = raycaster.intersectObject(porta_R, true);

    if (mixer) {
      handleAnimationState(
        actionOpenDrawerLeft,
        intersectsGaveta_L,
        "Drawer_Left"
      );
      handleAnimationState(
        actionOpenDrawerRight,
        intersectsGaveta_R,
        "Drawer_Right"
      );
      handleAnimationState(actionOpenDoorLeft, intersectsPorta_L, "Door_Left");
      handleAnimationState(actionOpenDoorRight, intersectsPorta_R, "Door_Right");
    }
}

//reverses the animation
function toggleAnimationState(action, intersects) {
    if (intersects.length > 0 && action) {
      if (!action.isRunning()) {
        // If the animation is not running, toggle the direction and play
        action.paused = false;
        action.timeScale = action.timeScale === 1 ? -1 : 1;
        action.play();
      }
    }
  }
//stops the animation
function handleAnimationState(action, intersects, objectName) {
  if (intersects.length > 0 && action) {
    if (action.isRunning()) {
      // Animation is already in progress
    } else {
      // Reset and play the animation
      action.reset();
      action.play();

      // Set up an event listener for the end of the animation
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.paused = false;

      action.onLoopFinished = function (event) {
        // Animation has completed, update the flag
        window[`${objectName}Open`] = true;

        // Set a timeout to update the flag after a short delay
        setTimeout(() => {
          window[`${objectName}Open`] = false;
        }, 100); // Adjust the delay as needed
      };
    }
  }
}

luzes(cena);
animar();
