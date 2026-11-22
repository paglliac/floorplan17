// IMG_2356 looks along the long leg towards the nursery-side wardrobe.
// IMG_2359 looks along the entrance leg: shoe rack on the left, mirror on the right.
import * as T from 'three';

const white=0xe9e6df, frame=0xf3efe6, black=0x27282a;
const paper=document.createElement('canvas');
paper.width=paper.height=128;
const brush=paper.getContext('2d');
brush.fillStyle='#c6c1b5';brush.fillRect(0,0,128,128);
for(let i=0;i<64;i++) {
  brush.fillStyle=i%3?'#c2bdb2':'#cfcabe';brush.fillRect(i*2,0,1,128);
  brush.fillStyle='rgba(114,111,103,.11)';brush.fillRect(0,i*2,128,1);
}
const weave=new T.CanvasTexture(paper);
weave.colorSpace=T.SRGBColorSpace;
weave.wrapS=weave.wrapT=T.RepeatWrapping;

function sphere({mesh},x,y,z,rx,ry,rz,color) {
  const m=mesh(new T.SphereGeometry(1,16,12),x,y,z,color);
  m.scale.set(rx,ry,rz);
  return m;
}

function wardrobe(parts,x,z,width,side) {
  const {box}=parts,depth=.56,front=x+side*(depth/2+.012);
  box(x,z,depth-.07,width-.07,.078,0xb9b6ac,.016);
  box(x,z,depth,width,2.45,white,.084,.006);
  const dw=width/2-.006;
  for(const sign of [-1,1]) {
    const dz=z+sign*width/4;
    box(front,dz,.027,dw,2.414,0xe4e0d8,.092);
    const edgeX=front+side*.017;
    for(const edge of [-1,1]) box(edgeX,dz+edge*(dw/2-.029),.018,.056,2.414,frame,.092);
    for(const y of [.092,.54,1.01,1.48,1.95,2.453]) box(edgeX,dz,.018,dw-.095,.053,frame,y);
    sphere(parts,front+side*.041,1.02,z+sign*.042,.023,.016,.016,black);
  }
}

function shoe(parts,x,z,y,color) {
  const {box}=parts;
  box(x,z,.228,.086,.018,0xa6a49a,y,.007);
  sphere(parts,x,y+.037,z,.116,.032,.043,color);
  sphere(parts,x+.067,y+.052,z,.048,.043,.043,color);
  box(x+.062,z,.045,.052,.007,0x414140,y+.087,.003);
}

function shoeRack(parts) {
  const {box}=parts,x=8.60,z=6.16,width=1.10;
  for(const dx of [-.147,.147]) for(const dz of [-.535,.535]) box(x+dx,z+dz,.026,.026,.53,black,.017);
  for(const y of [.085,.255]){
    for(const dx of [-.135,-.070,0,.070,.135]) box(x+dx,z,.016,width,.017,black,y);
    for(const dz of [-.526,.526]) box(x,z+dz,.30,.022,.024,black,y-.006);
  }
  box(x,z,.337,width+.016,.042,0x333232,.475,.007);
  for(const [j,y] of [[0,.102],[1,.272]]) for(let i=0;i<4;i++){
    const zz=z-.38+i*.25;
    const color=(j?[0xb1b3a9,0x8c9693,0xe2e0d5,0xd1ccc0]:[0x4c413b,0x393a3d,0x68544a,0x444548])[i];
    for(const d of [-.049,.049])shoe(parts,x-.011,zz+d,y,color);
  }
  // Game boxes on the bench, at the entrance-door end in both oblique views.
  let top=.517;
  for(const [i,c] of [0x586675,0x887c96,0xc2ac6e,0x705447,0x939d91].entries()){
    const h=i===4?.036:.049,w=.31-i*.016,d=.36-i*.015;
    const book=box(x,z+.27,w,d,h,c,top,.004);
    book.rotation.y=i%2?.035:-.026;
    box(x-w/2-.002,z+.27,.005,d*.66,.009,0xded3ad,top+h*.48);
    top+=h;
  }
}

