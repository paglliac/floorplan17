// Living room, IMG_2343–2348. The corner window is at low X / low Z.
// The sofa footprint follows its dimension drawing. Other furniture sizes are estimated from photos.
import * as T from 'three';

const graphite = 0x696b72, charcoal = 0x202127, timber = 0x9d714e;
const moss = 0x56634f, navy = 0x34485a, ivory = 0xf2efe6;

function texture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'));
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  return map;
}

function leaf(ctx, x, y, angle, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * .6, -size * .36, size, 0);
  ctx.quadraticCurveTo(size * .5, size * .28, 0, 0);
  ctx.fill();
  ctx.restore();
}

const wallpaper = texture(256, 256, ctx => {
  ctx.fillStyle = '#c7bdb1';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 47; i++) {
    const x = i * 73 % 256, y = i * 103 % 256, a = i * 2.4;
    ctx.fillStyle = i % 2 ? '#cfc6ba' : '#beb5aa';
    for (let j = 0; j < 5; j++) {
      const d = j * 3;
      leaf(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, a + (j % 2 ? .76 : -.76), 7 + j);
    }
  }
});
const brick = texture(512, 256, ctx => {
  ctx.fillStyle = '#bcbab5';
  ctx.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 6; row++) {
    for (let col = -1; col < 4; col++) {
      const x = col * 128 + (row % 2) * 64, y = row * 256 / 6;
      ctx.fillStyle = ['#e8e6e0','#e0dfdb','#efede8'][(row + col + 4) % 3];
      ctx.fillRect(x + 2, y + 2, 124, 39);
      ctx.fillStyle = '#f4f2ed';
      ctx.fillRect(x + 2, y + 2, 124, 2);
    }
  }
});

function mappedPanel({mesh}, map, x, z, w, h, y, tileW, tileH) {
  const geometry = new T.PlaneGeometry(w, h);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tileW, uv.getY(i) * h / tileH);
  const panel = mesh(geometry, x, y + h / 2, z, 0xffffff);
  panel.material.map = map;
  panel.castShadow = false;
  return panel;
}

const curtainPrint = texture(192, 256, ctx => {
  ctx.fillStyle = '#34495a';
  ctx.fillRect(0, 0, 192, 256);
  for (const [x,y,a] of [[30,25,.9],[130,135,2.3],[12,243,-1.1]]) {
    for (let j = 0; j < 7; j++) {
      const d = j * 5;
      ctx.fillStyle = '#97a5a4';
      for (const side of [-1,1]) leaf(ctx,x+d*Math.cos(a),y+d*Math.sin(a),a+side*.87,28-j*2);
    }
  }
});

function curtain(parts, left, right, depth, color, printed = false, sheer = false) {
  const width = right - left, steps = Math.ceil(width * 65);
  const geometry = new T.PlaneGeometry(width, 2.52, steps, 3);
  const pos = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i), v = uv.getY(i), fold = Math.cos(u * Math.PI * 2 * Math.round(width * 9));
    pos.setXYZ(i, pos.getX(i) * (.94 + .06 * (1-v)), pos.getY(i) + .012 * fold * (1-v), .032 * fold);
    uv.setXY(i,u * width / .32,v * 5);
  }
  geometry.computeVertexNormals();
  const panel = parts.mesh(geometry,(left + right) / 2,1.37,depth,color);
  panel.material.side = T.DoubleSide;
  panel.castShadow = false;
  if (printed) panel.material.map = curtainPrint;
  if (sheer) {
    panel.material.transparent = true;
    panel.material.opacity = .34;
    panel.material.depthWrite = false;
  }
}

