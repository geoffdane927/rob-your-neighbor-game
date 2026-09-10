import { THREE, CANNON, boxMesh, mats, world, controls, state, distXZ } from './core.js';
export const furniture=[];
export const inventory=[null,null,null,null];
export let selectedSlot=0;
function add(name,x,y,z,sx,sy,sz,mat){const m=boxMesh(x,y,z,sx,sy,sz,mat,false);const body=new CANNON.Body({mass:Math.max(1,sx*sy*sz),shape:new CANNON.Box(new CANNON.Vec3(sx/2,sy/2,sz/2)),position:new CANNON.Vec3(x,y,z),linearDamping:.25,angularDamping:.55});world.addBody(body);m.userData={body,name,carried:false,stolen:false,home:false,inInventory:false};furniture.push(m);}
add('chair',-14,.9,-9,1.2,1.8,1.2,mats.red); add('lamp',-12,1.3,-4,.65,2.6,.65,mats.white); add('table',-15,1.5,5,3,3,1.8,mats.wood); add('chair',-12,.9,7,1.2,1.8,1.2,mats.green); add('cabinet',12,2,-11,2.8,4,1.2,mats.wood); add('sofa',14,1.5,-4,4,2.2,1.5,mats.red); add('chair',13,.9,5,1.2,1.8,1.2,mats.green);
function noise(pos,amount){if(globalThis.neighborAI)globalThis.neighborAI.hear(pos,amount);}
function refreshInventory(){const el=document.getElementById('inventory');if(!el)return;el.innerHTML=inventory.map((f,i)=>`<span class="slot ${i===selectedSlot?'selected':''}">${i+1}: ${f?f.userData.name:'empty'}</span>`).join('');}
export function selectSlot(i){if(i>=0&&i<4){selectedSlot=i;refreshInventory();}}
export function interactFurniture(){
 if(inventory[selectedSlot]){throwSelected();return;}
 const p=controls.getObject().position;let best=null,bd=2.5;
 for(const f of furniture){if(f.userData.inInventory||f.userData.home)continue;const d=distXZ(p,f.position);if(d<bd){bd=d;best=f;}}
 if(best){inventory[selectedSlot]=best;best.userData.inInventory=true;best.userData.carried=false;best.visible=false;best.userData.body.type=CANNON.Body.KINEMATIC;best.userData.body.velocity.set(0,0,0);noise(p,3);refreshInventory();}
}
export function throwSelected(){
 const f=inventory[selectedSlot];if(!f)return;
 inventory[selectedSlot]=null;f.userData.inInventory=false;f.visible=true;
 const b=f.userData.body;b.type=CANNON.Body.DYNAMIC;b.mass=Math.max(1,f.geometry.parameters.width*f.geometry.parameters.height*f.geometry.parameters.depth*2);b.updateMassProperties();
 const p=controls.getObject().position.clone();const dir=new THREE.Vector3();controls.getDirection(dir);b.position.set(p.x+dir.x*1.2,Math.max(1.2,p.y+dir.y*1.2),p.z+dir.z*1.2);b.velocity.set(dir.x*11,Math.max(2,dir.y*11+3),dir.z*11);b.angularVelocity.set(3,5,2);noise(b.position,24);refreshInventory();
}
export function dropFurniture(){throwSelected();}
export function updateFurniture(){for(const f of furniture){const b=f.userData.body;if(f.userData.inInventory||f.userData.home){f.visible=false;continue;}f.visible=true;f.position.copy(b.position);f.quaternion.copy(b.quaternion);}}
export function checkDelivery(){
 const p=controls.getObject().position;if(p.z>12&&Math.abs(p.x)<6){for(let i=0;i<4;i++){const f=inventory[i];if(!f)continue;inventory[i]=null;f.userData.inInventory=false;f.userData.stolen=true;f.userData.home=true;f.visible=false;f.userData.body.type=CANNON.Body.KINEMATIC;f.position.set(-30,2+state.stolen*.8,12);state.stolen++;}
 document.getElementById('stolen').textContent=state.stolen;refreshInventory();if(globalThis.neighborAI)globalThis.neighborAI.worry=Math.min(100,globalThis.neighborAI.worry+12);if(state.stolen===furniture.length)document.getElementById('status').textContent='You robbed the house! You win!';}}
export function inventoryFull(){return inventory.every(Boolean);}
refreshInventory();
