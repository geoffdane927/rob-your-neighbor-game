import { THREE, scene, distXZ } from './core.js';
import { colliders, roomAt, roomCenter, isBlocked } from './world.js';
const nodes=[[-15,12],[0,12],[14,12],[-15,3],[-2,3],[14,3],[-15,-7],[-2,-7],[14,-7],[-15,-15],[0,-15],[14,-15]];
const edges=[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,8],[6,7],[7,8],[6,9],[7,10],[8,11],[9,10],[10,11]];
function nearest(v){let bi=0,bd=1e9;nodes.forEach((n,i)=>{const d=(n[0]-v.x)**2+(n[1]-v.z)**2;if(d<bd){bd=d;bi=i;}});return bi;}
function astar(start,end){const open=[start],came={},g={[start]:0},f={[start]:0};while(open.length){open.sort((a,b)=>(f[a]??1e9)-(f[b]??1e9));const cur=open.shift();if(cur===end){const path=[cur];let c=cur;while(came[c]!==undefined){c=came[c];path.unshift(c);}return path;}for(const e of edges){if(e[0]!==cur&&e[1]!==cur)continue;const nb=e[0]===cur?e[1]:e[0],ng=g[cur]+Math.hypot(nodes[cur][0]-nodes[nb][0],nodes[cur][1]-nodes[nb][1]);if(ng<(g[nb]??1e9)){came[nb]=cur;g[nb]=ng;f[nb]=ng+Math.hypot(nodes[nb][0]-nodes[end][0],nodes[nb][1]-nodes[end][1]);if(!open.includes(nb))open.push(nb);}}}return[end];}
const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.7,5,10),new THREE.MeshStandardMaterial({color:0x30384b}));mesh.position.set(13,1.65,11);mesh.castShadow=true;scene.add(mesh);
const visionRay=new THREE.Raycaster();
function canSee(player){
 const eye=mesh.position.clone();eye.y+=.55;const target=player.clone();target.y=Math.min(1.65,target.y);const dir=target.sub(eye);const distance=dir.length();dir.normalize();visionRay.set(eye,dir);
 const blockers=scene.children.filter(o=>o.visible&&o!==mesh&&!o.userData?.body?.mass&&o.geometry);
 const hits=visionRay.intersectObjects(blockers,false);
 return distance<26 && (!hits.length||hits[0].distance>distance-.25);
}
function collisionMove(dx,dz){
 const nx=mesh.position.x+dx,nz=mesh.position.z+dz;
 if(!isBlocked(nx,mesh.position.z,.65))mesh.position.x=nx;
 if(!isBlocked(mesh.position.x,nz,.65))mesh.position.z=nz;
}
export const neighbor={mesh,state:'prowl',target:null,knownPos:null,knownRoom:null,worry:0,path:[],pathIndex:0,lastNoise:null,heardRoom:null,
 hear(pos,amount){const d=distXZ(pos,mesh.position),effective=amount/(1+d*.06);this.lastNoise=pos.clone();this.heardRoom=roomAt(pos);if(effective>1)this.worry=Math.min(100,this.worry+effective*2);if(this.worry>=100){this.knownPos=pos.clone();this.knownRoom=this.heardRoom;this.state='chase';this.rebuildPath(pos);}},
 rebuildPath(pos){const end=nearest(pos);this.path=astar(nearest(mesh.position),end);this.pathIndex=0;}
};
globalThis.neighborAI=neighbor;
let timer=0;
export function updateNeighbor(dt,endGame){
 const p=globalThis.__playerPosition?.();if(!p)return;
 const visible=canSee(p);const playerRoom=roomAt(p);
 if(visible){neighbor.knownPos=p.clone();neighbor.knownRoom=playerRoom;if(neighbor.state!=='chase')neighbor.state='chase';neighbor.worry=Math.min(100,neighbor.worry+9*dt);neighbor.rebuildPath(p);}
 if(neighbor.worry>=100&&neighbor.state!=='chase'){neighbor.knownRoom=playerRoom;neighbor.knownPos=p.clone();neighbor.state='chase';neighbor.rebuildPath(p);}
 const d=distXZ(p,mesh.position);if(d<1.7&&visible){endGame();return;}
 if(neighbor.state==='chase'){
   let target=neighbor.knownPos;
   if(!target){const c=roomCenter(neighbor.knownRoom||playerRoom);target=c?new THREE.Vector3(c.x,1.65,c.z):p;}
   if(neighbor.knownRoom===playerRoom&&neighbor.worry>=100)target=p;
   else if(neighbor.path.length){const n=nodes[neighbor.path[neighbor.pathIndex]??neighbor.path.length-1];target={x:n[0],z:n[1]};if(distXZ(mesh.position,target)<1.3&&neighbor.pathIndex<neighbor.path.length-1)neighbor.pathIndex++;}
   move(target,dt,visible?5.1:3.8);
   if(!visible&&neighbor.knownRoom===playerRoom&&distXZ(mesh.position,p)<9){neighbor.knownPos=p.clone();}
   if(distXZ(mesh.position,target)<1.5&&neighbor.knownPos&&distXZ(mesh.position,neighbor.knownPos)<2){neighbor.state='search';timer=5;neighbor.knownPos=null;}
 } else if(neighbor.state==='search'){
   timer-=dt;if(timer<=0)neighbor.state='prowl';
 } else {
   timer-=dt;if(timer<=0||!neighbor.target){neighbor.target=nodes[Math.floor(Math.random()*nodes.length)];timer=4+Math.random()*5;}
   move({x:neighbor.target[0],z:neighbor.target[1]},dt,1.7);if(distXZ(mesh.position,neighbor.target)<1.2)timer=0;
 }
 const missing=(globalThis.__furniture?.()||[]).filter(f=>f.userData.stolen&&!f.userData.home).length;neighbor.worry=Math.min(100,neighbor.worry+missing*.006*dt);
 const bar=document.getElementById('worry');if(bar)bar.style.width=neighbor.worry+'%';
 const status=document.getElementById('status');if(status&&neighbor.worry>=100)status.textContent=`The neighbor knows you're in the ${playerRoom}! Hide or run!`;
}
function move(target,dt,speed){const dx=target.x-mesh.position.x,dz=target.z-mesh.position.z,l=Math.hypot(dx,dz);if(l>.2){const s=Math.min(l,speed*dt);collisionMove(dx/l*s,dz/l*s);mesh.rotation.y=Math.atan2(dx,dz);}}