function backpack(parts,x,z,y,color,depth=.16) {
  const {box,mesh}=parts;
  box(x,z,depth,.238,.328,color,y,.048);
  box(x+depth/2,z,.050,.192,.17,0x66675f,y+.037,.024);
  const loop=mesh(new T.TorusGeometry(.042,.006,8,24),x,y+.327,z,black);
  loop.rotation.y=Math.PI/2;
}

export function furnishHall(parts) {
  wardrobe(parts,8.505,5.044,1.055,-1);
  wardrobe(parts,7.465,7.16,1.06,1);
  shoeRack(parts);
  backpack(parts,8.59,5.82,.517,0x36393a);
  backpack(parts,7.33,6.37,.021,0x888a7d);
  // A dark bag hangs from a hook on the exposed side of the entrance wardrobe.
  parts.box(7.50,6.613,.034,.051,.032,black,.92,.007);
  const strap=parts.mesh(new T.TorusGeometry(.075,.009,8,28),7.50,.80,6.59,black);
  strap.scale.y=1.6;
  parts.box(7.50,6.58,.27,.112,.31,0x444548,.385,.043);
}

export function finishHallWall(parts,length,face,kind) {
  const {box,mesh,mirror}=parts;
  if(kind==='frontDoor') {
    box(0,0,length-.062,.070,2.005,0x28292a,.024,.007);
    for(const side of [-1,1])box(side*(length/2-.018),0,.036,.16,2.065,0x383839,.013);
    box(0,0,length,.16,.057,0x383839,2.02);
    box(0,0,length,.12,.023,0x6b6b68,.013);
    sphere(parts,0,1.49,.041,.012,.012,.005,0xb7b7ad);
    for(const y of [.92,1.06]) box(length/2-.115,.043,.032,.012,.047,0x777b7c,y,.005);
    box(length/2-.115,.068,.021,.049,.022,0xb9bbbb,1.041);
    box(length/2-.157,.089,.105,.018,.016,0xadadad,1.043,.006);
    return;
  }
  const geom=new T.PlaneGeometry(length,2.7),uv=geom.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*length/.28,uv.getY(i)*2.7/.28);
  const surface=mesh(geom,0,1.35,face+.002,0xffffff);
  surface.material.map=weave;surface.castShadow=false;
  box(0,face+.013,length,.023,.066,frame,.015);
  if(kind==='laundry') {
    const x=6.205-6.80;
    box(x,face+.027,.69,.044,1.61,black,.47,.007);
    mirror('hall',new T.PlaneGeometry(.648,1.565),x,1.275,face+.051);
  }
  if(kind==='hallEnd') {
    const center=7.995, panel=center-8.31, intercom=center-8.62, vent=center-8.55;
    box(panel,face+.025,.325,.047,.218,white,1.40,.008);
    box(panel,face+.051,.271,.009,.124,0x525f62,1.449,.004);
    for(let i=0;i<7;i++)box(panel-.10+i*.028,face+.058,.020,.006,.036,0x777d76,1.49);
    box(intercom,face+.035,.057,.062,.194,white,1.17,.018);
    const cord=new T.CatmullRomCurve3([[intercom,1.18,.045],[intercom-.016,1.107,.052],[intercom+.021,1.103,.046],[intercom+.019,1.145,.023]].map(([x,y,z])=>new T.Vector3(x,y,z+face)));
    mesh(new T.TubeGeometry(cord,18,.004,6,false),0,0,0,white);
    box(intercom+.095,face+.015,.075,.024,.072,white,1.015,.005);
    box(vent,face+.040,.32,.077,.208,white,2.22,.009);
    for(let i=0;i<6;i++)for(const dx of [-.066,.066])box(vent+dx,face+.081,.112,.005,.007,0x74746c,2.254+i*.023);
  }
  if(kind==='entrySide')box(length/2-.16,face+.030,.13,.055,.17,white,2.23,.022);
}
