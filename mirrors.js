import * as T from 'three';

// The viewer is orthographic, so reflected screen coordinates interpolate
// linearly across each mirror. Draw its view after the room and cut are set.
export function roomMirrors(mesh) {
  const mirrors=[];
  const reflected=new T.OrthographicCamera(), plane=new T.Plane();
  const position=new T.Vector3(), normal=new T.Vector3(), direction=new T.Vector3(), vertex=new T.Vector3();
  const clearColor=new T.Color();
  function add(room,geometry,x,y,z) {
    const target=new T.WebGLRenderTarget(512,512);
    const glass=mesh(geometry,x,y,z,0xffffff);
    glass.material.dispose();
    glass.material=new T.MeshBasicMaterial({map:target.texture,color:0xe4e9e7});
    glass.castShadow=glass.receiveShadow=false;
    geometry.computeBoundingBox();
    mirrors.push({room,glass,target});
    return glass;
  }
  function render(renderer,scene,camera,room,cut) {
    for(const {room:owner,glass,target} of mirrors) {
      if((room!==owner && room!=='all') || !glass.parent.visible) continue;
      glass.updateWorldMatrix(true,false);
      position.setFromMatrixPosition(glass.matrixWorld);
      normal.set(0,0,1).transformDirection(glass.matrixWorld);
      plane.setFromNormalAndCoplanarPoint(normal,position);
      if(plane.distanceToPoint(camera.position)<=0) continue;
      const coords=glass.geometry.attributes.position,uv=glass.geometry.attributes.uv;
      if(position.y+glass.geometry.boundingBox.min.y>=cut) continue;
      reflected.copy(camera,false);
      reflected.position.addScaledVector(normal,-2*plane.distanceToPoint(camera.position));
      camera.getWorldDirection(direction).reflect(normal);
      reflected.up.setFromMatrixColumn(camera.matrixWorld,1).reflect(normal);
      reflected.lookAt(direction.add(reflected.position));
      reflected.updateMatrixWorld();
      for(let i=0;i<coords.count;i++) {
        vertex.fromBufferAttribute(coords,i).applyMatrix4(glass.matrixWorld).project(reflected);
        uv.setXY(i,(vertex.x+1)/2,(vertex.y+1)/2);
      }
      uv.needsUpdate=true;
      const previousTarget=renderer.getRenderTarget(), previousClip=renderer.clippingPlanes;
      const alpha=renderer.getClearAlpha();
      renderer.getClearColor(clearColor);
      plane.constant-=.002;
      renderer.clippingPlanes=[plane];
      renderer.setClearColor(0xd1d1c9,1);
      glass.visible=false;
      renderer.setRenderTarget(target);
      renderer.render(scene,reflected);
      renderer.setRenderTarget(previousTarget);
      glass.visible=true;
      renderer.clippingPlanes=previousClip;
      renderer.setClearColor(clearColor,alpha);
    }
  }
  return {add,render};
}
