// IMG_2354 looks from the hall towards the shower. IMG_2355 looks across
// the room towards the washer. Dimensions are estimated within the plan axes.
import * as T from 'three';

const tile = await new T.TextureLoader().loadAsync(new URL('./textures/bath-tile.jpg', import.meta.url).href);
tile.colorSpace=T.SRGBColorSpace;
tile.wrapS=tile.wrapT=T.RepeatWrapping;
tile.anisotropy=4;
const ceramic=0xf1f1ec, black=0x212323, chrome=0xb6bfbe;
const tubX=4.67, tubZ=6.836, basinX=5.56, washerZ=6.25, toiletX=6.46;

function tiledPlane({mesh},x,y,z,width,height,color) {
  const geom=new T.PlaneGeometry(width,height);
  const uv=geom.attributes.uv;
  for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*width/2.4,uv.getY(i)*height/1.20);
  const part=mesh(geom,x,y,z,color);
  part.material.map=tile;
  part.castShadow=false;
  return part;
}

function pipe({mesh},points,r,color) {
  const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
  return mesh(new T.TubeGeometry(path,Math.max(12,points.length*7),r,10,false),0,0,0,color);
}

// A continuous ceramic profile goes up the apron, across the rim, then down
// into the bowl. Rows specify height, width, depth, corner shape and Z offset.
function vessel({mesh},x,z,rows,color) {
  const vertices=[],indices=[],segments=72;
  for(const [y,w,d,power,offset=0] of rows) {
    for(let i=0;i<segments;i++) {
      const a=i*2*Math.PI/segments,c=Math.cos(a),s=Math.sin(a);
      vertices.push(w*.5*Math.sign(c)*Math.pow(Math.abs(c),power), y,
        offset+d*.5*Math.sign(s)*Math.pow(Math.abs(s),power));
    }
  }
  for(let row=0;row<rows.length-1;row++) for(let i=0;i<segments;i++) {
    const a=row*segments+i,b=row*segments+(i+1)%segments;
    indices.push(a,a+segments,b,b,a+segments,b+segments);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const part=mesh(geometry,x,0,z,color);
  part.material.roughness=.35;
  return part;
}

function bathtub(parts) {
  const {box,cyl}=parts;
  vessel(parts,tubX,tubZ,[
    [.02,.70,1.64,.17],[.045,.735,1.67,.17],[.51,.751,1.70,.16],
    [.558,.765,1.72,.16],[.573,.756,1.71,.16],[.573,.652,1.585,.31],
    [.549,.627,1.56,.38],[.28,.51,1.28,.54,.045],[.177,.43,1.12,.64,.075],
    [.155,.34,.99,.67,.079],[.155,.001,.001,1,.079]
  ],ceramic);
  box(tubX+.37,tubZ,.018,1.62,.44,0xe6e6e0,.058,.009);
  cyl(tubX,tubZ+.49,.028,.004,chrome,.156);
  cyl(tubX,tubZ+.49,.009,.006,0x656b69,.157);
}

function vanity(parts) {
  const {box,cyl}=parts, z=7.466;
  // Wall-mounted two-drawer unit, with the basin moulded into the top.
  box(basinX,z,.65,.421,.48,0xebece8,.25,.018);
  for(const y of [.265,.523]) {
    box(basinX,z-.216,.632,.025,.243,ceramic,y,.010);
    pipe(parts,[[basinX-.087,y+.158,z-.229],[basinX-.072,y+.153,z-.251],
      [basinX+.072,y+.153,z-.251],[basinX+.087,y+.158,z-.229]],.008,chrome);
  }
  vessel(parts,basinX,z,[
    [.753,.63,.412,.23],[.777,.681,.456,.23],[.833,.692,.457,.23],
    [.844,.676,.449,.23],[.844,.562,.303,.58,-.024],
    [.819,.537,.278,.62,-.026],[.758,.397,.158,.75,-.022],
    [.743,.16,.075,.80,-.025],[.743,.001,.001,1,-.025]
  ],ceramic);
  cyl(basinX,z-.024,.022,.005,chrome,.745);
  cyl(basinX,z+.16,.023,.089,chrome,.844);
  pipe(parts,[[basinX,.911,z+.16],[basinX,.948,z+.149],[basinX,.944,z+.078],[basinX,.928,z+.068]],.012,chrome);
  for(const [dx,c,h] of [[-.23,0x594635,.102],[.18,0x416260,.086],[.245,0xc3aa78,.125]]) {
    box(basinX+dx,z+.148,.048,.044,h,c,.844,.008);
    cyl(basinX+dx,z+.148,.013,.02,chrome,.844+h);
  }
  // Low perforated step beside the vanity, visible at the foot of IMG_2354.
  const x=5.145,stepZ=7.26;
  for(const dx of [-.093,.093]) for(const dz of [-.072,.072])
    box(x+dx,stepZ+dz,.032,.035,.164,whitePlastic,.015,.005);
  box(x,stepZ,.24,.197,.039,whitePlastic,.169,.014);
  for(let i=0;i<4;i++) for(let j=0;j<3;j++)
    cyl(x-.073+i*.048,stepZ-.05+j*.05,.012,.002,0x8c8e84,.208);
}
const whitePlastic=0xdbdad1;

function toilet(parts) {
  const {box,cyl,mesh}=parts, z=7.40;
  // The bowl hangs off the installation on the back wall, as seen from the hall.
  box(toiletX,7.604,.305,.186,.232,ceramic,.157,.040);
  vessel(parts,toiletX,z,[
    [.128,.15,.225,.96,.07],[.148,.25,.35,.95,.055],[.23,.337,.46,.94,.027],
    [.355,.369,.525,.88],[.397,.372,.529,.85],[.407,.357,.513,.85],
    [.407,.279,.39,.94,-.016],[.38,.262,.37,.96,-.016],
    [.257,.146,.19,1,.005],[.25,.001,.001,1,.005]
  ],ceramic);
  vessel(parts,toiletX,z-.019,[
    [.411,.351,.497,.84],[.43,.361,.504,.84],[.437,.35,.497,.86],
    [.437,.263,.365,.96],[.412,.258,.36,.96]
  ],0xe8e9e4);
  const lid=mesh(new T.SphereGeometry(1,40,24),toiletX,.633,7.647,ceramic);
  lid.scale.set(.179,.237,.027);lid.rotation.x=.105;
  for(const dx of [-.10,.10]) cyl(toiletX+dx,7.611,.021,.025,chrome,.409);
}

function washer(parts) {
  const {box,mesh}=parts,x=6.769,z=washerZ,front=x-.282;
  box(x,z,.56,.604,.814,0xe9e9e5,.042,.018);
  for(const dx of [-.22,.22]) for(const dz of [-.24,.24]) box(x+dx,z+dz,.055,.055,.035,black,.012);
  box(front,z,.029,.584,.14,ceramic,.704,.008);
  box(front-.019,z-.172,.012,.196,.084,0xe2e2de,.723,.006);
  box(front-.027,z+.167,.012,.187,.074,0x2c3435,.738,.004);
  function disc(cx,cz,y,r,depth,color) {
    const m=mesh(new T.CylinderGeometry(r,r,depth,56),cx,y,cz,color);
    m.rotation.z=Math.PI/2;
    return m;
  }
  disc(front-.032,z-.008,.771,.042,.022,chrome);
  disc(front-.046,z-.008,.771,.034,.009,black);
  disc(front-.016,z,.417,.215,.032,0xc5c9c7);
  disc(front-.034,z,.417,.199,.026,black);
  disc(front-.05,z,.417,.16,.012,0x414b50).material.roughness=.16;
  const rim=mesh(new T.TorusGeometry(.175,.011,12,64),front-.059,.417,z,0x737f83);
  rim.rotation.y=-Math.PI/2;
  // Laundry basket alongside the machine, with a fabric lid and bamboo edging.
  const bz=6.85;
  box(6.802,bz,.495,.488,.644,0xdfd7bf,.021,.033);
  box(6.802,bz,.505,.502,.028,0xb09470,.656,.012);
  box(6.802,bz,.483,.481,.021,0xe7e0cf,.682,.009);
  box(6.565,bz,.024,.076,.017,0xafaa9b,.687,.005);
  for(const [i,c] of [0x727975,0x6993a1,0xa09d91].entries())
    box(x+.034,z+.135,.30,.21,.031,c,.858+i*.032,.014);
}

export function furnishBathroom(parts) {
  // This finish also shows over the whole-apartment slab.
  const floor=tiledPlane(parts,5.675,.016,6.80,2.89,1.94,0x9e9e9b);
  floor.rotation.x=-Math.PI/2;
  bathtub(parts);
  vanity(parts);
  washer(parts);
  toilet(parts);
}

function shower(parts,x,face) {
  const {box,cyl,mesh}=parts, mount=face+.045;
  box(x,mount,.205,.085,.052,black,.965,.014);
  for(const y of [1.16,1.83]) box(x,face+.026,.066,.052,.061,black,y,.013);
  pipe(parts,[[x,1.01,mount],[x,1.75,mount],[x,2.13,mount],[x,2.185,mount+.04],
    [x,2.185,mount+.29]],.013,black);
  box(x,mount+.31,.244,.217,.029,black,2.153,.012);
  box(x,mount+.31,.216,.19,.005,0x434545,2.148,.002);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)
    cyl(x-.075+i*.05,mount+.24+j*.047,.005,.004,0x858886,2.145);
  pipe(parts,[[x-.063,.981,mount+.012],[x-.080,.76,mount+.086],[x-.05,.56,mount+.16],
    [x+.02,.59,mount+.18],[x+.04,.92,mount+.12],[x+.041,1.36,mount+.05]],.008,black);
  pipe(parts,[[x+.041,1.34,mount+.055],[x+.084,1.51,mount+.070]],.015,black);
  const head=box(x+.091,mount+.079,.095,.04,.083,black,1.49,.01);
  head.rotation.z=-.24;
  // Black rail runs from the tiled rear wall to the wall by the door.
  const railX=x-.335;
  pipe(parts,[[railX,2.38,face],[railX,2.38,face+1.82]],.012,black);
  const width=.49,h=1.70,geom=new T.PlaneGeometry(width,h,64,6);
  const pos=geom.attributes.position,uv=geom.attributes.uv;
  for(let i=0;i<pos.count;i++) {
    const u=uv.getX(i),v=uv.getY(i),wave=Math.cos(2*Math.PI*7*u);
    pos.setXYZ(i,.032*wave+.016*Math.sin(6*v+u),pos.getY(i)+.012*wave*(1-v),u*width);
  }
  geom.computeVertexNormals();
  const curtain=mesh(geom,railX,1.455,face+.11,0xe4dfd4);
  curtain.material.side=T.DoubleSide;
  for(let i=0;i<8;i++) {
    const ring=mesh(new T.TorusGeometry(.026,.0035,8,18),railX,2.353,face+.11+i*width/7,whitePlastic);
    ring.castShadow=false;
  }
}

