import {finishLivingWall, furnishDayRoom, furnishSofa, coffeeTable} from './living.js';
import {furnishKitchen} from './kitchen.js';
import * as T from 'three';
import {rooms} from './rooms.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const canvas=document.querySelector('canvas'), renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
const scene=new T.Scene(),cam=new T.OrthographicCamera(),oak=0xb38963,cream=0xe8dfcb,green=0x767e67,white=0xf2ebdc,dark=0x4c4438;
scene.add(new T.HemisphereLight(0xfffcf6,0xe2dbd2,2.25));
const sun=new T.DirectionalLight(0xfff1df,1.85);sun.position.set(-2,17,7);scene.add(sun);sun.target.position.set(4,0,4);scene.add(sun.target);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.mapSize.set(1024,1024);sun.shadow.radius=3;sun.shadow.normalBias=.015;sun.shadow.bias=-.0002;
let furnitureParent=scene;
function mesh(g,x,y,z,c){let m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.88}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;furnitureParent.add(m);return m}
function box(x,z,w,d,h,c,y=0,r=0){return mesh(r?new RoundedBoxGeometry(w,h,d,3,r):new T.BoxGeometry(w,h,d),x,y+h/2,z,c)}
function cyl(x,z,r,h,c,y=0,r2=r){return mesh(new T.CylinderGeometry(r,r2,h,40),x,y+h/2,z,c)}
const outline=[[1.49,0],[8.87,0],[8.87,7.77],[0,7.77],[0,5.7],[1.49,4.5]];
const roomGroups = Object.fromEntries(Object.keys(rooms).map(id => [id, new T.Group()]));
scene.add(...Object.values(roomGroups));
// Shape UVs are in metres. This tile covers eight courses across and one board length along Z.
const boards=document.createElement('canvas');
boards.width=1024;
boards.height=1024;
const paint=boards.getContext('2d');
paint.fillStyle='#bcbab4';
paint.fillRect(0,0,1024,1024);
for(let row=0;row<8;row++){
  const joint=(row*389)%1024;
  paint.fillStyle=['#e8e7e2','#e5e4df','#ebeae5'][row%3];
  paint.fillRect(row*128+1,0,126,1024);
  paint.fillStyle='#bbb9b4';
  paint.fillRect(row*128,joint,128,2);
  paint.strokeStyle='rgba(131,128,120,.16)';
  for(let i=0;i<48;i++){
    const x=row*128+4+(i*37)%119,y=(i*191+row*93)%1024;
    paint.beginPath();paint.moveTo(x,y);paint.quadraticCurveTo(x+2,y+34,x,y+90);paint.stroke();
  }
}
const floorMap=new T.CanvasTexture(boards);
floorMap.wrapS=floorMap.wrapT=T.RepeatWrapping;
floorMap.repeat.set(1/1.6,1/1.8);
floorMap.colorSpace=T.SRGBColorSpace;
floorMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
for (const [id, room] of Object.entries(rooms)) {
  furnitureParent = roomGroups[id];
  const shape = new T.Shape((room.points || outline).map(([x,z]) => new T.Vector2(x,-z)));
  const slab = mesh(new T.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:false}),0,-.17,0,oak);
  slab.rotation.x = -Math.PI/2;
  const floor = mesh(new T.ShapeGeometry(shape),0,.012,0,0xffffff);
  floor.rotation.x = -Math.PI/2;
  floor.material.map = floorMap;
}

const roomFloors = Object.fromEntries(Object.entries(roomGroups).map(([id, group]) => [id, [...group.children]]));

