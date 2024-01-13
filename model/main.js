import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

let cena = new THREE.Scene();
let carregador = new GLTFLoader();
let mixer;

let gaveta_direita_action = 0;
let gaveta_esquerda_action = 0;
let porta_direita_action = 0;
let porta_esquerda_action = 0;

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
camara.position.set(0, 5, 10);

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
    carregador.load(modelURL, function (gltf) {
      cena.add(gltf.scene);
      mixer = new THREE.AnimationMixer(gltf.scene);
      modelContainer1.appendChild(renderer.domElement);
      cena.background = new THREE.Color(0xffffff);

      const gaveta_direita = THREE.AnimationClip.findByName(gltf.animations, "Drawer_RightOpen");
      const gaveta_esquerda = THREE.AnimationClip.findByName(gltf.animations, "Drawer_LeftOpen");
      const porta_direita = THREE.AnimationClip.findByName(gltf.animations, "Door_LeftOpen");
      const porta_esquerda = THREE.AnimationClip.findByName(gltf.animations, "Door_RightOpen");

      gaveta_direita_action = mixer.clipAction(gaveta_direita);
      gaveta_esquerda_action = mixer.clipAction(gaveta_esquerda);
      porta_direita_action = mixer.clipAction(porta_direita);
      porta_esquerda_action = mixer.clipAction(porta_esquerda);

      porta_direita_action.setLoop(THREE.LoopOnce);
      porta_esquerda_action.setLoop(THREE.LoopOnce);
      gaveta_direita_action.setLoop(THREE.LoopOnce);
      gaveta_esquerda_action.setLoop(THREE.LoopOnce);
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
    btnDefault.addEventListener('click', function () {
      loadModelByOption('default');
    });
  }

  if (btnOption1) {
    btnOption1.addEventListener('click', function () {
      loadModelByOption('option1');
    });
  }

  if (btnOption2) {
    btnOption2.addEventListener('click', function () {
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

  const fechar_portas = document.getElementById('fechar-portas');
  fechar_portas.addEventListener('click', () => {
    // Adicionar um evento de termino de animação para cada ação
    porta_direita_action.clampWhenFinished = true;
    porta_direita_action.reset();
    porta_direita_action.stop();

    porta_esquerda_action.clampWhenFinished = true;
    porta_esquerda_action.reset();
    porta_esquerda_action.stop();
    // Verificar se a animação foi encontrada antes de acessar a propriedade isRunning
    if (porta_direita_action && porta_esquerda_action) {
      const isPortaDireitaRunning = porta_direita_action.isRunning();
      const isPortaEsquerdaRunning = porta_esquerda_action.isRunning();

      // Reiniciar e reproduzir ambas as animações se não estiverem em execução
      if (!isPortaDireitaRunning && !isPortaEsquerdaRunning) {
        porta_direita_action.reset().play() - 1;
        porta_esquerda_action.reset().play() - 1;
        porta_direita_action.stop();
        porta_esquerda_action.stop();
      }
    }
  });
  const portas = document.getElementById('portas');
  portas.addEventListener('click', () => {
    // Adicionar um evento de termino de animação para cada ação
    porta_direita_action.clampWhenFinished = true;
    porta_direita_action.reset();
    porta_direita_action.stop();

    porta_esquerda_action.clampWhenFinished = true;
    porta_esquerda_action.reset();
    porta_esquerda_action.stop();
    // Verificar se a animação foi encontrada antes de acessar a propriedade isRunning
    if (porta_direita_action && porta_esquerda_action) {
      const isPortaDireitaRunning = porta_direita_action.isRunning();
      const isPortaEsquerdaRunning = porta_esquerda_action.isRunning();

      // Reiniciar e reproduzir ambas as animações se não estiverem em execução
      if (!isPortaDireitaRunning && !isPortaEsquerdaRunning) {
        porta_direita_action.reset().play();
        porta_esquerda_action.reset().play();
      }
    }
  });

  const fechar_gavetas = document.getElementById('fechar-gavetas');
  fechar_gavetas.addEventListener('click', () => {
    // Adicionar um evento de termino de animação para cada ação
    gaveta_direita_action.clampWhenFinished = true;
    gaveta_direita_action.reset();
    gaveta_direita_action.stop();

    gaveta_esquerda_action.clampWhenFinished = true;
    gaveta_esquerda_action.reset();
    gaveta_esquerda_action.stop();
    // Verificar se a animação foi encontrada antes de acessar a propriedade isRunning
    if (gaveta_direita_action && gaveta_esquerda_action) {
      const isGavetaDireitaRunning = gaveta_direita_action.isRunning();
      const isGavetaEsquerdaRunning = gaveta_esquerda_action.isRunning();

      // Reiniciar e reproduzir ambas as animações se não estiverem em execução
      if (!isGavetaDireitaRunning && !isGavetaEsquerdaRunning) {
        gaveta_direita_action.reset().play() - 1;
        gaveta_esquerda_action.reset().play() - 1;
        gaveta_direita_action.stop();
        gaveta_esquerda_action.stop();
      }
    }
  });

  const gavetas = document.getElementById('gavetas');
  gavetas.addEventListener('click', () => {
    // Adicionar um evento de termino de animação para cada ação
    gaveta_direita_action.clampWhenFinished = true;
    gaveta_direita_action.reset();
    gaveta_direita_action.stop();

    gaveta_esquerda_action.clampWhenFinished = true;
    gaveta_esquerda_action.reset();
    gaveta_esquerda_action.stop();
    // Verificar se a animação foi encontrada antes de acessar a propriedade isRunning
    if (gaveta_direita_action && gaveta_esquerda_action) {
      const isGavetaDireitaRunning = gaveta_direita_action.isRunning();
      const isGavetaEsquerdaRunning = gaveta_esquerda_action.isRunning();

      // Reiniciar e reproduzir ambas as animações se não estiverem em execução
      if (!isGavetaDireitaRunning && !isGavetaEsquerdaRunning) {
        gaveta_direita_action.reset().play();
        gaveta_esquerda_action.reset().play();
      }
    }
  });



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


