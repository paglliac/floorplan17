// IMG_2349–2353. In plan the window is at Z=0, the map at Z=4.45,
// the patterned wall at X=8.87 and the TV on the opposite partition.
import * as T from 'three';

const white=0xe7e4db, black=0x292b2e, walnut=0x756353, grey=0x747b7e;
const caramel=0xa17452, pine=0xb28b60, teal=0x36514e;

function canvasMap(w,h,paint) {
  const canvas=document.createElement('canvas');
  canvas.width=w;
  canvas.height=h;
  paint(canvas.getContext('2d'));
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  return map;
}

const triangles=canvasMap(512,512,ctx=>{
  ctx.fillStyle='#d3cbbd';
  ctx.fillRect(0,0,512,512);
  const colors=['#b8b2a6','#a5a5a0','#c8c6bd','#e3ddd0','#9fa9aa','#d6cbbc','#babfc0'];
  for (let row=-1;row<9;row++) for (let col=-1;col<9;col++) {
    const k=((row+8)%8)*8+(col+8)%8, x=col*64+(row%2===0?0:32), y=row*64;
    ctx.fillStyle=colors[(k*13+Math.floor(k/5))%colors.length];
    ctx.beginPath();ctx.moveTo(x,y+64);ctx.lineTo(x+40,y);ctx.lineTo(x+80,y+64);ctx.fill();
    ctx.globalAlpha=.38;
    ctx.fillStyle=colors[(k+3)%colors.length];
    ctx.beginPath();ctx.moveTo(x+21,y+31);ctx.lineTo(x+59,y+31);ctx.lineTo(x+40,y+61);ctx.fill();
    ctx.globalAlpha=1;
  }
});
triangles.wrapS=triangles.wrapT=T.RepeatWrapping;

const stripes=canvasMap(256,256,ctx=>{
  ctx.fillStyle='#e8e8e5';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#46515c';ctx.lineWidth=2;
  for(let i=0;i<8;i++){
    const y=i*32+3;
    ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(64,y-4,173,y+4,256,y);ctx.stroke();
  }
});
stripes.wrapS=stripes.wrapT=T.RepeatWrapping;
stripes.repeat.set(1.8,2.2);

function rod({mesh},a,b,r,color) {
  const start=new T.Vector3(...a), end=new T.Vector3(...b), delta=end.clone().sub(start);
  const middle=start.lerp(end,.5);
  const part=mesh(new T.CylinderGeometry(r,r,delta.length(),12),middle.x,middle.y,middle.z,color);
  part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  return part;
}

// Form soft folds across the mattress and let the green duvet fall over the foot.
function bedding({mesh},x,z,length,width,y,color,overhang=0) {
  const geometry=new T.PlaneGeometry(length,width,42,14);
  geometry.rotateX(-Math.PI/2);
  const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++) {
    const u=pos.getX(i),v=pos.getZ(i), edge=v/width;
    const fold=.014*Math.sin(u*13+edge*4)+.016*Math.cos(v*26-u*2.7);
    const drop=Math.max(0,-1.00-(x+u));
    pos.setXYZ(i,u+drop*.81,fold-drop*overhang+.012*Math.cos(u*7),v+.026*Math.sin(u*9+edge));
  }
  geometry.computeVertexNormals();
  const cloth=mesh(geometry,x,y,z,color);
  cloth.material.side=T.DoubleSide;
}

// Coordinates are in the bed's own axes. The head is at +X, the long bolster at +Z.
export function nurseryBed(parts) {
  const {box,cyl}=parts;
  for(const x of [-.89,.89]) for(const z of [-.61,.61]) cyl(x,z,.022,.22,black,.014);
  box(0,0,2.04,1.44,.21,grey,.23,.037);
  const mattress=box(-.025,-.025,1.99,1.39,.18,0xffffff,.44,.055);
  mattress.material.map=stripes;
  box(.972,0,.105,1.44,.61,grey,.30,.047);
  box(.11,.666,1.80,.112,.34,0x6b7980,.46,.048);
  bedding(parts,-.19,.22,2.17,.72,.664,teal,1.15);
  for(const z of [-.34,.29]) {
    const pillow=box(.67,z,.44,.53,.115,z<0?teal:0x87999b,.62,.056);
    pillow.rotation.y=z<0?.11:-.12;
  }
  bedding(parts,.15,.38,.81,.48,.709,0xa3a099);
}