const walls = [];
const parts = {box,cyl,mesh};
const livingCut = new T.Plane(new T.Vector3(0,-1,0),2.7);
renderer.localClippingEnabled = true;
function wall(ids, x,z,X,Z, thickness=.14, window=false, finish='') {
  const group = new T.Group();
  scene.add(group);
  furnitureParent = group;
  const length = Math.hypot(X-x,Z-z);
  group.position.set((x+X)/2,0,(z+Z)/2);
  group.rotation.y = -Math.atan2(Z-z,X-x);
  const panel = box(0,0,length,thickness,1,window?oak:0xded6c7);
  const frame = new T.Group();
  if (window && !ids.includes('living')) {
    group.add(frame);
    furnitureParent = frame;
    box(0,0,length,.045,.045,white,.64);
    for (const offset of [-length/2,0,length/2]) box(offset,0,.045,.045,.47,white,.21);
  }
  let glazing, lintel;
  if (window && !ids.includes('living')) {
    glazing = box(0,0,length-.02,.012,.43,0xd9e3de,.215);
    glazing.material.transparent = true;
    glazing.material.opacity = .38;
    glazing.castShadow = false;
    glazing.receiveShadow = false;
    furnitureParent = group;
    lintel = box(0,0,length,thickness,1,0xded6c7);
  }
  if (window && ids === 'living') {
    furnitureParent = group;
    lintel = box(0,0,length,thickness,.16,0xded6c7,2.54);
  }
  walls.push({group,panel,frame,glazing,lintel,thickness,finish,ids:ids.split(' '),window,dx:X-x,dz:Z-z});
}
// Split continuous walls at room boundaries so both adjacent rooms retain their own shared wall.
wall('living',1.49,0,3.55,0,.18,true,'frontWindow');
wall('living',3.55,0,5.38,0,.14,false,'heating');
wall('nursery',5.38,0,6.52,0);
wall('nursery',6.52,0,8.18,0,.18,true);
wall('nursery',8.18,0,8.87,0);
wall('nursery',8.87,0,8.87,4.45);
wall('hall',8.87,4.45,8.87,6.85);
wall('hall',8.87,7.77,7.12,7.77);
wall('bath',7.12,7.77,4.23,7.77);
wall('kitchen',4.23,7.77,0,7.77);
wall('kitchen',0,7.77,0,7.5);
wall('kitchen',0,7.5,0,5.7,.16,true);
wall('kitchen',0,5.7,1.22,4.72,.16,true);
wall('kitchen',1.22,4.72,1.49,4.5);
wall('kitchen',1.49,4.5,1.49,4.45);
wall('living',1.49,4.45,1.49,.85);
wall('living',1.49,.85,1.49,0,.18,true);
wall('living kitchen',1.49,4.45,4.23,4.45,.1);
wall('living hall',4.23,4.45,4.55,4.45,.1);
wall('nursery hall',6.32,4.45,8.87,4.45,.1);
wall('living nursery',5.38,0,5.38,3.85,.25,false,'media');
wall('living',5.38,3.85,5.18,4.04);
wall('living hall',4.55,4.45,5.18,4.04,.10,false,'entry');
wall('nursery',5.38,3.85,5.58,4.04);
wall('kitchen bath',4.23,7.77,4.23,5.83,.1);
wall('bath hall',4.23,5.83,5.28,5.83,.1);
wall('bath hall',6.14,5.83,7.12,5.83,.1);
wall('bath hall',7.12,5.83,7.12,7.77,.1);
function plant(x,z,s=1,y=0){cyl(x,z,.18*s,.35*s,0xaf7758,y,.13*s);for(let i=0;i<13;i++){let a=i*2.4,m=mesh(new T.SphereGeometry(1,9,8),x+.13*s*Math.cos(a),y+s*(.48+i%3*.1),z+.13*s*Math.sin(a),[0x58724a,0x728455,0x909665][i%3]);m.scale.set(.085*s,.24*s,.065*s);m.rotation.z=-.6*Math.cos(a);m.rotation.x=.6*Math.sin(a)}}
const dayRoom=new T.Group();
roomGroups.living.add(dayRoom);
furnitureParent=dayRoom;
furnishDayRoom(parts);
// The opening is diagonal in plan. The open leaf is hinged at the TV-side jamb.
const door = new T.Group();
dayRoom.add(door);
door.position.set(5.14,0,4.06);
door.rotation.y = .045;
furnitureParent = door;
box(0,-.373,.045,.746,2.015,0xf2f0e9,.027,.007);
for (const y of [.23,1.04]) box(-.025,-.373,.009,.54,.64,0xe7e4db,y,.004);
box(-.047,-.66,.052,.025,.027,0x979996,.97);
box(-.075,-.61,.019,.127,.021,0x797d7a,.97,.005);

