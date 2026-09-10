import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export { THREE, CANNON };
export const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9eb7c9); scene.fog=new THREE.Fog(0x9eb7c9,35,90);
export const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,150); camera.position.set(0,1.65,17);
export const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
export const controls=new PointerLockControls(camera,document.body); scene.add(controls.getObject());
export const world=new CANNON.World({gravity:new CANNON.Vec3(0,-12,0)}); world.broadphase=new CANNON.SAPBroadphase(world); world.allowSleep=true;
export const mats={wall:new THREE.MeshStandardMaterial({color:0xd8c8aa}),floor:new THREE.MeshStandardMaterial({color:0x665443}),wood:new THREE.MeshStandardMaterial({color:0x71452b}),white:new THREE.MeshStandardMaterial({color:0xe9e1d2}),red:new THREE.MeshStandardMaterial({color:0x9d3e32}),green:new THREE.MeshStandardMaterial({color:0x4c7352})};
scene.add(new THREE.HemisphereLight(0xdcecff,0x33291f,2)); const sun=new THREE.DirectionalLight(0xffffff,2.2); sun.position.set(-10,18,8); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
export function boxMesh(x,y,z,sx,sy,sz,mat,physical=true){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(physical){const b=new CANNON.Body({mass:0,shape:new CANNON.Box(new CANNON.Vec3(sx/2,sy/2,sz/2)),position:new CANNON.Vec3(x,y,z)});world.addBody(b);m.userData.body=b;}return m;}
export const keys={}; export const state={carried:null,stolen:0,gameEnded:false}; export const clock=new THREE.Clock();
export function distXZ(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
