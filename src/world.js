import { THREE, boxMesh, mats, scene } from './core.js';
export const doors=[];
export const colliders=[];
export const rooms=[
 {name:'Front Room',x1:-22,x2:-7,z1:-19,z2:19},
 {name:'Center Room',x1:-7,x2:7,z1:-19,z2:19},
 {name:'Back Right Room',x1:7,x2:22,z1:8,z2:19},
 {name:'Right Hall',x1:7,x2:22,z1:-19,z2:8}
];
function wall(x,z,sx,sy,sz){const m=boxMesh(x,sy/2,z,sx,sy,sz,mats.wall);colliders.push({x1:x-sx/2,x2:x+sx/2,z1:z-sz/2,z2:z+sz/2,source:m});return m;}
export function createHouse(){
 boxMesh(0,-.25,0,46,.5,40,mats.floor);
 wall(-23,0,.5,8,40);wall(23,0,.5,8,40);wall(0,-20,46,8,.5);wall(0,20,46,8,.5);
 // Vertical wall at x=-7, with a doorway centered at z=5.
 wall(-7,-3.25,.4,5,11.5);wall(-7,7.9,.4,5,3.8);
 // Vertical wall at x=7, with a doorway centered at z=-2.
 wall(7,-10.25,.4,5,8.5);wall(7,8.5,.4,5,3);
 // Upper wall at z=11, with a doorway centered at x=0.
 wall(-8,11,2.5,5,.35);wall(8,11,2.5,5,.35);
 wall(7,12,.4,5,16);
 makeDoor(0,11,0);makeDoor(-7,5,Math.PI/2);makeDoor(7,-2,Math.PI/2);
}
function makeDoor(x,z,rot){
 const d=new THREE.Mesh(new THREE.BoxGeometry(2.6,4,.18),mats.wood);d.position.set(x,2,z);d.rotation.y=rot;d.castShadow=d.receiveShadow=true;
 d.userData={open:false,target:0,baseRot:rot,openProgress:0,collider:null};scene.add(d);
 // A slightly generous axis-aligned collider is enough for the player and neighbor collision tests.
 const c={x1:x-1.3,x2:x+1.3,z1:z-.2,z2:z+.2,source:d,door:true};d.userData.collider=c;colliders.push(c);doors.push(d);return d;
}
export function updateDoors(dt){for(const d of doors){const u=d.userData;u.openProgress+=(u.target-u.openProgress)*Math.min(1,dt*10);d.rotation.y=u.baseRot+u.openProgress*Math.PI/2;}}
export function isBlocked(x,z,r=.45){for(const c of colliders){if(c.door&&c.source.userData.openProgress>.65)continue;if(x+r>c.x1&&x-r<c.x2&&z+r>c.z1&&z-r<c.z2)return true;}return false;}
export function roomAt(pos){for(const r of rooms)if(pos.x>=r.x1&&pos.x<r.x2&&pos.z>=r.z1&&pos.z<r.z2)return r.name;return 'Outside';}
export function roomCenter(name){const r=rooms.find(v=>v.name===name);return r?{x:(r.x1+r.x2)/2,z:(r.z1+r.z2)/2}:null;}