// The shell provides a local X axis along each wall and positive Z towards the room.
export function finishLivingWall(parts, length, face, kind, window) {
  const {box} = parts, h = 2.7;
  function paper(y,height) {
    mappedPanel(parts,wallpaper,0,face+.002,length,height,y,.53,.53);
  }
  if (window) {
    paper(0,.75);
    paper(2.54,h-2.54);
    box(0,face+.034,length,.12,.035,ivory,.735);
    for (const y of [.75,2.19,2.505]) box(0,0,length,.055,.045,ivory,y);
    const divisions = kind === 'frontWindow' ? 3 : 1;
    for (let i = 0; i <= divisions; i++) {
      box((i/divisions-.5)*(length-.045),0,.045,.055,1.79,ivory,.75);
    }
    const glass = box(0,0,length-.045,.012,1.74,0xd9e7ec,.77);
    glass.material.transparent = true;
    glass.material.opacity = .3;
    glass.material.depthWrite = false;
    glass.castShadow = false;
    if (kind === 'frontWindow') {
      box(.09,face+.13,length+.24,.05,.035,ivory,2.65);
      curtain(parts,-length/2+.13,.48,face+.10,ivory,false,true);
      curtain(parts,-length/2,-length/2+.32,face+.16,0xffffff,true);
      curtain(parts,.69,length/2+.20,face+.16,navy);
      const rx=.34;
      box(rx,face+.085,.90,.08,.46,0xe5e1d7,.15);
      for (let i=0;i<10;i++) box(rx-.405+i*.09,face+.13,.077,.055,.47,ivory,.15,.009);
    } else {
      curtain(parts,-.02,length/2,face+.12,0xffffff,true);
    }
  } else {
    paper(0,h);
  }
  box(0,face+.012,length,.025,.072,ivory,.012);
  if (kind === 'media') {
    const center = 2.17-length/2;
    mappedPanel(parts,brick,center,face+.022,1.58,h,0,1,.42);
    const ac = .61-length/2;
    box(ac,face+.112,.85,.22,.29,0xe6e2d6,2.27,.04);
    box(ac,face+.215,.72,.016,.022,0x999990,2.313,.004);
    box(.19-length/2,face+.024,.028,.025,2.30,ivory,.02);
  }
  if (kind === 'heating') {
    for (const y of [.17,.61]) box(0,face+.032,length,.026,.025,ivory,y,.009);
  }
}

function leg({mesh}, start, end, radius, color, topRadius = radius) {
  const a = new T.Vector3(...start), b = new T.Vector3(...end);
  const axis = b.clone().sub(a), center = a.clone().lerp(b,.5);
  const part = mesh(new T.CylinderGeometry(topRadius,radius,axis.length(),12),center.x,center.y,center.z,color);
  part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
  return part;
}

const rugMap = texture(640, 800, ctx => {
  const colors = ['#263a42','#c8c1af','#46544e','#999b8f'];
  for (let row=0; row<3; row++) {
    for (let col=0; col<3; col++) {
      const x = [0,240,404][col], y = [0,302,535][row];
      const w = [240,164,236][col], h = [302,233,265][row];
      ctx.fillStyle = colors[[0,1,0,3,0,2,2,1,0][row*3+col]];
      ctx.fillRect(x,y,w,h);
      if ((row+col)%2===0 && row!==1) {
        ctx.fillStyle = row===0 ? '#bbbbb0' : '#73807b';
        for (let line=4;line<h;line+=9) ctx.fillRect(x,y+line,w,1.6);
      }
    }
  }
});

function wardrobe({box}) {
  const left=1.565, width=2.28, door=width/5;
  box(left+width/2,4.105,width,.57,2.65,0x44454a,.015);
  for (let i=0;i<5;i++) {
    const x=left+(i+.5)*door;
    for (const [y,h] of [[.075,2.105],[2.188,.478]]) box(x,3.812,door-.009,.031,h,graphite,y,.003);
    const handleX=x+(i%2===0 ? 1 : -1)*(door/2-.041);
    box(handleX,3.783,.012,.035,.96,charcoal,.18);
  }
}

function guitar(parts) {
  const {box,mesh}=parts, x=4.15, z=4.13;
  const outline=new T.Shape();
  outline.moveTo(0,.47);
  outline.bezierCurveTo(.17,.48,.156,.35,.113,.29);
  outline.bezierCurveTo(.084,.23,.211,.20,.19,.095);
  outline.bezierCurveTo(.18,-.047,-.17,-.048,-.19,.095);
  outline.bezierCurveTo(-.21,.21,-.084,.23,-.113,.29);
  outline.bezierCurveTo(-.156,.35,-.17,.48,0,.47);
  const body=mesh(new T.ExtrudeGeometry(outline,{depth:.085,bevelEnabled:true,bevelSize:.008,bevelThickness:.007,bevelSegments:2}),x,.15,z,timber);
  body.material.color.setHex(0xb68551);
  const hole=mesh(new T.CircleGeometry(.045,32),x,.465,z-.009,0x33251e);
  hole.rotation.y=Math.PI;
  box(x,z+.02,.044,.042,.47,0x5a4032,.59);
  box(x,z+.02,.069,.046,.12,timber,1.025,.013);
  box(x,z-.013,.12,.012,.022,0x43332b,.28);
  for (const side of [-1,1]) {
    leg(parts,[x+side*.185,.02,z-.10],[x,.41,z+.105],.013,charcoal);
    leg(parts,[x+side*.11,.10,z-.04],[x+side*.11,.155,z-.02],.013,charcoal);
  }
  leg(parts,[x,.02,z+.22],[x,.41,z+.105],.014,charcoal);
}

