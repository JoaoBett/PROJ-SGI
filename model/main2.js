import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

let cena = new THREE.Scene();
let carregador = new GLTFLoader();
let mixer; 
let actionOpenDrawerLeft,
  actionOpenDrawerRight,
  actionOpenDoorLeft,
  actionOpenDoorRight; 

// Criar um plano
let geometry = new THREE.PlaneGeometry(10, 10);
let material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
let plano = new THREE.Mesh(geometry, material);

// Adicione o plano à cena
cena.add(plano);

carregador.load("/model/vintageDesk.gltf", function (gltf) {
  cena.add(gltf.scene);

  let objeto3D = gltf.scene;

  // Remova o fundo preto da cena
  cena.background = null;

  cena.add(objeto3D); // Adiciona o modelo à cena
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
renderer.setSize(800, 600);
modelContainer1.appendChild(renderer.domElement);


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
    checkAnimationStatus(); // Verificar o status das animações em processo
  }

  renderer.render(cena, camara);
  delta = delta % latencia_minima;
}

let abrindo = {
    'Gaveta_L': false,
    'Gaveta_R': false,
    'Porta_L': false,
    'Porta_R': false
  }; // Armazena o estado de abertura dos objetos
  
  function toggleAnimationState(action, intersects, objeto) {
    if (intersects.length > 0 && action) {
      const objetoAberto = abrindo[objeto];
  
      if (!objetoAberto) {
        action.paused = false;
        action.reset();
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        action.timeScale = 1;
        action.play();
        abrindo[objeto] = true;
  
        if (!action._listeners.finished) {
          action._listeners.finished = function () {
            abrindo[objeto] = false;
          };
        }
      } else {
        action.paused = false;
        action.timeScale = -1;
        action.play();
        abrindo[objeto] = false;
      }
    }
  }
  
  

function checkAnimationStatus() {
  for (const objeto in abrindo) {
    if (abrindo[objeto] && actionOpenDrawerLeft.paused) {
      // Se a animação do objeto em processo está pausada, terminamos o processo
      abrindo[objeto] = false;
    }
  }
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
let objetosAbertos = {}; // Armazena o estado dos objetos abertos

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
    toggleAnimationState(actionOpenDrawerLeft, intersectsGaveta_L, 'Gaveta_L');
    toggleAnimationState(actionOpenDrawerRight, intersectsGaveta_R, 'Gaveta_R');
    toggleAnimationState(actionOpenDoorLeft, intersectsPorta_L, 'Porta_L');
    toggleAnimationState(actionOpenDoorRight, intersectsPorta_R, 'Porta_R');
  }
}

luzes(cena);
animar();