export function nurserySofa({box}) {
  // Local back at +X, towards the patterned wall in the photographed layout.
  box(0,0,.82,1.72,.27,0x946747,.025,.035);
  box(.335,0,.15,1.70,.55,caramel,.14,.048);
  box(-.043,0,.66,1.44,.16,caramel,.285,.048);
  for(const z of [-.795,.795]) box(-.01,z,.80,.13,.25,caramel,.35,.045);
  const cushion=box(.14,.35,.21,.43,.22,0xb8b9ae,.44,.054);
  cushion.rotation.z=-.27;
}

// The user sits at local -Z. Rotate the whole workstation to keep the display,
// monitor arm, chair and keyboard facing one another in either layout.
export function nurseryDesk(parts) {
  const {box,cyl,mesh}=parts;
  // Estimated from the tabletop corners in IMG_2351 and IMG_2352.
  box(0,0,1.02,.65,.041,0x4c4b48,.738,.012);
  const leftPost=-.24,rightPost=.40;
  for(const x of [leftPost,rightPost]) {
    box(x,.055,.061,.071,.69,black,.048,.009);
    box(x,0,.065,.60,.038,black,.014,.009);
  }
  box((leftPost+rightPost)/2,.055,rightPost-leftPost,.046,.055,black,.65);
  box(-.40,-.04,.19,.40,.45,black,.017,.016);
  for(const y of [.16,.30]) {
    const fan=mesh(new T.CircleGeometry(.064,20),-.40,y,.162,0x363c3f);
    fan.castShadow=false;
  }
  // Monitor arm clamps to the room-side edge. The microphone clamps on the left.
  box(.05,.299,.083,.064,.046,black,.779);
  rod(parts,[.05,.81,.30],[.05,.98,.16],.022,black);
  rod(parts,[.05,.98,.16],[.08,1.09,-.04],.023,black);
  box(.08,-.04,.07,.06,.093,black,1.045);
  const monitor=box(.08,-.08,.665,.042,.392,black,.90,.009);
  monitor.rotation.y=-.14;
  const display=box(.0834,-.104,.645,.008,.369,0x323c46,.913,.003);
  display.rotation.y=monitor.rotation.y;
  box(.12,-.215,.38,.13,.018,black,.779,.005);
  box(-.17,-.21,.060,.085,.024,black,.779,.01);
  box(-.493,0,.050,.052,.064,black,.723);
  rod(parts,[-.49,.787,0],[-.46,1.06,-.08],.012,black);
  rod(parts,[-.46,1.06,-.08],[-.36,.95,-.20],.012,black);
  cyl(-.36,-.20,.026,.074,black,.887);
  const cz=-.64;
  cyl(0,cz,.036,.34,grey,.085);
  for(let i=0;i<5;i++) {
    const a=i*2*Math.PI/5, x=.23*Math.cos(a), z=cz+.23*Math.sin(a);
    rod(parts,[0,.115,cz],[x,.075,z],.015,grey);
    cyl(x,z,.032,.05,black,.023);
  }
  box(0,cz,.44,.42,.09,grey,.42,.04);
  box(0,cz-.19,.42,.072,.39,grey,.47,.035);
}