const originalFurniture=new T.Group();
const trialFurniture=new T.Group();
roomGroups.living.add(originalFurniture,trialFurniture);
function childBed(x,z){
  box(x,z,1.02,2.05,.30,oak,.07,.04);
  box(x,z,.96,1.98,.19,white,.37,.06);
  box(x,z+.26,.98,1.44,.09,0xa0b3a1,.55,.04);
  box(x,z-.70,.66,.38,.12,cream,.55,.06);
}
furnitureParent=originalFurniture;
furnishSofa(parts,false);
coffeeTable(parts,3.34,2.49);
const originalBed = new T.Group();
roomGroups.nursery.add(originalBed);
furnitureParent = originalBed;
childBed(7.36,1.39);
furnitureParent=trialFurniture;
furnishSofa(parts,true);
coffeeTable(parts,3.65,1.03);
const study=new T.Group();
roomGroups.nursery.add(study);
furnitureParent=study;
childBed(8.20,2.56);
box(7.22,.48,1.46,.64,.05,oak,.74,.015);
for(const x of [6.58,7.86])for(const z of [.23,.72])box(x,z,.06,.06,.74,oak);
box(7.21,1.06,.43,.44,.08,green,.43,.035);
box(7.21,1.25,.43,.06,.37,green,.49,.025);
for(const x of [7.05,7.37])for(const z of [.90,1.21])box(x,z,.035,.035,.43,oak);
box(7.10,.52,.28,.20,.025,cream,.79);
plant(7.75,.42,.38,.79);
study.visible=false;
trialFurniture.visible=false;
const suite=new T.Group();
roomGroups.living.add(suite);
furnitureParent=suite;
const bedGroup=new T.Group();
suite.add(bedGroup);
furnitureParent=bedGroup;
// The headboard meets the solid partition. Both long edges have an approach.
box(4.13,1.48,2.06,1.66,.28,oak,.09,.04);
box(5.18,1.48,.10,1.71,.81,0x948875,.03,.045);
box(4.13,1.48,2,1.6,.21,white,.37,.07);
box(3.89,1.48,1.50,1.62,.10,cream,.56,.06);
box(3.46,1.48,.38,1.63,.035,0x9b7464,.65,.022);
for(const z of [1.09,1.87])box(4.83,z,.39,.67,.12,white,.57,.065);
furnitureParent=suite;
// Two-seat settee faces the screen and the stereo pair.
box(3.46,3.35,2.95,1.68,.02,0xc7bba5,.013,.015);
const settee=new T.Group();
suite.add(settee);
furnitureParent=settee;
box(2.09,3.37,.83,1.66,.33,green,.10,.075);
box(1.77,3.37,.20,1.64,.68,green,.12,.07);
for(const z of [2.61,4.13])box(2.09,z,.84,.14,.46,green,.14,.06);
for(const z of [3.01,3.73]){
  box(2.14,z,.61,.69,.14,0x98a085,.41,.06);
  box(1.93,z,.17,.65,.30,0xa4ab94,.50,.06);
}
furnitureParent=suite;
cyl(2.76,2.65,.16,.45,oak);

box(5.10,3.22,.29,1.33,.38,oak,.09,.025);
box(5.02,3.22,.17,.29,.06,dark,.47,.012);
box(5.17,3.22,.045,1.20,.68,0x252a29,.67,.015);

// Coordinates locate the tweeter; local -Z points toward the listening seat.
function speakerOnStand(parent,x,z,seatX,seatZ,surface=.012){
  const speaker=new T.Group();
  parent.add(speaker);
  speaker.position.set(x,0,z);
  speaker.rotation.y=Math.atan2(x-seatX,z-seatZ);
  const previousParent=furnitureParent;
  furnitureParent=speaker;
  const plateTop=surface+.04;
  cyl(0,.12,.125,.04,dark,surface);
  cyl(0,.12,.034,.70-plateTop,dark,plateTop);
  box(0,.12,.20,.20,.035,dark,.70);
  box(0,.12,.205,.22,.36,oak,.735,.011);
  box(0,.006,.192,.012,.344,0x343938,.743,.005);
  for(const [y,r] of [[.855,.068],[1.02,.026]]){
    const driver=mesh(new T.CylinderGeometry(r,r,.008,32),0,y,-.004,0x626863);
    driver.rotation.x=Math.PI/2;
  }
  furnitureParent=previousParent;
}
for(const z of [2.40,4.04])speakerOnStand(suite,4.85,z,2.08,3.37);

