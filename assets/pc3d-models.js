import {BOARD_SIZE,BOARD_MOUNTS} from './pc3d-layout.js';
import * as T from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
export const materials={
  steel:new T.MeshStandardMaterial({color:0x242a30,metalness:.75,roughness:.35}),edge:new T.MeshStandardMaterial({color:0x45505b,metalness:.8,roughness:.35}),black:new T.MeshStandardMaterial({color:0x14191e,metalness:.3,roughness:.5}),board:new T.MeshStandardMaterial({color:0x171d20,metalness:.35,roughness:.6}),silver:new T.MeshStandardMaterial({color:0xb4bbc2,metalness:.75,roughness:.32}),gold:new T.MeshStandardMaterial({color:0xc4a661,metalness:.85,roughness:.3}),green:new T.MeshStandardMaterial({color:0xb6e76a,metalness:.2,roughness:.5}),dark:new T.MeshStandardMaterial({color:0x080c10,roughness:.8}),paste:new T.MeshStandardMaterial({color:0xb8bdc4,roughness:.65}),white:new T.MeshStandardMaterial({color:0xc4ccd2,metalness:.3,roughness:.5})
};
export function box(parent,size,pos,material=materials.steel){const m=new T.Mesh(new RoundedBoxGeometry(...size,2,Math.min(.018,Math.min(...size)*.2)),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function cylinder(parent,radius,length,pos,material=materials.silver,axis='x',segments=20){const m=new T.Mesh(new T.CylinderGeometry(radius,radius,length,segments),material);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(...pos);m.castShadow=true;parent.add(m);return m;}
function decal(parent,text,pos,w=.6,h=.12,axis='x',color='#a6b5bf'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#111a20';ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 45px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));m.position.set(...pos);if(axis==='x')m.rotation.y=-Math.PI/2;if(axis==='y')m.rotation.x=-Math.PI/2;parent.add(m);return m;
}
function screw(parent,pos,axis='x',material=materials.silver){const m=cylinder(parent,.035,.022,pos,material,axis,12);const g=new T.Group();g.position.copy(m.position);if(axis==='x')g.rotation.z=Math.PI/2;if(axis==='z')g.rotation.x=Math.PI/2;box(g,[.043,.025,.008],[0,0,0],materials.dark);parent.add(g);return m;}
function fan(parent,pos,axis='z',size=.9){
  const g=new T.Group();g.position.set(...pos);if(axis==='x')g.rotation.y=Math.PI/2;if(axis==='y')g.rotation.x=Math.PI/2;parent.add(g);
  box(g,[size,.07,.12],[0,size/2,0],materials.black);box(g,[size,.07,.12],[0,-size/2,0],materials.black);box(g,[.07,size,.12],[size/2,0,0],materials.black);box(g,[.07,size,.12],[-size/2,0,0],materials.black);
  const ring=new T.Mesh(new T.TorusGeometry(size*.44,.035,8,40),materials.edge);g.add(ring);const rotor=new T.Group();g.add(rotor);
  cylinder(rotor,size*.13,.12,[0,0,0],materials.edge,'z');
  for(let i=0;i<9;i++){const blade=new T.Mesh(new T.BoxGeometry(size*.15,size*.32,.035),materials.black);const a=i*Math.PI*2/9;blade.position.set(Math.sin(a)*size*.27,Math.cos(a)*size*.27,0);blade.rotation.z=-a+.5;blade.rotation.x=.18;rotor.add(blade);}
  for(const x of [-1,1])for(const y of [-1,1])screw(g,[x*size*.43,y*size*.43,.08],'z');return rotor;
}
export function buildCase(scene){
  const group=new T.Group();scene.add(group);const fans=[];
  box(group,[2.2,.09,4.3],[0,.02,0]);box(group,[.055,3.55,3.8],[1,2.33,0]); // mounting and routing tray
  box(group,[2.2,.055,4.3],[0,4.3,0]);
  for(const x of [-1.08,1.08])for(const z of [-2.1,2.1])box(group,[.08,4.3,.08],[x,2.15,z],materials.edge);
  for(const y of [.12,4.2])for(const x of [-1.05,1.05])box(group,[.06,.07,4.1],[x,y,0],materials.edge);
  box(group,[2.08,.06,4.04],[0,.88,0],materials.steel); // PSU shroud
  // Rear wall is built around the physical I/O and fan apertures.
  box(group,[2.12,.09,.055],[0,.08,-2.14]);box(group,[2.12,.13,.055],[0,4.17,-2.14]);
  box(group,[.16,3.95,.055],[-1,2.15,-2.14]);box(group,[.17,3.95,.055],[.99,2.15,-2.14]);
  box(group,[.12,3.05,.055],[.47,2.57,-2.14]);
  box(group,[1.25,.12,.055],[-.3,2.68,-2.14]);box(group,[.6,1.2,.055],[.75,1.57,-2.14]);
  // Vent perforations are open geometry rather than a solid painted surface.
  for(let y=2.85;y<4.05;y+=.1)box(group,[1.15,.018,.026],[-.23,y,-2.15],materials.edge);
  for(let x=-.74;x<.35;x+=.1)box(group,[.018,1.2,.026],[x,3.45,-2.15],materials.edge);
  for(let y=1.05;y<2.55;y+=.21){box(group,[1.1,.07,.04],[-.25,y,-2.14]);}
  // Front face and real recessed grille.
  box(group,[.18,4.15,.14],[-.98,2.15,2.12]);box(group,[.18,4.15,.14],[.98,2.15,2.12]);
  box(group,[2.1,.32,.17],[0,4.12,2.12]);box(group,[2.1,.32,.17],[0,.2,2.12]);
  for(let x=-.82;x<.9;x+=.105)box(group,[.018,3.45,.04],[x,2.1,2.19],materials.edge);
  for(const y of [1.15,2.35,3.55])fans.push(fan(group,[0,y,1.96],'z',1.06));
  // Front I/O, switch, USB sockets and audio jack.
  cylinder(group,.065,.022,[-.2,4.05,2.22],materials.green,'z');
  for(const x of [-.62,-.4]){box(group,[.16,.07,.05],[x,4.05,2.22],materials.dark);box(group,[.1,.018,.055],[x,4.05,2.25],materials.edge);}
  cylinder(group,.035,.025,[.15,4.05,2.22],materials.dark,'z');
  decal(group,'TECH-HUB',[.6,4.06,2.22],.55,.1,'z');
  // Tray grommets and standoffs.
  for(const y of [1.3,2.15,3.25]){box(group,[.08,.55,.28],[.93,y,.77],materials.dark);for(let i=0;i<4;i++)box(group,[.085,.012,.22],[.89,y-.16+i*.1,.77],materials.black);}
  for(const [y,z] of BOARD_MOUNTS)cylinder(group,.045,.18,[.88,2.65+y,-.65+z],materials.gold);
  for(const x of [-.8,.8])for(const z of [-1.7,1.7])box(group,[.26,.15,.3],[x,-.08,z],materials.black);
  const panels=new T.Group();group.add(panels);
  const glass=new T.MeshPhysicalMaterial({color:0x6c8391,transparent:true,opacity:.17,metalness:.1,roughness:.15,side:T.DoubleSide,depthWrite:false});
  box(panels,[.04,4.05,4.02],[-1.12,2.14,0],glass);box(panels,[.04,4.05,4.02],[1.12,2.14,0],materials.steel);panels.visible=false;
  const covers=new T.Group();group.add(covers);for(const y of [1.72,1.93]){box(covers,[1.15,.17,.04],[-.22,y,-2.17],materials.steel);for(let i=0;i<6;i++)box(covers,[.018,.09,.045],[-.6+i*.15,y,-2.2],materials.dark);}
  const table=box(scene,[14,.18,11],[0,-.25,0],new T.MeshStandardMaterial({color:0x11191d,roughness:.85}));table.receiveShadow=true;
  const mat=box(scene,[3.1,.025,5],[-3.05,-.14,0],new T.MeshStandardMaterial({color:0x1c302e,roughness:1}));
  for(let z=-2.4;z<2.5;z+=.25)box(scene,[3.05,.003,.006],[-3.05,-.124,z],materials.edge);
  decal(scene,'COMPONENT STAGING',[-3.05,-.1,2.15],2.5,.17,'y','#99ad9f');
  return {group,panels,covers,fans};
}
export function makePart(key){
  const g=new T.Group();g.userData.part=key;
  if(key==='motherboard'){
    box(g,[.016,BOARD_SIZE.height,BOARD_SIZE.width],[0,0,0],materials.board);
    // Original geometry: no unrelated photograph on the PCB.
    // Copper traces and solder pads on the PCB.
    for(let i=0;i<28;i++){const y=-1.2+i*.086;box(g,[.004,.007,1.12],[-.027,y,-.38+(i%4)*.14],i%3?materials.edge:materials.gold);}
    for(let i=0;i<32;i++)cylinder(g,.014,.009,[-.034,-1.1+(i%8)*.3,-1+(Math.floor(i/8))*.56],materials.silver,'x',6);
    // AM4 uses a ZIF lever, without an Intel-style load plate.
    box(g,[.075,.54,.54],[-.055,.48,-.1],materials.white);
    box(g,[.012,.45,.45],[-.1,.48,-.1],materials.dark);
    const holes=new T.InstancedMesh(new T.CylinderGeometry(.004,.004,.006,5),materials.dark,400);
    const t=new T.Object3D();let n=0;
    for(let r=0;r<20;r++)for(let c=0;c<20;c++){
      t.position.set(-.111,.275+r*.0215,-.305+c*.0215);t.rotation.z=Math.PI/2;t.updateMatrix();holes.setMatrixAt(n++,t.matrix);
    }g.add(holes); // representative field, not a pin-count diagram
    const lever=new T.Group();lever.position.set(-.12,.78,.22);g.add(lever);
    cylinder(lever,.012,.58,[0,-.29,0],materials.silver,'y');
    cylinder(lever,.02,.12,[-.045,-.58,0],materials.silver,'x');g.userData.lever=lever;
    decal(g,'AM4',[-.12,.48,-.1],.21,.065);
    // VRM heatsinks, capacitors, and labeled header blocks.
    for(const p of [[-.17,.53,-.72],[-.17,1.03,-.1]]){box(g,[.22,.35,.45],p,materials.black);for(let i=0;i<6;i++)box(g,[.24,.022,.43],[p[0]-.01,p[1]-.13+i*.05,p[2]],materials.edge);}
    for(let i=0;i<10;i++)cylinder(g,.039,.09,[-.09,.1+(i%5)*.17,-.75+Math.floor(i/5)*.16],materials.silver);
    for(const z of [.58,.73,.88,1.03]){box(g,[.055,1.45,.065],[-.07,.38,z],materials.dark);box(g,[.005,1.22,.014],[-.102,.38,z],materials.gold);}
    const clips=[];for(const z of [.73,1.03]){const pair=[];for(const y of [-.38,1.14]){const clip=box(g,[.09,.1,.09],[-.09,y,z],materials.white);pair.push(clip);}clips.push(pair);}g.userData.clips=clips;
    for(const y of [-.83,-.59]){box(g,[.07,.08,1.4],[-.08,y,-.13],materials.dark);box(g,[.01,.014,1.25],[-.125,y,-.13],materials.gold);}
    box(g,[.15,.45,.52],[-.1,-.4,.55],materials.black);decal(g,'B550 / REFERENCE',[-.19,-.4,.55],.45,.1);
    for(const y of [.65,.89,1.13]){box(g,[.34,.18,.25],[-.2,y,-1.35],materials.silver);box(g,[.2,.09,.035],[-.2,y,-1.49],materials.dark);}
    for(const y of [.12,.36]){box(g,[.34,.18,.25],[-.2,y,-1.35],materials.silver);box(g,[.2,.08,.025],[-.2,y,-1.49],materials.dark);}
    for(const z of [.96,1.08])box(g,[.13,.18,.11],[-.11,-1.02,z],materials.black);
    const screws=[];for(const [y,z] of BOARD_MOUNTS){
      const ring=new T.Mesh(new T.TorusGeometry(.043,.009,6,16),materials.silver);ring.rotation.y=Math.PI/2;ring.position.set(-.02,y,z);g.add(ring);
      screws.push(screw(g,[-.04,y,z]));
    }g.userData.screws=screws;
    decal(g,'DDR4',[-.04,-.53,.86],.5,.1);decal(g,'PCIe x16',[-.04,-.72,-.3],.6,.09);
  }else if(key==='cpu'){
    box(g,[.035,.43,.43],[0,0,0],materials.board);box(g,[.034,.37,.37],[-.027,0,0],materials.silver);decal(g,'RYZEN',[-.047,0,0],.27,.09);
    const pins=new T.InstancedMesh(new T.CylinderGeometry(.003,.003,.025,5),materials.gold,324);
    const t=new T.Object3D();let n=0;
    for(let r=0;r<18;r++)for(let c=0;c<18;c++){
      t.position.set(.03,-.178+r*.021,-.178+c*.021);t.rotation.z=Math.PI/2;t.updateMatrix();pins.setMatrixAt(n++,t.matrix);
    }g.add(pins); // representative pins, not a complete electrical map
    const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(.065,0);shape.lineTo(0,.065);shape.closePath();const marker=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:0xf8d775,side:T.DoubleSide}));marker.rotation.y=-Math.PI/2;marker.position.set(-.048,-.185,-.185);g.add(marker);
  }else if(key==='cooler'){
    box(g,[.05,.4,.4],[.15,0,0],materials.silver);
    for(let i=0;i<19;i++)box(g,[.49,.018,.55],[-.08,-.32+i*.035,0],materials.silver);
    for(const z of [-.18,0,.18])cylinder(g,.028,.65,[.03,0,z],materials.gold,'y');
    g.userData.rotor=fan(g,[-.36,0,0],'x',.64);
    const screws=[];for(const y of [-.38,.38])for(const z of [-.37,.37])screws.push(screw(g,[-.08,y,z]));g.userData.screws=screws;
  }else if(key.startsWith('ram')){
    box(g,[.32,1.25,.022],[-.08,0,0],materials.board);box(g,[.28,1.17,.045],[-.12,0,0],materials.black);
    for(let i=0;i<7;i++)box(g,[.24,.1,.012],[-.12,-.46+i*.15,.032],materials.edge);
    for(let i=0;i<22;i++)box(g,[.015,.031,.04],[.027,-.55+i*.05,-.065],materials.gold);
    const label=decal(g,'DDR4 16GB',[-.1,0,.042],.9,.09,'z');label.rotation.z=Math.PI/2;
  }else if(key==='gpu'){
    box(g,[1.35,.045,3.5],[0,0,0],materials.board);box(g,[.15,.035,1.2],[.71,0,-.2],materials.gold);box(g,[1.3,.28,3.45],[0,.18,0],materials.black);
    for(let i=0;i<18;i++)box(g,[1.22,.014,3.35],[0,.04+i*.012,0],materials.edge);
    for(const z of [-.9,.9])g.userData.rotor=fan(g,[0,.37,z],'y',.78);
    box(g,[1.38,.44,.035],[0,.15,-1.84],materials.silver); // rear bracket reaches the case opening
    for(const x of [-.42,-.12,.2])box(g,[.23,.09,.06],[x,.16,-1.88],materials.dark);
    decal(g,'GRAPHICS',[-.69,.16,0],1,.14);
  }else if(key==='psu'){
    box(g,[1.32,.7,1.35],[0,0,0],materials.steel);g.userData.rotor=fan(g,[0,.37,0],'y',.93);
    for(let i=0;i<8;i++)box(g,[.018,.51,.02],[-.52+i*.14,0,-.69],materials.dark);
    box(g,[.28,.22,.05],[-.28,-.05,-.72],materials.dark);box(g,[.1,.12,.05],[.29,-.05,-.72],materials.dark);
    decal(g,'650W / MODULAR',[-.67,0,0],1,.16);
    const screws=[];for(const x of [-.55,.55])for(const y of [-.24,.24])screws.push(screw(g,[x,y,-.71],'z'));g.userData.screws=screws;
  }else if(key==='ssd'){
    box(g,[.09,.65,.95],[0,0,0],materials.black);decal(g,'SATA SSD / 1TB',[-.05,0,0],.78,.16);
    box(g,[.02,.055,.3],[-.065,-.2,.25],materials.gold);box(g,[.02,.055,.16],[-.065,-.1,.25],materials.gold);
  }else if(key==='fan'){g.userData.rotor=fan(g,[0,0,0],'z',1.12);}
  return g;
}
export function makeConnector(pos,color=0xc5f56b,kind='default'){
  const g=new T.Group();g.position.set(...pos);const shell=new T.MeshStandardMaterial({color:0x232d33,metalness:.2,roughness:.4});
  const rows=kind==='atx'?12:['eps','gpuPower'].includes(kind)?4:kind.startsWith('sata')?1:2;
  const height=kind.startsWith('sata')?.065:rows*.035+.025,depth=kind==='sataPower'?.27:kind==='sataData'?.15:.13;
  box(g,[.09,height,depth],[0,0,0],shell);box(g,[.03,height*.35,.025],[-.02,0,depth/2+.01],materials.black);
  for(let i=0;i<rows;i++)for(const z of [-.032,.032]){box(g,[.014,.022,.022],[-.051,(i-(rows-1)/2)*.035,z],materials.dark);box(g,[.015,.01,.01],[-.055,(i-(rows-1)/2)*.035,z],materials.gold);}
  const halo=new T.Mesh(new T.SphereGeometry(.08,12,8),new T.MeshBasicMaterial({color,transparent:true,opacity:.2,depthWrite:false}));g.add(halo);return g;
}