export function furnishNursery(parts) {
  const {box}=parts;
  // Facing the window, storage is on the left. Its fronts face the sofa.
  const cx=5.79, wz=.73;
  box(cx,wz,.55,1.08,1.94,walnut,.025);
  for(const z of [wz-.262,wz+.262]) {
    box(6.075,z,.036,.515,1.37,white,.57,.008);
    box(6.10,z+(z<wz?.18:-.18),.033,.018,.34,pine,1.09,.005);
  }
  for(const y of [.07,.32]) {
    box(6.075,wz,.036,1.04,.233,white,y,.006);
    box(6.104,wz,.034,.27,.022,pine,y+.16,.005);
  }
  const z0=1.39, step=.365, base=.055, rows=3;
  box(5.69,z0+2*step,.34,4*step,rows*step,black,base);
  for(let i=0;i<=4;i++) box(5.72,z0+i*step,.40,.022,rows*step,black,base);
  const bins=[0xd3d7d4,0x7b878e,0xe2dfd9,0xb4c4bd,0x9faeae,0xd7d6cb,null,0x9da9a4,
    0xc77d68,0xb5c8ca,0xd8d4c3,0x5b6670];
  for(let j=0;j<rows;j++) {
    box(5.72,z0+2*step,.40,4*step+.024,.023,black,base+j*step);
    for(let i=0;i<4;i++) {
      const color=bins[j*4+i], z=z0+(i+.5)*step, y=base+j*step+.024;
      if(color===null) continue;
      box(5.735,z,.35,step-.031,.324,color,y,.007);
      box(5.914,z,.009,.059,.018,black,y+.235,.005);
    }
  }
  const top=base+rows*step;
  box(5.72,z0+2*step,.42,4*step+.025,.032,black,top);
  const tvZ=z0+.73;
  box(5.72,tvZ,.24,.42,.023,black,top+.032,.008);
  box(5.71,tvZ,.056,.11,.085,black,top+.055);
  box(5.71,tvZ,.050,1.24,.714,black,top+.135,.012);
  const screen=box(5.738,tvZ,.009,1.212,.681,0x263032,top+.151);
  screen.material.roughness=.27;

  // The wooden easel stands in the corner between the desk and the sofa.
  const x=8.45,z=.47;
  for(const side of [-1,1]) rod(parts,[x+side*.22,.018,z+.14],[x+side*.055,1.39,z],.022,pine);
  rod(parts,[x,.018,z-.21],[x,1.31,z],.023,pine);
  box(x,z,.035,.045,1.51,pine,.03);
  box(x,z+.09,.52,.092,.043,pine,.57);
  box(x,z+.022,.29,.065,.033,pine,1.13);
  // Hinged at the jamb next to the TV, opening into the room.
  const leaf=box(5.66,3.68,.043,.80,2.015,white,.026,.008);
  leaf.rotation.y=-.16;
  box(5.752,3.38,.06,.018,.026,black,.965);
  box(5.784,3.405,.017,.084,.020,black,.968);
}

// A simplified wooden world map on the entrance wall. The cut-out shapes leave
// the wall visible between the continents, as in IMG_2353.
const mapArt=canvasMap(620,285,ctx=>{
  const land=[
    [[13,50],[40,34],[70,33],[86,21],[118,25],[140,16],[165,27],[150,47],[169,45],[160,63],[142,66],[137,81],[117,88],[104,106],[93,106],[104,127],[120,133],[133,148],[122,147],[104,137],[89,134],[82,117],[68,113],[56,96],[52,76],[38,62],[18,66],[29,52]],
    [[155,16],[185,6],[199,14],[194,34],[177,52],[163,49]],
    [[124,147],[142,139],[161,143],[176,157],[189,161],[198,170],[188,192],[172,202],[162,222],[148,235],[146,256],[138,267],[131,249],[133,224],[125,209],[125,190],[114,170]],
    [[271,111],[292,101],[313,107],[327,122],[350,129],[360,143],[348,159],[340,176],[332,198],[317,215],[305,211],[298,191],[294,165],[279,153],[264,154],[253,138],[255,124]],
    [[264,99],[273,83],[285,83],[290,72],[303,65],[311,43],[324,31],[333,37],[317,64],[331,60],[339,43],[356,39],[368,47],[387,35],[411,31],[432,34],[442,24],[460,28],[475,23],[499,37],[519,34],[546,43],[574,45],[591,56],[571,65],[555,59],[547,80],[528,92],[517,109],[499,118],[484,119],[483,133],[468,139],[464,157],[452,148],[447,130],[433,122],[422,144],[418,153],[407,143],[401,124],[383,115],[375,126],[361,135],[352,119],[342,112],[328,103],[317,101],[307,92],[294,96],[294,105],[281,98]],
    [[475,154],[480,148],[492,163],[493,173],[505,178],[521,180],[525,186],[507,187],[486,179]],
    [[492,212],[505,201],[518,203],[531,194],[542,198],[551,218],[543,236],[524,238],[512,230],[490,233],[484,222]],
    [[563,236],[570,228],[573,222],[578,225],[573,240],[561,248]],
    [[343,188],[350,178],[353,180],[349,196],[344,198]],
    [[538,104],[546,93],[549,96],[544,108],[537,116]],
    [[259,71],[263,65],[269,74],[266,84],[259,84]]
  ];
  for(const [i,points] of land.entries()) {
    ctx.save();ctx.beginPath();points.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
    ctx.fillStyle=i%3===0?'#81684f':'#ac9478';ctx.fill();ctx.clip();
    for(let j=0;j<68;j++){
      const x=(j*73)%620,y=(j*89)%278;
      ctx.fillStyle=['#584b42','#c5b29b','#94816d','#a49581'][j%4];
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y-5);ctx.lineTo(x+38,y+9);ctx.lineTo(x+26,y+27);ctx.lineTo(x+5,y+20);ctx.fill();
    }
    ctx.restore();
  }
});