plant(1.95,.49,.94);
suite.visible=false;
const projectionRoom=new T.Group();
roomGroups.living.add(projectionRoom);
projectionRoom.visible=false;
const projectionBed=bedGroup.clone();
projectionBed.rotation.y=-Math.PI/2;
projectionBed.position.set(4.37,0,-.91);
projectionRoom.add(projectionBed);
const projectionSofa=settee.clone();
projectionSofa.rotation.y=-Math.PI/2;
projectionSofa.position.set(6.26,0,-1.18);
projectionRoom.add(projectionSofa);
furnitureParent=projectionRoom;
box(2.89,1.20,2.28,1.52,.018,0xc7bba5,.013,.015);
cyl(4.01,.94,.19,.44,oak);
// A ceiling-mounted projector faces the roll-down screen above the headboard.
const screenWidth=2.00;
const screenHeight=screenWidth*9/16;
box(2.89,4.35,2.12,.105,.10,white,2.51,.015);
box(2.89,4.33,2.04,.03,screenHeight+.04,dark,2.51-screenHeight-.04);
box(2.89,4.307,screenWidth,.012,screenHeight,0xf3f1e8,2.49-screenHeight);
box(2.89,.83,.075,.075,.17,dark,2.53);
box(2.89,.83,.32,.24,.105,white,2.43,.018);
const lens=mesh(new T.CylinderGeometry(.042,.042,.024,24),2.89,2.48,.958,0x384951);
lens.rotation.x=Math.PI/2;
for(const x of [1.77,4.01])speakerOnStand(projectionRoom,x,4.02,2.89,.91);
// Reflect furniture in room coordinates. The shell and its doorway stay fixed.
function mirroredCinema(across){
  const group=new T.Group();
  roomGroups.living.add(group);
  group.visible=false;
  if(across){
    group.scale.x=-1;
    group.position.x=1.49+5.38;
  }else{
    group.scale.z=-1;
    group.position.z=4.45;
  }
  group.add(bedGroup.clone());
  const seating=new T.Group();
  group.add(seating);
  seating.add(settee.clone());
  if(across)seating.position.z=-.55;
  furnitureParent=seating;
  box(3.46,3.35,2.68,1.68,.02,0xc7bba5,.013,.015);
  cyl(2.76,2.65,.16,.45,oak);
  const center=3.37;
  box(5.17,center,.08,2.04,.08,white,2.33,.012);
  box(5.16,center,.036,1.98,1.13,dark,1.20);
  box(5.135,center,.012,1.94,1.09,0xf3f1e8,1.22);
  box(2.11,center,.075,.075,.17,dark,2.53);
  box(2.11,center,.28,.32,.12,white,2.42,.018);
  const optic=mesh(new T.CylinderGeometry(.04,.04,.025,24),2.26,2.48,center,0x384951);
  optic.rotation.z=Math.PI/2;
  // Anchor stands to the room independently of the shifted sofa and rug.
  const seatZ=center+seating.position.z;
  for(const z of [2.49,4.04]){
    speakerOnStand(group,4.94,z,2.09,seatZ);
  }
  furnitureParent=scene;
  return group;
}
const sofaRight=mirroredCinema(true);
const sofaWindow=mirroredCinema(false);
const stereo=new T.Group();
roomGroups.living.add(stereo);
stereo.visible=false;
const stereoBed=bedGroup.clone();
stereoBed.position.z=-.22;
stereo.add(stereoBed);
furnitureParent=stereo;
const spacing=1.6;
const ear=new T.Vector3(3.43,1.02,2.68);
const speakerZ=ear.z+spacing*Math.sqrt(3)/2;
const speakers=[-1,1].map(side=>new T.Vector3(ear.x+side*spacing/2,ear.y,speakerZ));
box(ear.x,3.29,2.20,1.90,.018,0xc5bda9,.015);
box(ear.x,2.82,.83,.81,.32,green,.12,.08);
box(ear.x,2.52,.77,.18,.66,green,.14,.07);
box(ear.x,2.85,.66,.57,.15,0xa2aa91,.43,.065);
for(const x of [ear.x-.39,ear.x+.39])box(x,2.82,.12,.72,.36,green,.27,.045);
furnitureParent=stereo;
box(ear.x,4.23,1.22,.29,.36,oak,.09,.025);
box(ear.x,4.28,1.17,.045,.68,0x252a29,.65,.016);
box(ear.x,4.21,.32,.18,.06,dark,.45);
for(const point of speakers)speakerOnStand(stereo,point.x,point.z,ear.x,ear.z);
furnitureParent=stereo;
const triangle=[ear,...speakers];
const guide=new T.LineLoop(new T.BufferGeometry().setFromPoints(triangle),new T.LineDashedMaterial({color:0x19787c,dashSize:.07,gapSize:.035}));
guide.computeLineDistances();
stereo.add(guide);
for(const vertex of triangle)mesh(new T.SphereGeometry(.027,16,8),vertex.x,vertex.y,vertex.z,0x176467);
furnitureParent=roomGroups.nursery;
box(7.74,4.12,1.2,.44,.84,oak,.02,.02);
furnitureParent=roomGroups.kitchen;
furnishKitchen({box,cyl,mesh});
furnitureParent=roomGroups.bath;
box(4.72,6.86,.77,1.65,.48,white,.04,.11);box(4.72,6.86,.59,1.41,.05,0xc2cfca,.49,.15);box(5.76,7.38,.75,.56,.77,oak);cyl(5.76,7.38,.24,.14,white,.77);box(6.69,7.53,.45,.22,.66,white,.04,.05);let wc=cyl(6.69,7.19,.25,.39,white,.04);wc.scale.z=1.35;box(6.73,6.26,.59,.59,.84,white);
furnitureParent=roomGroups.hall;
box(8.45,5.41,.52,1.45,.47,oak);box(8.45,5.41,.53,1.37,.09,green,.47,.04);plant(8.45,6.49,.8);
const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.10}));ground.rotation.x=-Math.PI/2;ground.position.y=-.22;ground.receiveShadow=true;scene.add(ground);