function media(parts) {
  const {box,cyl}=parts, center=2.17;
  for (const z of [center-.64,center+.64]) for (const x of [4.88,5.14]) {
    box(x,z,.045,.045,.09,charcoal,.014);
  }
  box(5.025,center,.42,1.43,.055,charcoal,.10);
  box(5.025,center,.42,1.43,.045,charcoal,.72);
  for (const z of [center-.695,center,center+.695]) box(5.025,z,.42,.035,.57,charcoal,.153);
  box(5.21,center,.025,1.40,.57,charcoal,.153);
  box(4.807,center-.355,.035,.685,.605,0xb68e65,.12);
  const veneer=texture(256,256,ctx=>{
    ctx.fillStyle='#b89569';
    ctx.fillRect(0,0,256,256);
    for(let i=-140;i<390;i+=2) {
      ctx.strokeStyle=i%6 ? 'rgba(105,72,45,.14)' : 'rgba(245,225,200,.22)';
      ctx.beginPath();
      ctx.moveTo(0,i+100);
      ctx.lineTo(127,i);
      ctx.lineTo(256,i+96);
      ctx.stroke();
    }
  });
  const front=mappedPanel(parts,veneer,4.788,center-.355,.681,.601,.122,.681,.601);
  front.rotation.y=-Math.PI/2;
  box(5.02,center+.35,.40,.665,.025,charcoal,.491);
  for (let i=0;i<25;i++) box(4.99,center+.049+i*.024,.30,.019,.29+(i%4)*.009,[0xad9c87,0x575457,0xd3c7b1,0x85756e][i%4],.155);
  box(4.99,center+.35,.32,.56,.14,0x303134,.519,.01);
  box(5.015,center+.32,.33,.44,.055,0x333438,.765,.008);
  cyl(5.015,center+.30,.14,.012,0x191b1d,.82);
  const cover=box(5.015,center+.32,.33,.44,.065,0x829093,.832,.009);
  cover.material.transparent=true;
  cover.material.opacity=.32;
  for (const z of [center-.23,center+.23]) box(5.175,z,.115,.055,.22,charcoal,1.21);
  box(5.094,center,.058,1.55,.89,0x202126,.95,.014);
  const display=box(5.061,center,.012,1.52,.855,0x21282d,.968,.006);
  display.material.roughness=.27;
  for (const z of [1.19,3.15]) {
    box(5.016,z,.28,.29,.029,charcoal,.015,.008);
    cyl(5.016,z,.032,.62,charcoal,.044);
    box(5.016,z,.24,.225,.025,charcoal,.664);
    box(5.016,z,.26,.25,.39,0x252629,.689,.008);
    box(4.88,z,.014,.238,.378,charcoal,.695,.005);
  }
}

