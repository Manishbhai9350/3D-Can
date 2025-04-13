import "./style.css";
import * as Three from "three";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis();
gsap.ticker.add((t) => {
  lenis.raf(t * 1000);
});
gsap.ticker.lagSmoothing(0);
lenis.on("scroll", ScrollTrigger.update);

const { Scene, Mesh, PerspectiveCamera, WebGLRenderer } = Three;

const CanCon = document.querySelector(".can-container");
const canvas = CanCon.querySelector("canvas");
const CanConRect = CanCon.getBoundingClientRect();

canvas.width = CanConRect.width;
canvas.height = CanConRect.height;

const scene = new Scene();

const Renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
Renderer.setSize(CanConRect.width, CanConRect.height);
Renderer.shadowMap.enabled = true;

const Camera = new PerspectiveCamera(
  70,
  CanConRect.width / CanConRect.height,
  0.1,
  1000
);
Camera.position.z = 5;
scene.add(Camera);

// Adding Lights

const ambLight = new Three.AmbientLight(0xffffff, 6);
scene.add(ambLight);

const dirLight = new Three.DirectionalLight(0xffffff, 5);
dirLight.position.set(-5, 2, 4);
scene.add(dirLight);

const hemiLight = new Three.HemisphereLight(0xf39f9f, 0xffffff, 5);
hemiLight.position.set(0, 2, 0);
scene.add(hemiLight);

const frontLight = new Three.DirectionalLight(0xffffff, 10);
frontLight.position.set(0, 0, 2);
scene.add(frontLight);

const bottomLight = new Three.DirectionalLight(0xffffff, 5);
frontLight.position.set(0, -2, 4);
scene.add(frontLight);

document.querySelector('.enter-btn').addEventListener('click',e => {
  gsap.to('.loader',{
    clipPath:'polygon(0% 0%,100% 0%,100% 0%,0% 0%)',
    duration:.6,
    onComplete:() => {
        document.querySelector('.loader').style.display = 'none'
        document.querySelector('html').style.overflow = 'auto'
        document.body.style.overflow = 'auto'
        document.querySelector('html').style.height = 'auto'
        document.body.style.height = 'auto'
    }
  })
})

const LoadManager = new Three.LoadingManager(
  () => {
    // Loaded
    gsap.to('.loader .line',{display:'none',onComplete:() => gsap.to('.loader .enter-btn',{display:'block'})})
    
  },
  (url,loaded,total) =>{
    // Loading Progress
    const Progress = loaded / total 
    gsap.to('.line-filler',{scaleX:Progress})
  },
  () =>{

  }
)
const GLBLoader = new GLTFLoader(LoadManager);

let Can;
let scanned = false;
const ScanAudio = new Audio('/scan-sfx.mp3')

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate(e) {
    const { progress } = e;
    if (Can) {
      gsap.set(Can.rotation, {
        x: 2 * Math.PI * progress,
      });
    }
  },
});

ScrollTrigger.create({
  trigger: ".scanner",
  start: "top 10%",
  end: `+=${innerHeight * 0.1}`,
  scrub: true,
  onUpdate(e) {
    const { progress } = e;
    gsap.to(".scan-bar", {
      opacity: progress,
    });
  },
});
ScrollTrigger.create({
  trigger: ".scanner",
  start: "top -5%",
  end: `+=${innerHeight * 1}`,
  scrub: true,
  onUpdate(e) {
    const { progress } = e;
    if (Can) {
      gsap.set(Can.rotation, {
        y: 2 * Math.PI * progress,
      });

      let scanOffsetProg = .4
      if (!scanned && progress > scanOffsetProg) {
        gsap.to('.scan-code',{
            bottom:-31
        })
        scanned = true;
        ScanAudio.play();
        return;
    } 
    if(scanned && progress < scanOffsetProg){
        gsap.to('.scan-code',{
            bottom:0
        })
        scanned = false;
        return;
    }
    }
  },
});
ScrollTrigger.create({
  trigger: ".scanner",
  start: "top -100%",
  end: `+=${innerHeight}`,
  scrub: true,
  onUpdate(e) {
    let { progress } = e;
    gsap.set(".scan-bar", {
      opacity: 1 - progress * 2,
    });
    if (Can) {
      gsap.to(Can.position, {
        x: progress * -15,
        duration:.1
      });
      gsap.to(Can.rotation, {
        z: -progress,
        duration:.1
      });
    //   gsap.to(Can.scale, {
    //     x: 1 - progress,
    //     y: 1 - progress,
    //     z: 1 - progress,
    //     duration:.1
    //   });
    }
  },
});
ScrollTrigger.create({
  trigger: ".scanner",
  start: "top top",
  end: "bottom -50%",
  scrub: true,
  pin: true,
});

GLBLoader.load("/can.glb", (gltf) => {
  Can = gltf.scene;
  Can.traverse((node) => {
    if (node.isObject3D) {
      if (node.material) {
        node.material.metallness = 0.7;
        node.material.roughness = 0.5;
      }
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  scene.add(Can);
});

function tick(t) {
  Renderer.render(scene, Camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function Resize() {
  const { width, height } = CanCon.getBoundingClientRect();
  Renderer.setSize(width, height);
  Camera.aspect = width / height;
  Camera.updateProjectionMatrix();
}
window.addEventListener("resize", Resize);
