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
let geometry = new THREE.PlaneGeometry(10, 20);
let material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
let plano = new THREE.Mesh(geometry, material);

// Adicionar o plano à cena
cena.add(plano);

let camara = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.10,
  2000
);
camara.position.set(0, 8, 3);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(900, 800);


document.addEventListener("DOMContentLoaded", function () {
  const modelContainer1 = document.getElementById("modelContainer1");

  function hideImages() {
    const imageContainer = document.getElementById('imageContainer');
    if (imageContainer) {
      imageContainer.style.display = 'none';
    }
  }
  
  function loadModel(modelURL) {
    carregador.load(modelURL, function(gltf) {
      cena.add(gltf.scene);
      modelContainer1.appendChild(renderer.domElement);
      cena.background = new THREE.Color(0xffffff); 
    });
  }
  
  function loadModelByOption(option) {
    hideImages();
    modelContainer1.style.display = 'block';
    modelContainer1.innerHTML = '';
    
    switch (option) {
      case 'default':
        loadModel('/model/modelo/vintageDesk.gltf');
        break;
      case 'option1':
        loadModel('/model/ModeloBrown/vintageDesk.gltf');
        break;
      case 'option2':
        loadModel('/model/ModeloGray/vintageDesk.gltf');
        break;
      default:
        break;
    }
  }
  
  const btnDefault = document.getElementById("default");
  const btnOption1 = document.getElementById("option1");
  const btnOption2 = document.getElementById("option2");
  
  if (btnDefault) {
    btnDefault.addEventListener('click', function() {
      loadModelByOption('default');
    });
  }
  
  if (btnOption1) {
    btnOption1.addEventListener('click', function() {
      loadModelByOption('option1');
    });
  }
  
  if (btnOption2) {
    btnOption2.addEventListener('click', function() {
      loadModelByOption('option2');
    });
  }



  new OrbitControls(camara, renderer.domElement);

  let delta = 0;
  let relogio = new THREE.Clock();
  let latencia_minima = 1 / 60;

  function animar() {
    requestAnimationFrame(animar);
    delta += relogio.getDelta();

    if (delta < latencia_minima) return;

    if (mixer) {
      mixer.update(latencia_minima);
      checkAnimationStatus();
    }

    renderer.render(cena, camara);
    delta = delta % latencia_minima;
  }


let abrindo = {
  Gaveta_L: false,
  Gaveta_R: false,
  Porta_L: false,
  Porta_R: false,
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
  luzPonto.intensity = 5;
  cena.add(luzPonto);

  const luzDirecional = new THREE.DirectionalLight("white");
  luzDirecional.position.set(3, 2, 0);
  luzDirecional.intensity = 5;
  cena.add(luzDirecional);
}

luzes(cena);
animar();
});