// The beanbag seat dips at the front and rises into a loose back near the window.
function beanbag({mesh}) {
  // Cross-sections run from the flat base over the padded rim into the seat hollow.
  const rings=[[.03,.018,0],[.68,.019,0],[.96,.14,.09],[1,.29,.18],
    [.89,.42,.27],[.67,.44,.34],[.49,.32,.22],[.24,.24,.09],[.001,.23,0]];
  const vertices=[], indices=[], sections=64;
  for (const [radius,height,rise] of rings) {
    for (let i=0;i<sections;i++) {
      const a=i*2*Math.PI/sections, back=(1-Math.sin(a))/2;
      const gathered=.034*Math.sin(7*a+.8)*radius+.018*Math.cos(5*a);
      vertices.push(.49*Math.cos(a)*radius*(1+gathered),height+rise*back*back,
        .51*Math.sin(a)*radius*(1+gathered));
    }
  }
  for (let row=0;row<rings.length-1;row++) {
    for (let i=0;i<sections;i++) {
      const a=row*sections+i, b=row*sections+(i+1)%sections;
      indices.push(a,a+sections,b,b,a+sections,b+sections);
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  mesh(geo,4.44,0,.71,0x783346);
}

export function furnishDayRoom(parts) {
  const {box,mesh}=parts;
  wardrobe(parts);
  guitar(parts);
  media(parts);
  beanbag(parts);
  const rug=mesh(new T.PlaneGeometry(2.69,2.52),3.43,.024,2.39,0xffffff);
  rug.rotation.x=-Math.PI/2;
  rug.material.map=rugMap;
  // Folding ironing board stored between the window and the first speaker.
  const board=box(5.085,.66,.075,.36,1.32,0x466260,.09,.035);
  board.rotation.z=-.11;
  for (const z of [.54,.77]) leg(parts,[4.94,.02,z],[5.14,1.43,z],.016,charcoal);
  box(5.14,.66,.11,.34,.09,charcoal,1.36,.018);
  floorLamp(parts);
}

function floorLamp(parts) {
  const {cyl,mesh}=parts, x=1.87,z=.48;
  cyl(x,z,.14,.035,charcoal,.014);
  leg(parts,[x,.045,z],[x,1.19,z],.013,charcoal);
  leg(parts,[x,1.19,z],[x+.22,1.57,z+.10],.014,charcoal);
  const shade=mesh(new T.CylinderGeometry(.054,.096,.16,28),x+.235,1.55,z+.12,charcoal);
  shade.rotation.z=.52;
}

export function furnishSofa(parts, unfolded) {
  const {box}=parts;
  // Drawing dimensions in metres. Z runs along the wall, X towards the TV.
  const width=2.50, sleepingLength=1.96, depth=1.05, chaiseDepth=1.55;
  const backX=1.60, centerZ=1.86;
  const arm=(width-sleepingLength)/2;
  const frontX=backX+depth, chaiseFrontX=backX+chaiseDepth;
  const seatBackX=backX+.24, halfSeat=sleepingLength/2;

  box(backX+depth/2,centerZ,depth,width,.23,moss,.15,.055);
  box(backX+.11,centerZ,.22,width-.07,.56,moss,.23,.06);
  for (const side of [-1,1]) {
    const armZ=centerZ+side*(width-arm)/2;
    box(backX+depth/2,armZ,depth,arm,.50,moss,.16,.065);
    const seatZ=centerZ+side*halfSeat/2;
    const cushion=box(backX+.22,seatZ,.235,halfSeat-.01,.43,moss,.475,.078);
    cushion.rotation.z=.14;

    const extended=unfolded || side<0;
    const edgeX=extended ? chaiseFrontX : frontX;
    const footZ=centerZ+side*(halfSeat-.075);
    for (const x of [backX+.10,edgeX-.08]) {
      leg(parts,[x,.014,footZ],[x,.22,footZ],.022,0x714e39,.032);
    }
    if (extended) {
      const extension=chaiseDepth-depth;
      box(frontX+extension/2,seatZ,extension,halfSeat,.23,moss,.15,.045);
    }
    if (!unfolded) {
      box((seatBackX+edgeX)/2,seatZ,edgeX-seatBackX,halfSeat-.005,.15,moss,.37,.065);
    }
  }
  if (unfolded) {
    const bedDepth=chaiseFrontX-seatBackX, bedX=(seatBackX+chaiseFrontX)/2;
    box(bedX,centerZ,bedDepth,sleepingLength,.14,0xe3e1d7,.38,.05);
    box(bedX,centerZ+.27,bedDepth,sleepingLength-.54,.045,0xa6b3a2,.52,.024);
    for (const side of [-1,1]) {
      box(bedX+side*bedDepth/4,centerZ-halfSeat+.21,.53,.33,.10,ivory,.52,.05);
    }
  }
}

export function coffeeTable(parts, x, z) {
  const {box,cyl}=parts;
  for (let i=0;i<3;i++) {
    const a=i*2*Math.PI/3;
    leg(parts,[x+.32*Math.cos(a),.025,z+.32*Math.sin(a)],[x+.20*Math.cos(a),.393,z+.20*Math.sin(a)],.013,charcoal,.020);
  }
  cyl(x,z,.355,.033,timber,.392);
  cyl(x,z,.344,.005,0xb08a66,.425);
  box(x-.072,z+.10,.047,.13,.013,charcoal,.432,.004);
  const tumbler=cyl(x+.10,z-.10,.028,.067,0xc6cacc,.431,.023);
  tumbler.material.transparent=true;
  tumbler.material.opacity=.52;
}
