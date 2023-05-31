const search = () => {
  const searchInput = document
    .getElementById("search-input")
    .value.toUpperCase();
  const productList = document.getElementById("product-list");
  const product = document.querySelectorAll(".card");
  const productName = document.getElementsByTagName("a");

  for (var i = 0; i < productName.length; i++) {
    let match = product[i].getElementsByTagName("a")[1];
    if (match) {
      let searchValue = match.textContent || match.innerHTML;
      if (searchValue.toUpperCase().indexOf(searchInput) > -1) {
        product[i].style.display = "";
      } else {
        product[i].style.display = "none";
      }
    }
  }
};

import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";

let camera, scene, renderer;
let reticle;
let controller;
let model;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotationSpeed = 0.02;

init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    40
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // we have to enable the renderer for webxr
  container.appendChild(renderer.domElement);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5);
  scene.add(directionalLight);

  addReticle();
  addModel();
  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  // var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 4);
  // light.position.set(0.5, 1, 0.25);
  // scene.add(light);

  // const light = new THREE.AmbientLight(0x404040, 15); // soft white light
  // scene.add(light);

  const button = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
  });
  document.body.appendChild(button);
  renderer.domElement.style.display = "none";

  window.addEventListener("resize", onWindowResize, false);

  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
  document.addEventListener("mousemove", onMouseMove, false);

  document.addEventListener("touchstart", onTouchStart, false);
  document.addEventListener("touchend", onTouchEnd, false);
  document.addEventListener("touchmove", onTouchMove, false);
}
function onMouseDown(event) {
  event.preventDefault();
  mouseDown = true;
  // lastMouseY = event.clientY;
  lastMouseX = event.clientX;
}

function onMouseUp(event) {
  event.preventDefault();
  mouseDown = false;
}

function onMouseMove(event) {
  event.preventDefault();
  if (!mouseDown) return;
  // var deltaY = event.clientY - lastMouseY;
  let deltaX = event.clientX - lastMouseX;

  // model.rotation.x += deltaY * rotationSpeed;
  model.rotation.y += deltaX * rotationSpeed;

  // lastMouseY = event.clientY;
  lastMouseX = event.clientX;
}
function onTouchStart(event) {
  event.preventDefault();
  mouseDown = true;
  lastMouseX = event.touches[0].clientX;
}

function onTouchEnd(event) {
  event.preventDefault();
  mouseDown = false;
}

function onTouchMove(event) {
  event.preventDefault();
  if (!mouseDown) return;

  var deltaX = event.touches[0].clientX - lastMouseX;
  model.rotation.y += deltaX * rotationSpeed;

  lastMouseX = event.touches[0].clientX;
}
function addReticle() {
  const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  );
  const material = new THREE.MeshBasicMaterial();
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}
async function addModel() {
  const modelUrl = "armchair/scene.gltf";
  const loader = new THREE.GLTFLoader();
  const gltf = await loader.loadAsync(modelUrl);
  model = gltf.scene;
  model.scale.multiplyScalar(2);
  model.visible = false;
  scene.add(model);
}

function onSelect() {
  console.log("clicked");
  if (reticle.visible && model) {
    model.visible = true;
    model.position.setFromMatrixPosition(reticle.matrix);
    model.quaternion.setFromRotationMatrix(reticle.matrix);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
  const session = renderer.xr.getSession();
  const viewerSpace = await session.requestReferenceSpace("viewer");
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
  console.log(hitTestSource);

  localSpace = await session.requestReferenceSpace("local");
  console.log(localSpace);

  hitTestSourceInitialized = true;

  session.addEventListener("end", () => {
    hitTestSourceInitialized = false;
    hitTestSource = null;
  });
}

function render(timestamp, frame) {
  if (frame) {
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    }
    if (hitTestSourceInitialized) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      // console.log(hitTestResults);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localSpace);
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }

    renderer.render(scene, camera);
  }
}
