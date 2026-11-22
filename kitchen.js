import * as T from 'three';

export function furnishKitchen({box,cyl,mesh}) {
  const ivory=0xebe6db, black=0x272929, walnut=0x785138, timber=0xba885c;
  const surface=document.createElement('canvas');
  surface.width=512; surface.height=128;
  const ctx=surface.getContext('2d');
  ctx.fillStyle='#eee1ce'; ctx.fillRect(0,0,512,128);
  for(let i=0;i<760;i++){
    const y=(i*47.31)%128, x=(i*91.73)%512;
    ctx.strokeStyle=i%4?'rgba(90,57,30,.09)':'rgba(255,255,255,.26)';
    ctx.beginPath();ctx.moveTo(x-100,y);ctx.bezierCurveTo(x,y+3,x+15,y-3,x+130,y+1);ctx.stroke();
  }
  const grain=new T.CanvasTexture(surface);grain.colorSpace=T.SRGBColorSpace;
  function wood(x,z,w,d,h,color,y=0){let m=box(x,z,w,d,h,color,y,.009);m.material.map=grain;return m}
  function tube(points,r,color){
    let path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(path,24,r,8,false),0,0,0,color);
  }
  // The cabinet run faces into the room, with its window end at x=0.
  // Window end: microwave above the oven, then the freestanding fridge.
  const towerX=.38;
  box(towerX,7.37,.60,.63,1.54,ivory,.025,.008);
  box(towerX,7.04,.56,.035,.34,ivory,.105,.008);
  box(towerX,7.012,.15,.026,.016,black,.37);
  box(towerX,7.026,.56,.043,.59,black,.46,.012);
  box(towerX,6.999,.49,.012,.37,0x384044,.50,.012);
  box(towerX,6.976,.45,.040,.022,0x8a9093,.88,.006);
  for(const x of [.17,.59])box(x,6.995,.038,.027,.038,0x505453,.97,.012);
  box(towerX,6.999,.10,.012,.028,0x627c8e,.975);
  box(towerX,7.18,.53,.37,.31,0x272a2b,1.10,.013);
  box(.33,6.988,.36,.018,.22,0x41474a,1.145,.008);
  box(.605,6.989,.029,.020,.045,0x737679,1.17);
  box(1.01,7.31,.64,.70,1.91,black,.025,.025);
  for(const [base,h] of [[.05,.59],[.655,1.27]])box(1.01,6.947,.635,.06,h,0x303336,base,.02);
  box(1.02,6.91,.12,.008,.042,0x657071,1.48);
  box(2.75,7.38,2.80,.58,.87,0x989183,.025);
  for(let i=0;i<4;i++){
    let x=1.70+i*.70;
    for(const [y,h] of i<2?[[.11,.32],[.44,.24],[.69,.17]]:[[.11,.75]]){
      box(x,7.05,.69,.055,h,ivory,y,.008);
      tube([[x-.085,y+h-.065,7.02],[x-.08,y+h-.065,6.99],[x+.08,y+h-.065,6.99],[x+.085,y+h-.065,7.02]],.009,black);
    }
  }
  // Four countertop pieces leave a real opening for the recessed sink.
  wood(2.35,7.36,2.00,.67,.04,walnut,.87);
  wood(4.015,7.36,.27,.67,.04,walnut,.87);
  for(const z of [7.075,7.645])wood(3.615,z,.53,.10,.04,walnut,.87);
  box(3.615,7.36,.53,.47,.012,black,.895);
  box(3.615,7.36,.46,.40,.006,0x414447,.907);
  cyl(3.62,7.42,.036,.004,0x848582,.914);
  tube([[3.61,.91,7.62],[3.61,1.20,7.61],[3.61,1.24,7.49],[3.61,1.15,7.43]],.018,black);
  box(2.40,7.34,.62,.52,.014,black,.91,.012);
  for(const x of [2.25,2.55])for(const z of [7.21,7.46])cyl(x,z,.104,.003,0x454545,.925);
  cyl(2.40,7.34,.20,1.03,black,1.67);
  cyl(2.40,7.34,.17,.013,0x52534c,1.66);
  let kettle=cyl(2.25,7.22,.105,.12,0xb7b8b3,.93,.14);
  kettle.material.metalness=.55;kettle.material.roughness=.24;
  tube([[2.16,1.04,7.22],[2.21,1.14,7.22],[2.30,1.14,7.22],[2.34,1.04,7.22]],.013,black);
  for(const [x,y,w] of [[1.74,1.46,.74],[1.74,1.85,.74],[2.85,1.5,.79],[3.66,1.84,.80]]){
    wood(x,7.59,w,.20,.033,timber,y);
    if(x>3){wood(x,7.64,.36,.025,.24,walnut,y+.033);continue}
    for(let i=0;i<4;i++){
      let px=x-w*.32+i*w*.21,h=.10+.035*(i%3);
      cyl(px,7.59,.042,h,[ivory,0x5d5938,0x996549,0x667273][i],y+.033);
      cyl(px,7.59,.041,.018,timber,y+.033+h);
    }
  }
  // Runner with woven bands and alternating triangles.
  const rug=box(2.78,6.58,2.55,.74,.012,0xffffff,.017);
  const textile=document.createElement('canvas'); textile.width=512;textile.height=160;
  const brush=textile.getContext('2d');brush.fillStyle='#e9e2d3';brush.fillRect(0,0,512,160);
  for(let row=0;row<5;row++){brush.fillStyle='#bb9c68';brush.fillRect(0,row*32,512,3);brush.fillStyle=['#989a92','#353c43','#a2ae80'][row%3];for(let i=0;i<20;i++){let x=i*27;brush.beginPath();brush.moveTo(x,row*32+7);brush.lineTo(x+23,row*32+7);brush.lineTo(x+12,row*32+27);brush.fill()}}
  rug.material.map=new T.CanvasTexture(textile);rug.material.map.colorSpace=T.SRGBColorSpace;
  const tx=1.22,tz=6.03;
  cyl(tx,tz,.56,.045,timber,.745);
  for(const a of [0,1.57,3.14,4.71])cyl(tx+.36*Math.cos(a),tz+.36*Math.sin(a),.032,.74,timber,.015);
  for(const a of [.1,2.28,4.22]){
    const x=tx+.69*Math.cos(a),z=tz+.69*Math.sin(a);
    cyl(x,z,.205,.048,timber,.44);cyl(x,z,.185,.025,0xa59c81,.485);
    for(const dx of [-.14,.14])for(const dz of [-.14,.14])cyl(x+dx,z+dz,.019,.43,timber,.014);
    for(let i=-2;i<=2;i++){let b=a+i*.33;cyl(x+.20*Math.cos(b),z+.20*Math.sin(b),.014,.37,timber,.47)}
    const arc=Array.from({length:9},(_,i)=>[x+.20*Math.cos(a+(i-4)*.18),.84,z+.20*Math.sin(a+(i-4)*.18)]);
    tube(arc,.026,timber);
  }
  cyl(tx,tz,.075,.15,0xae907a,.79,.055);
  for(let i=0;i<9;i++){let a=i*2.4,x=tx+.14*Math.cos(a),z=tz+.14*Math.sin(a),y=1.08+i%3*.04;tube([[tx,.90,tz],[x,y,z]],.004,0x697552);let flower=mesh(new T.IcosahedronGeometry(.038,1),x,y,z,i%2?0xba8672:0xcbaa86);flower.scale.y=.7}
  wood(2.98,4.75,1.75,.44,.61,timber,.16);
  for(let x of [2.2,3.76])for(let z of [4.61,4.89])cyl(x,z,.033,.15,walnut,.015);
  for(let i=0;i<3;i++)wood(2.40+i*.58,4.983,.57,.025,.57,walnut,.18);
  for(let i=0;i<4;i++)box(3.46,4.76,.29,.20,.038,[ivory,walnut,0x766a53,ivory][i],.77+i*.039);
}
