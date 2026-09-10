import { THREE, boxMesh, mats, scene } from './core.js';
export const doors=[];
export function createHouse(){
 boxMesh(0,-.25,0,46,.5,40,mats.floor); boxMesh(-23,4,0,.5,8,40,mats.wall); boxMesh(23,4,0,.5,8,40,mats.wall); boxMesh(0,4,-20,46,8,.5,mats.wall); boxMesh(0,4,20,46,8,.5,mats.wall);
 boxMesh(-7,2.5,0,.4,5,19,mats.wall); boxMesh(7,2.5,-7,.4,5,9,mats.wall); boxMesh(7,2.5,8,.4,5,8,mats.wall); boxMesh(0,2.5,11,12,5,.35,mats.wall);
 makeDoor(0,11,0); makeDoor(-7,5,Math.PI/2); makeDoor(7,-2,Math.PI/2);
}
function makeDoor(x,z,rot){const d=new THREE.Mesh(new THREE.BoxGeometry(2.6,4,.18),mats.wood);d.position.set(x,2,z);d.rotation.y=rot;d.castShadow=d.receiveShadow=true;d.userData={open:false,target:0,baseRot:rot};scene.add(d);doors.push(d);return d;}
export function updateDoors(dt){for(const d of doors){const t=d.userData.target;d.userData.openProgress+=(t-d.userData.openProgress)*Math.min(1,dt*8);}}