const byId = id => document.getElementById(id);
const heightControl = byId('height');
const layoutControl = byId('layout');
const layouts = {original:originalFurniture, trial:trialFurniture, suite, stereo, projector:projectionRoom, 'sofa-right':sofaRight, 'sofa-window':sofaWindow};
let activeRoom = 'living';
let angle = rooms.living.angle, pitch = .57, zoom = 1;
const overviewCut = {all: .95, room: 2.4};
const cards = new Map();

const orbitPoints = Array.from({length:128}, (_,i) => {
  const a = i * Math.PI / 64;
  return new T.Vector3(Math.cos(a), 0, Math.sin(a));
});
const orbit = new T.LineLoop(new T.BufferGeometry().setFromPoints(orbitPoints), new T.LineBasicMaterial({color:0xc4bcb0,transparent:true,opacity:.48}));
scene.add(orbit);
function showRoom(id) {
  for (const [key,group] of Object.entries(roomGroups)) {
    group.visible = key === id || id === 'all';
    for (const floor of roomFloors[key]) floor.visible = key === id;
  }
  for (const wall of walls) wall.group.visible = id === 'all' || wall.ids.includes(id);
}

// The midpoint just inside the polygon identifies the inside face, even at the bend in the hall.
function contains(points,x,z) {
  let inside = false;
  for (let i=0,j=points.length-1; i<points.length; j=i++) {
    const [xi,zi]=points[i], [xj,zj]=points[j];
    if ((zi>z)!==(zj>z) && x<(xj-xi)*(z-zi)/(zj-zi)+xi) inside=!inside;
  }
  return inside;
}
for (const wall of walls) {
  const length = Math.hypot(wall.dx,wall.dz);
  const nx = -wall.dz/length, nz = wall.dx/length;
  const {x,z} = wall.group.position;
  wall.normals = {};
  for (const id of wall.ids) {
    const sign = contains(rooms[id].points,x+nx*.015,z+nz*.015) ? -1 : 1;
    wall.normals[id] = [nx*sign,nz*sign];
  }
  if (wall.ids.includes('living')) {
    const decor = new T.Group();
    wall.group.add(decor);
    const [outX,outZ] = wall.normals.living;
    decor.scale.z = -(outX*nx + outZ*nz);
    furnitureParent = decor;
    if (wall.finish === 'entry') {
      for (const edge of [-1,1]) box(edge*(length/2-.013),0,.036,.13,2.065,white,0);
      box(0,0,length,.13,.051,white,2.015);
    } else {
      finishLivingWall(parts,length,wall.thickness/2,wall.finish,wall.window);
    }
    decor.traverse(child => {
      if (child.isMesh) {
        child.material.clippingPlanes = [livingCut];
        child.material.clipShadows = true;
      }
    });
    wall.livingDecor = decor;
  }
}

