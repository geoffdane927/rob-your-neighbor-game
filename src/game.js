import { THREE, camera, renderer, world, controls, state, keys, clock } from './core.js';
import { createHouse, doors, updateDoors, isBlocked } from './world.js';
import { furniture, interactFurniture, throwSelected, updateFurniture, checkDelivery, selectSlot } from './furniture.js';
import { neighbor, updateNeighbor } from './neighbor.js';

createHouse();
document.getElementById('total').textContent=furniture.length;
globalThis.__playerPosition=()=>controls.getObject().position;
globalThis.__furniture=()=>furniture;
globalThis.neighborAI=neighbor;

addEventListener('keydown',e=>{
 if(keys[e.code])return; keys[e.code]=true;
 if(e.code.startsWith('Digit')){const n=Number(e.code.slice(5));if(n>=1&&n<=4)selectSlot(n-1);}
 if(e.code==='KeyE')interactFurniture();
 if(e.code==='KeyQ')throwSelected();
 if(e.code==='KeyF')doorInteract();
});
addEventListener('keyup',e=>keys[e.code]=false);
document.body.addEventListener('click',()=>{if(!controls.isLocked)controls.lock();});

function doorInteract(){
 const p=controls.getObject().position;let best=null,bd=3;
 for(const d of doors){const dd=Math.hypot(p.x-d.position.x,p.z-d.position.z);if(dd<bd){bd=dd;best=d;}}
 if(best){best.userData.open=!best.userData.open;best.userData.target=best.userData.open?1:0;neighbor.hear(best.position,12);}
}
function tryMove(p,dx,dz){
 const r=.45; let moved=false;
 if(!isBlocked(p.x+dx,p.z,r)){p.x+=dx;moved=true;}
 if(!isBlocked(p.x,p.z+dz,r)){p.z+=dz;moved=true;}
 return moved;
}
function updatePlayer(dt){
 if(state.gameEnded)return;
 const p=controls.getObject().position;
 let forward=(keys.KeyW?1:0)-(keys.KeyS?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0);
 const sprint=keys.ShiftLeft||keys.ShiftRight,speed=sprint?7:3.8;
 const v=new THREE.Vector3(side,0,-forward);
 if(v.lengthSq()){
   v.normalize().applyQuaternion(camera.quaternion);v.y=0;v.normalize();
   const moved=tryMove(p,v.x*speed*dt,v.z*speed*dt);
   if(sprint&&moved)neighbor.hear(p,3.2);
 }
 p.x=Math.max(-21.8,Math.min(21.8,p.x));p.z=Math.max(-18.8,Math.min(18.8,p.z));p.y=1.65;
}
function endGame(){state.gameEnded=true;document.getElementById('gameover').style.display='flex';controls.unlock();}
function animate(){requestAnimationFrame(animate);const dt=Math.min(.033,clock.getDelta());updatePlayer(dt);world.step(1/60,dt,3);updateFurniture();updateDoors(dt);updateNeighbor(dt,endGame);checkDelivery();renderer.render(scene,camera);}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