function towelRail(parts,x,face) {
  const {box,cyl}=parts, z=face+.097;
  for(const side of [-1,1]) {
    const sx=x+side*.245;
    cyl(sx,z,.015,.88,chrome,1.12);
    for(const y of [1.14,1.93]) pipe(parts,[[sx,y,face],[sx,y,z]],.017,chrome);
  }
  for(const y of [1.17,1.32,1.46,1.60,1.74,1.88])
    pipe(parts,[[x-.245,y,z],[x,y,z+.021],[x+.245,y,z]],.011,chrome);
  box(x,z,.43,.115,.065,black,2.001,.009);
  for(const [dx,y,w,h,c] of [[-.09,1.88,.19,.14,0x666771],[.10,1.88,.18,.12,0x969599],
    [-.035,1.60,.30,.265,0x3e4143],[-.07,1.32,.24,.245,0x655750]]) {
    box(x+dx,z+.04,w,.038,h,c,y-h,.016);
    box(x+dx,z+.020,w,.071,.021,c,y-.012,.009);
  }
}

// Wall-local +Z points into the bathroom; the rear wall's +X points to the tub.
export function finishBathroomWall(parts,length,face,kind) {
  const {box,mesh}=parts;
  tiledPlane(parts,0,1.35,face+.002,length,2.70,0xffffff);
  if(kind==='bathBack') {
    const x=5.675-basinX;
    const edge=mesh(new T.CylinderGeometry(.311,.311,.024,80),x,1.435,face+.021,0x939b97);
    edge.rotation.x=Math.PI/2;
    parts.mirror('bath',new T.CircleGeometry(.306,80),x,1.435,face+.035);
    box(5.675-toiletX,face+.016,.222,.027,.145,chrome,.946,.011);
    for(const [dx,r] of [[-.046,.037],[.039,.026]]) {
      const button=mesh(new T.CircleGeometry(r,28),5.675-toiletX+dx,1.022,face+.031,0x747d7a);
      button.castShadow=false;
    }
    box(5.675-toiletX,face+.011,.28,.016,.40,0xe6e2d7,1.30,.004);
    const hook=x+.40;
    box(hook,face+.022,.035,.044,.035,chrome,1.30,.007);
    const towel=box(hook,face+.055,.14,.041,.37,0xb3a99b,.95,.017);
    towel.rotation.z=-.07;
    shower(parts,5.675-tubX,face);
  }
  if(kind==='laundry') towelRail(parts,washerZ-6.80,face);
}