function draw(id, azimuth, elevation, magnification, cut, w, h, preview=false) {
  const room = rooms[id], [x,z] = room.center;
  const aspect = w/h, isPlan = elevation >= 1.56, whole = id === 'all';
  const span = Math.max(room.span * (preview ? 1.02 : 1.20)/aspect, room.span * (preview ? .82 : .91)) / magnification;
  renderer.setSize(w,h,false);
  Object.assign(cam,{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2,near:.1,far:90});
  const targetY = isPlan ? 0 : whole ? .26 : .72;
  cam.position.set(x+20*Math.sin(azimuth)*Math.cos(elevation),targetY+20*Math.sin(elevation),z+20*Math.cos(azimuth)*Math.cos(elevation));
  cam.lookAt(x,targetY,z);
  cam.updateProjectionMatrix();
  livingCut.constant = cut;
  for (const wall of walls) {
    if (!wall.group.visible) continue;
    const normal = wall.normals[id];
    const facing = normal && normal[0]*Math.sin(azimuth)+normal[1]*Math.cos(azimuth) > .02;
    const open = !isPlan && facing;
    let wallHeight = open ? Math.min(cut,.13) : cut;
    if (wall.livingDecor) wall.livingDecor.visible = (id === 'living' || whole) && !open;
    if (wall.window && wall.livingDecor) {
      wallHeight = Math.min(wallHeight,.75);
      wall.panel.material.color.setHex(0xded6c7);
      wall.lintel.visible = !open && cut > 2.54;
      const lintelHeight = Math.max(0,cut-2.54);
      wall.lintel.scale.y = lintelHeight/.16;
      wall.lintel.position.y = 2.54+lintelHeight/2;
    } else if (wall.window) {
      const sill = whole ? .21 : cut*.26;
      const frameScale = whole ? 1 : cut*.58/.475;
      wallHeight = open ? Math.min(.13,cut) : sill;
      wall.panel.material.color.setHex(whole ? oak : 0xded6c7);
      wall.lintel.visible = !whole && !open;
      wall.lintel.scale.y = cut*.16;
      wall.lintel.position.y = cut*.92;
      wall.frame.position.y = sill-.21*frameScale;
      wall.frame.visible = !open;
      wall.glazing.visible = !whole;

      wall.frame.scale.y = frameScale;
    }
    wall.panel.scale.y = wallHeight;
    wall.panel.position.y = wallHeight/2;
    if (wall.finish === 'entry') {
      const headerHeight = Math.max(0,wallHeight-2.065);
      wall.panel.visible = headerHeight>0;
      wall.panel.scale.y = headerHeight;
      wall.panel.position.y = 2.065+headerHeight/2;
      wall.livingDecor.visible = !open;
    }
  }
  orbit.visible = !whole && !isPlan && !preview;
  orbit.position.set(x,-.205,z);
  orbit.scale.setScalar(room.span*.51);
  renderer.render(scene,cam);
}
function render() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  draw(activeRoom,angle,pitch,zoom,+heightControl.value,w,h);
  const isPlan = pitch >= 1.56;
  byId('iso').setAttribute('aria-pressed',String(!isPlan));
  byId('topview').setAttribute('aria-pressed',String(isPlan));
  byId('minus').disabled = zoom <= .6;
  byId('plus').disabled = zoom >= 3;
}
function selectRoom(id) {
  activeRoom = id;
  angle = rooms[id].angle;
  pitch = id === 'all' ? .85 : .57;
  zoom = 1;
  heightControl.value = overviewCut[id==='all' ? 'all' : 'room'];
  canvas.setAttribute('aria-label','Модель — '+rooms[id].name);
  byId('stereoMetrics').hidden = !(stereo.visible && (id==='living' || id==='all'));
  for (const [key,card] of cards) {
    const selected = key === id;
    card.setAttribute('aria-pressed',String(selected));
    card.querySelector('use').setAttribute('href',selected ? '#check' : '#arrow');
  }
  showRoom(id);
  render();
}
function refreshPreviews(ids) {
  const ratio = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  for (const id of ids) {
    showRoom(id);
    draw(id,rooms[id].angle,id==='all'?.87:.62,1,id==='all'?.95:2.15,300,204,true);
    cards.get(id).querySelector('img').src = canvas.toDataURL('image/png');
  }
  renderer.setPixelRatio(ratio);
  showRoom(activeRoom);
  render();
}
for (const id of ['living','nursery','kitchen','hall','bath','all']) {
  const room = rooms[id], card = document.createElement('button');
  card.className = 'room';
  card.title = 'Показать — '+room.name;
  card.innerHTML = '<img alt=""><span class="room-name"></span><span class="area"></span><span class="marker"><svg aria-hidden="true"><use href="#arrow"/></svg></span>';
  card.querySelector('.room-name').textContent = room.name;
  card.querySelector('.area').textContent = room.area+' м²';
  card.onclick = () => selectRoom(id);
  cards.set(id,card);
  byId('rooms').append(card);
}