export function finishNurseryWall(parts,length,face,kind,window) {
  const {box,mesh}=parts;
  function panel(x,y,w,h,color,offset=.003) {
    return mesh(new T.PlaneGeometry(w,h),x,y+h/2,face+offset,color);
  }
  if(window) {
    panel(0,0,length,.75,0xc9c1b7);
    panel(0,2.54,length,.16,0xc9c1b7);
    box(0,face+.035,length+.055,.15,.038,black,.735);
    for(const x of [-length/2+.024,0,length/2-.024]) box(x,0,.043,.05,1.79,black,.75);
    for(const y of [.75,2.50]) box(0,0,length,.053,.041,black,y);
    const glass=box(0,0,length-.04,.012,1.73,0xcddfe6,.79);
    glass.material.transparent=true;glass.material.opacity=.28;glass.material.depthWrite=false;glass.castShadow=false;
    const w=length/2+.045;
    for(const [side,bottom] of [[-1,2.08],[1,1.44]]) {
      const x=side*w/2;
      box(x,face+.075,w-.006,.021,2.65-bottom,0xd0cbc0,bottom);
      box(x+side*(w*.5-.05),face+.088,.022,.009,2.65-bottom,0x6f8897,bottom);
      for(let i=0;i<3;i++) box(x,face+.098,w-.006,.038,.028,0xc3bfb5,bottom+.018+i*.036,.007);
      box(x,face+.116,w-.006,.013,.018,0x6f8897,bottom+.01);
    }
    for(let i=0;i<11;i++) box(-.54+i*.075,face+.065,.068,.106,.48,white,.15,.009);
  } else {
    const paper=panel(0,0,length,2.7,kind==='pattern'?0xffffff:0xcac3b9);
    if(kind==='pattern'){
      const uv=paper.geometry.attributes.uv;
      for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*length/1.16,uv.getY(i)*2.7/1.16);
      paper.material.map=triangles;
      const x=1.47-length/2;
      const rim=mesh(new T.CylinderGeometry(.165,.165,.038,48),x,1.98,face+.028,0x503b34);
      rim.rotation.x=Math.PI/2;
      for(let j=0;j<12;j++){
        const a=j*Math.PI/6;
        const tick=box(x+.134*Math.sin(a),face+.051,.006,.005,.016,0xdbc9ae,1.98+.134*Math.cos(a)-.008);
        tick.rotation.z=-a;
      }
      rod(parts,[x,1.98,face+.054],[x+.051,2.072,face+.054],.005,white);
      rod(parts,[x,1.98,face+.054],[x-.029,1.923,face+.054],.006,white);
    }
    if(kind==='media') {
      const x=2.13-length/2, w=1.55;
      const bricks=canvasMap(360,480,ctx=>{
        ctx.fillStyle='#3e4140';ctx.fillRect(0,0,360,480);
        for(let row=0;row<36;row++)for(let col=-1;col<8;col++){
          ctx.fillStyle=['#303234','#333535','#373837'][(row+col+3)%3];
          ctx.fillRect(col*54+(row%2)*27,row*480/36,52,12);
        }
      });
      panel(x,0,w,2.7,0xffffff,.012).material.map=bricks;
      const ac=.68-length/2;
      box(ac,face+.103,.83,.209,.30,white,2.25,.033);
      box(ac,face+.207,.68,.012,.018,0x81847f,2.29);
    }
    if(kind==='map') {
      const art=panel(.14,1.11,1.66,.85,0xffffff,.012);
      art.scale.x=-1;
      art.material.map=mapArt;art.material.transparent=true;art.material.alphaTest=.45;
      art.castShadow=false;
    }
  }
  box(0,face+.012,length,.023,.066,white,.012);
}