function selectLayout(id) {
  for (const [key,group] of Object.entries(layouts)) group.visible = key===id;
  originalBed.visible = id==='original';
  study.visible = !originalBed.visible;
  dayRoom.visible = originalBed.visible || id==='trial';
  byId('stereoMetrics').hidden = !(stereo.visible && (activeRoom==='all' || activeRoom==='living'));
  layoutControl.value = id;
}
layoutControl.onchange = () => {
  selectLayout(layoutControl.value);
  refreshPreviews(['living','nursery','all']);
};
const initialLayout = location.hash.slice(1);
selectLayout(Object.hasOwn(layouts,initialLayout) ? initialLayout : 'original');
selectRoom(activeRoom);
refreshPreviews(cards.keys());

function scale(factor) {
  zoom = Math.min(3,Math.max(.6,zoom*factor));
  render();
}
byId('plus').onclick = () => scale(1.2);
byId('minus').onclick = () => scale(1/1.2);
byId('reset').onclick = () => selectRoom(activeRoom);
byId('iso').onclick = () => { angle=rooms[activeRoom].angle; pitch=activeRoom==='all'?.85:.57; render() };
byId('topview').onclick = () => { angle=0; pitch=Math.PI/2-.001; render() };
byId('rotate').onclick = () => { angle+=Math.PI/4; render() };
heightControl.oninput = () => {
  overviewCut[activeRoom==='all' ? 'all' : 'room'] = +heightControl.value;
  render();
};
canvas.onwheel = event => { event.preventDefault(); scale(Math.exp(-event.deltaY*.0015)) };
const pointers = new Map();
canvas.onpointerdown = event => {
  canvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId,[event.clientX,event.clientY]);
};
canvas.onpointermove = event => {
  const last = pointers.get(event.pointerId);
  if (!last) return;
  const other = [...pointers].find(([id])=>id!==event.pointerId)?.[1];
  if (other) {
    scale(Math.hypot(event.clientX-other[0],event.clientY-other[1])/Math.max(1,Math.hypot(last[0]-other[0],last[1]-other[1])));
  } else {
    angle -= (event.clientX-last[0])*.009;
    pitch = Math.min(1.569,Math.max(.28,pitch+(event.clientY-last[1])*.006));
    render();
  }
  pointers.set(event.pointerId,[event.clientX,event.clientY]);
};
canvas.onlostpointercapture = event => pointers.delete(event.pointerId);
new ResizeObserver(render).observe(canvas);
