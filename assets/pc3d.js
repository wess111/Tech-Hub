import {BOARD_SCREW_COUNT} from './pc3d-layout.js';
import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {PARTS,CABLES,freshState,sanitizeState,has,canInstall,install,canRemove,cableReady,validate,postChecks} from './pc3d-rules.js';
import {materials,box,cylinder,buildCase,makePart,makeConnector} from './pc3d-models.js';

const $=s=>document.querySelector(s),stage=$('#stage'),overlay=$('#anchors');
const storageKey='tech-hub-3d-build-v2';
let state;try{state=sanitizeState(JSON.parse(localStorage.getItem(storageKey)));}catch{state=freshState();}
let selected=null,mode='assembly',rotation=0,drag=null,pasteTool=false,painting=false,lastPaste=0,cableKey='atx',routing=null,cableDrag=false,routeBehind=false,hoverPoint=null;
const scene=new T.Scene();scene.background=new T.Color(0x111c23);scene.fog=new T.Fog(0x111c23,20,50);
const camera=new T.PerspectiveCamera(39,1,.05,80);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){$('#loading').innerHTML='This lab needs WebGL. Try a browser with hardware acceleration enabled.';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.outputColorSpace=T.SRGBColorSpace;
const pmrem=new T.PMREMGenerator(renderer);const studio=new RoomEnvironment();const environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;scene.environmentIntensity=.8;studio.dispose();pmrem.dispose();
renderer.domElement.setAttribute('aria-label','3D PC case and component staging area. Camera views and assembly controls are also available as buttons.');stage.prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.6;controls.maxDistance=19;controls.maxPolarAngle=Math.PI*.97;
scene.add(new T.HemisphereLight(0xe2f4ff,0x344333,3));
const workLight=new T.PointLight(0xf5faff,18,12,2);workLight.position.set(-3,4,0);scene.add(workLight);
const keyLight=new T.DirectionalLight(0xf5f4e9,4);keyLight.position.set(-5,8,4);keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);Object.assign(keyLight.shadow.camera,{left:-7,right:7,top:8,bottom:-5,near:.5,far:24});keyLight.shadow.bias=-.0005;scene.add(keyLight);
const fill=new T.DirectionalLight(0x9dc9ff,2);fill.position.set(4,5,-5);scene.add(fill);const rim=new T.DirectionalLight(0xc4e698,1.5);rim.position.set(-3,3,-5);scene.add(rim);
const chassis=buildCase(scene),parts={},staging={},wireGroup=new T.Group(),portGroup=new T.Group(),pasteGroup=new T.Group();scene.add(wireGroup,portGroup,pasteGroup);
const keys=Object.keys(PARTS);
keys.forEach((k,i)=>{const p=makePart(k);p.name=k;scene.add(p);parts[k]=p;staging[k]=new T.Vector3(-2.4-Math.floor(i/3)*.9,.2,-1.6+(i%3)*1.35);});
const raycaster=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(),point=new T.Vector3();
const ghost=new T.Mesh(new T.BoxGeometry(.06,.3,.3),new T.MeshBasicMaterial({color:0xc5f56b,transparent:true,opacity:.22,depthWrite:false}));scene.add(ghost);ghost.visible=false;
const syringe=new T.Group();cylinder(syringe,.055,.5,[0,0,0],materials.white);cylinder(syringe,.012,.23,[.34,0,0],materials.silver);cylinder(syringe,.065,.04,[-.28,0,0],materials.black);scene.add(syringe);syringe.rotation.set(0,.3,-.65);syringe.visible=false;
let anchorRecords=[],wireMeshes=[],dynamicWire=null,dragPlug=null;

function message(text,code='ASSEMBLY'){ $('#message').textContent=text;$('#code').textContent=code; }
function save(){state.powered=Boolean(state.powered);try{localStorage.setItem(storageKey,JSON.stringify(state));$('#saved').textContent='Saved locally';}catch{$('#saved').textContent='Storage unavailable';}}
function disposeMesh(m){if(m.geometry)m.geometry.dispose();if(Array.isArray(m.material))m.material.forEach(x=>x.dispose());else m.material?.dispose();}
function view(name){
  const views={inside:[-5.6,4.5,5.1],front:[-.2,2.5,10],rear:[-.4,2.8,-10],side:[-10,2.7,0],cable:[8,3.8,2],top:[-.01,12,.01]};
  camera.position.set(...views[name]);controls.target.set(0,2.1,0);controls.update();
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
}
function focusCPU(){camera.position.set(-2.3,3.22,-.65);controls.target.set(.6,3.13,-.75);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function worldToScreen(pos){const p=new T.Vector3(...pos).project(camera);return {x:(p.x+1)*stage.clientWidth/2,y:(1-p.y)*stage.clientHeight/2,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1};}
function addAnchor(name,pos,fn,type='target',down=null){const b=document.createElement('button');b.className='anchor '+type;b.textContent=name;b.setAttribute('aria-label',name);b.onclick=e=>{e.stopPropagation();fn();};if(down)b.onpointerdown=e=>{e.preventDefault();e.stopPropagation();down(e);};overlay.append(b);anchorRecords.push({element:b,pos});}
function clearAnchors(){overlay.replaceChildren();anchorRecords=[];}
function renderAnchors(){
  clearAnchors();ghost.visible=false;
  if(mode==='cables'){
    if(!cableReady(state,cableKey)){message('Install '+CABLES[cableKey].parts.map(k=>PARTS[k].name).join(' and ')+' before connecting this cable.','CABLE ROUTING');return;}
    const c=CABLES[cableKey];
    addAnchor(c.source,c.from,()=>beginCable(), 'source',()=>{beginCable();cableDrag=true;controls.enabled=false;});
    addAnchor(c.dest,c.to,()=>finishCable());
    return;
  }
  if(pasteTool)return;
  if(!selected)return;
  if(!has(state,selected)){
    const target=PARTS[selected].target;
    ghost.position.set(...target);const dimensions={motherboard:[.06,2.7,2.3],cpu:[.08,.45,.45],cooler:[.5,.7,.7],ramA2:[.12,1.3,.1],ramB2:[.12,1.3,.1],gpu:[1.4,.3,3.5],psu:[1.4,.8,1.4],ssd:[.15,.7,1],fan:[1.1,1.1,.1]}[selected];
    ghost.geometry.dispose();ghost.geometry=new T.BoxGeometry(...dimensions);ghost.material.color.setHex(canInstall(state,selected,rotation)?0xd8a967:0xc5f56b);ghost.visible=state.panelsOpen;
    addAnchor(({motherboard:'Motherboard standoffs',cpu:'CPU socket',cooler:'CPU cooler mount',ramA2:'DIMM A2 slot',ramB2:'DIMM B2 slot',gpu:'PCIe x16 slot',psu:'PSU bay',ssd:'SATA drive cage',fan:'Rear fan mount'})[selected],target,()=>seat());
  }
}
function addAction(label,fn,kind='secondary',disabled=false){const b=document.createElement('button');b.className='action '+kind;b.textContent=label;b.disabled=disabled;b.onclick=fn;$('#actions').append(b);}
function updateInspector(){
  $('#actions').replaceChildren();$('#cablePanel').hidden=mode!=='cables';$('#assemblyMode').setAttribute('aria-pressed',String(mode==='assembly'));$('#cableMode').setAttribute('aria-pressed',String(mode==='cables'));
  if(mode==='cables'){$('#inspectorLabel').textContent='Connector-to-connector routing';$('#selectedName').textContent=CABLES[cableKey].name;$('#selectedDetail').textContent=state.cables[cableKey]?'Connected. The cable follows the saved physical route.':'Choose the source connector, route the cable, then connect its destination.';renderAnchors();return;}
  $('#inspectorLabel').textContent=pasteTool?'Thermal compound':'Selected component';$('#selectedName').textContent=selected?PARTS[selected].name:'Your workbench';$('#selectedDetail').textContent=selected?PARTS[selected].detail:'Drag a component from the staging mat or the component list. The case can be inspected from every angle.';
  if(pasteTool){$('#selectedName').textContent='Thermal compound';$('#selectedDetail').textContent=`${state.paste.length} application marks. Hold or move over the CPU heat spreader to dispense a small amount. The cooler will spread it across the contact area.`;addAction('Dispense a small centre dot',()=>{for(let i=0;i<7;i++)state.paste.push({y:Math.sin(i*2.4)*.025,z:Math.cos(i*2.4)*.025});changed();message('A small centre dot is on the CPU. Fit and secure the cooler next.','THERMAL COMPOUND');},'');addAction('Wipe thermal compound',()=>{state.paste=[];changed();});addAction('Finish paste application',()=>{pasteTool=false;syringe.visible=false;selected='cooler';view('inside');changed();});renderAnchors();return;}
  if(selected){
    if(!has(state,selected)){addAction('Seat selected part',()=>seat(), '');addAction(`Rotate part · ${rotation*90}°`,()=>{rotation=(rotation+1)%4;updatePartPositions();updateInspector();message('Part orientation: '+rotation*90+'°. Match the socket key.','ORIENTATION');});}
    if(selected==='motherboard'&&has(state,'motherboard')&&state.boardScrews<BOARD_SCREW_COUNT)addAction(`Tighten motherboard screw · ${state.boardScrews}/${BOARD_SCREW_COUNT}`,()=>{state.boardScrews++;changed();message(`Motherboard mounting screw ${state.boardScrews}/${BOARD_SCREW_COUNT} secured on its standoff.`);},'');
    if(selected==='psu'&&has(state,'psu')&&state.psuScrews<4)addAction(`Tighten PSU screw · ${state.psuScrews}/4`,()=>{state.psuScrews++;changed();},'');
    if(selected==='cooler'&&has(state,'cooler')&&state.coolerScrews<4)addAction(`Tighten cooler mount · ${state.coolerScrews}/4`,()=>{state.coolerScrews++;changed();message('Cooler mounting point secured. Compound is compressed beneath the cold plate.');},'');
    if((selected==='cpu'||selected==='motherboard')&&has(state,'motherboard')&&!has(state,'cooler'))addAction(state.socketOpen?'Latch CPU socket':'Open CPU socket',()=>{if(state.powered)return message('Switch off the PC first.','SAFETY');state.socketOpen=!state.socketOpen;state.cpuLatched=has(state,'cpu')&&!state.socketOpen;changed();message(state.socketOpen?'AM4 ZIF lever raised. Align the CPU gold corner with the socket.':'CPU retention mechanism closed.');});
    if(selected.startsWith('ram')&&!has(state,selected)&&has(state,'motherboard'))addAction(state.clips[selected]?'Close memory clips':'Open memory clips',()=>{state.clips[selected]=!state.clips[selected];changed();});
    if(selected==='gpu'&&!has(state,'gpu'))addAction(state.expansionOpen?'Refit expansion covers':'Remove expansion covers',()=>{state.expansionOpen=!state.expansionOpen;changed();message(state.expansionOpen?'Rear expansion covers removed. The GPU bracket can seat at the rear opening.':'Expansion covers refitted.');});
    if(has(state,selected))addAction('Remove selected component',()=>removeSelected(),'danger');
  }
  if(has(state,'cpu')&&state.cpuLatched&&!has(state,'cooler'))addAction('Apply thermal compound',()=>{pasteTool=true;focusCPU();updateInspector();message('Hold the pointer on the CPU heat spreader to dispense paste. Keep the amount small.','THERMAL COMPOUND');});
  renderAnchors();
}
function updatePartPositions(){
  keys.forEach((k,i)=>{const p=parts[k];if(drag?.key===k)return;const seated=has(state,k);p.scale.setScalar(seated?1:.42);p.position.copy(seated?new T.Vector3(...PARTS[k].target):staging[k]);p.rotation.set(0,0,0);if(!seated){p.rotation.z=-Math.PI/2;p.rotation.x=i*.25;if(k===selected)p.rotation.x+=rotation*Math.PI/2;}
    if(k==='motherboard'){
      p.userData.lever.rotation.z=state.socketOpen?-1.45:0;
      p.userData.screws.forEach((m,i)=>m.material=i<state.boardScrews?materials.silver:materials.gold);
      p.userData.clips.forEach((pair,i)=>pair.forEach((m,j)=>m.rotation.z=state.clips[i===0?'ramA2':'ramB2']?(j===0?-.65:.65):0));
    }
    if(k==='cooler'||k==='psu')p.userData.screws.forEach((m,i)=>m.material=i<state[k==='cooler'?'coolerScrews':'psuScrews']?materials.silver:materials.gold);
  });chassis.panels.visible=!state.panelsOpen;chassis.covers.visible=!state.expansionOpen;$('#panels').textContent=state.panelsOpen?'Fit side panels':'Remove side panels';
}
function drawPaste(){
  for(const m of [...pasteGroup.children]){pasteGroup.remove(m);m.geometry?.dispose();}
  if(!has(state,'cpu'))return;
  for(const p of state.paste){const m=new T.Mesh(new T.SphereGeometry(.036,10,8),materials.paste);m.scale.set(.2,1,1);m.position.set(.608,3.13+p.y,-.75+p.z);pasteGroup.add(m);}
  if(has(state,'cooler')&&state.paste.length){const m=new T.Mesh(new T.CylinderGeometry(.18,.18,.005,28),materials.paste);m.rotation.z=Math.PI/2;m.position.set(.603,3.13,-.75);pasteGroup.add(m);}
}
function buildWire(key,route,preview=false){
  const c=CABLES[key],start=new T.Vector3(...c.from),end=new T.Vector3(...c.to);
  const nodes=[start,...route.map(p=>new T.Vector3(...p)),end];
  if(nodes.length<4){const x=routeBehind?1.05:-.94;nodes.splice(1,0,new T.Vector3(x,start.y,start.z),new T.Vector3(x,end.y,end.z));}
  const curve=new T.CatmullRomCurve3(nodes,false,'centripetal');const mesh=new T.Mesh(new T.TubeGeometry(curve,64,key==='atx'?.045:.025,7,false),new T.MeshStandardMaterial({color:c.color,roughness:.6,metalness:.15,transparent:preview,opacity:preview?.6:1}));mesh.userData.cable=key;wireGroup.add(mesh);return mesh;
}
function drawWires(){
  wireMeshes.forEach(m=>{wireGroup.remove(m);disposeMesh(m);});wireMeshes=[];
  for(const[k,route]of Object.entries(state.cables))wireMeshes.push(buildWire(k,route));
  portGroup.clear();for(const[k,c]of Object.entries(CABLES))if(cableReady(state,k))for(const [end,pos]of [['source',c.from],['dest',c.to]]){const p=makeConnector(pos,0xc5f56b,k);p.userData.cable=k;p.userData.end=end;portGroup.add(p);}
}
function updateList(){
  $('#parts').replaceChildren();keys.forEach((k,i)=>{const b=document.createElement('button');b.className='part-card'+(selected===k?' is-selected':'')+(has(state,k)?' is-installed':'');b.setAttribute('aria-label',PARTS[k].name+(has(state,k)?' · installed':''));b.innerHTML=`<span class="part-icon">${['MB','CPU','FAN','A2','B2','GPU','PSU','SSD','FAN'][i]}</span><span><strong>${PARTS[k].name}</strong><small>${has(state,k)?'Installed · select to inspect':'Drag to install'}</small></span>`;b.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();choose(k);if(!has(state,k))startDrag(k,e);};b.onclick=e=>{if(e.detail===0||selected!==k)choose(k);};$('#parts').append(b);});
  const checks=validate(state),passed=checks.filter(c=>c.pass).length,pct=Math.round(passed/checks.length*100);$('#readiness').textContent=pct+'%';$('#progress').style.width=pct+'%';$('#checks').innerHTML=checks.map(c=>`<div class="check ${c.pass?'pass':''}"><span>${c.pass?'✓':'○'}</span>${c.label}</div>`).join('');$('#installedCount').textContent=state.installed.length+' / 9 parts';$('#cableCount').textContent=Object.keys(state.cables).length+' / 10 cables';$('#power').textContent=state.powered?'Power off':'Power on / run POST';
}
function changed(){updatePartPositions();drawPaste();drawWires();updateList();updateInspector();save();}
function choose(key){selected=key;mode='assembly';rotation=0;pasteTool=false;cancelRouting(false);updatePartPositions();updateList();updateInspector();message(PARTS[key].detail,has(state,key)?'INSPECT':'COMPONENT SELECTED');}
function seat(){
  if(!selected)return;const error=install(state,selected,rotation);if(error){message(error,'CHECK ASSEMBLY');return false;}
  message(PARTS[selected].name+' seated in its physical mounting position.','INSTALLED');changed();return true;
}
function removeSelected(){const error=canRemove(state,selected);if(error)return message(error,'CHECK ASSEMBLY');state.installed=state.installed.filter(k=>k!==selected);if(selected==='cpu'){state.cpuLatched=false;state.paste=[];}if(selected==='motherboard')state.boardScrews=0;if(selected==='cooler')state.coolerScrews=0;if(selected==='psu')state.psuScrews=0;changed();message('Component returned to the staging mat.','REMOVED');}
function pointerRay(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);}
function hitPlane(e,x){pointerRay(e);plane.set(new T.Vector3(1,0,0),-x);return raycaster.ray.intersectPlane(plane,point)?point.clone():null;}
function startDrag(key,e){if(has(state,key))return;drag={key,startX:e.clientX,startY:e.clientY,moved:false};controls.enabled=false;const p=parts[key];p.scale.setScalar(1);p.rotation.set(rotation*Math.PI/2,0,0);moveDrag(e);}
function moveDrag(e){if(!drag)return;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5;const target=PARTS[drag.key].target,p=hitPlane(e,target[0]-.45);if(p){p.y=Math.max(.2,Math.min(5,p.y));p.z=Math.max(-3,Math.min(3,p.z));parts[drag.key].position.copy(p);}const end=hitPlane(e,target[0]),near=end&&end.distanceTo(new T.Vector3(...target))<PARTS[drag.key].radius;ghost.material.color.setHex(near&&!canInstall(state,drag.key,rotation)?0xc5f56b:0xd2a76e);}
function dropPart(e){if(!drag)return;const d=drag;drag=null;controls.enabled=true;const t=PARTS[d.key].target,p=hitPlane(e,t[0]);if(d.moved&&p&&p.distanceTo(new T.Vector3(...t))<PARTS[d.key].radius)seat();else{updatePartPositions();if(d.moved)message('Drop near the highlighted mounting point. The part must align with the correct socket.','ALIGNMENT');} }
function addPaste(e){if(!pasteTool||!has(state,'cpu')||has(state,'cooler')||!state.cpuLatched)return;const p=hitPlane(e,.608);if(!p||Math.abs(p.y-3.13)>.18||Math.abs(p.z+.75)>.18)return;if(state.paste.length>=90)return message('Too much compound. Wipe the CPU and try again.','THERMAL COMPOUND');state.paste.push({y:p.y-3.13,z:p.z+.75});drawPaste();$('#selectedDetail').textContent=`${state.paste.length} application marks. ${state.paste.length>40?'Excess compound: wipe and try again.':'Keep a small central application.'}`;save();}
function beginCable(){if(state.powered)return message('Switch off the PC before connecting cables.','SAFETY');if(!state.panelsOpen)return message('Remove the side panels first.','CABLE ROUTING');if(!cableReady(state,cableKey))return;cancelRouting(false);routing={key:cableKey,points:[]};dragPlug=makeConnector(CABLES[cableKey].from,0xc5f56b,cableKey);scene.add(dragPlug);message('Source connector picked up. Drag to the destination or add routing points in the case.','CABLE ROUTING');}
function finishCable(){if(!routing)return message('Pick up the blue source connector first.','CABLE ROUTING');const c=CABLES[cableKey],x=routeBehind?1.05:-.94;state.cables[cableKey]=routing.points.length?routing.points:[[x,c.from[1],c.from[2]],[x,c.to[1],c.to[2]]];cancelRouting(false);changed();message(c.name+' connected at both ends. Rotate the case to inspect its route.','CONNECTED');}
function cancelRouting(update=true){if(dragPlug){scene.remove(dragPlug);dragPlug=null;}routing=null;cableDrag=false;controls.enabled=true;if(dynamicWire){wireGroup.remove(dynamicWire);disposeMesh(dynamicWire);dynamicWire=null;}if(update)message('Cable routing cancelled.','CABLE ROUTING');}
function drawRouting(e){if(!routing)return;const p=hitPlane(e,routeBehind?1.05:-.94);if(!p)return;hoverPoint=p.clone();if(dragPlug)dragPlug.position.copy(p);if(dynamicWire){wireGroup.remove(dynamicWire);disposeMesh(dynamicWire);}const points=[new T.Vector3(...CABLES[cableKey].from),...routing.points.map(p=>new T.Vector3(...p)),p];if(points.length<2)return;const curve=new T.CatmullRomCurve3(points);dynamicWire=new T.Mesh(new T.TubeGeometry(curve,32,.03,6,false),new T.MeshStandardMaterial({color:CABLES[cableKey].color,transparent:true,opacity:.7}));wireGroup.add(dynamicWire);}
function cableDrop(e){if(!cableDrag)return;cableDrag=false;controls.enabled=true;const r=stage.getBoundingClientRect(),p=worldToScreen(CABLES[cableKey].to);if(Math.hypot(e.clientX-r.left-p.x,e.clientY-r.top-p.y)<55)finishCable();else message('Cable remains picked up. Click routing points, then the destination connector.','CABLE ROUTING');}
renderer.domElement.addEventListener('pointerdown',e=>{
  if(pasteTool){painting=true;controls.enabled=false;lastPaste=0;addPaste(e);return;}
  if(mode==='cables'&&routing){const p=hitPlane(e,routeBehind?1.05:-.94);if(p){routing.points.push(p.toArray());message(`Routing point ${routing.points.length} added. Click the destination connector when ready.`,'CABLE ROUTING');}return;}
  if(mode!=='assembly'||e.button!==0)return;
  pointerRay(e);const hits=raycaster.intersectObjects(Object.values(parts),true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.part)o=o.parent;if(o){choose(o.userData.part);if(!has(state,o.userData.part))startDrag(o.userData.part,e);}}
});
window.addEventListener('pointermove',e=>{if(drag)moveDrag(e);if(routing)drawRouting(e);if(pasteTool){const p=hitPlane(e,.608);if(p){syringe.visible=Math.abs(p.y-3.13)<.3&&Math.abs(p.z+.75)<.3;syringe.position.copy(p);syringe.position.x-=.35;syringe.position.y+=.25;syringe.position.z+=.12;}if(painting&&performance.now()-lastPaste>70){addPaste(e);lastPaste=performance.now();}}});
window.addEventListener('pointerup',e=>{if(drag)dropPart(e);if(cableDrag)cableDrop(e);if(painting){painting=false;syringe.visible=false;controls.enabled=true;save();updateInspector();}});
window.addEventListener('pointercancel',()=>{drag=null;painting=false;cancelRouting(false);updatePartPositions();});
window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'){drag=null;pasteTool=false;syringe.visible=false;cancelRouting();changed();}if(e.key.toLowerCase()==='r'&&selected&&!has(state,selected)){rotation=(rotation+1)%4;if(drag)parts[selected].rotation.x=rotation*Math.PI/2;else updatePartPositions();updateInspector();}});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
$('#panels').onclick=()=>{if(drag||routing)return message('Finish the current operation first.');state.panelsOpen=!state.panelsOpen;changed();};
$('#assemblyMode').onclick=()=>{mode='assembly';cancelRouting(false);updateInspector();};
$('#cableMode').onclick=()=>{mode='cables';pasteTool=false;syringe.visible=false;selected=null;updateList();updateInspector();message('Choose a cable, then pick up its source connector.','CABLE ROUTING');};
$('#cableSelect').innerHTML=Object.entries(CABLES).map(([k,c])=>`<option value="${k}">${c.name}</option>`).join('');
$('#cableSelect').onchange=e=>{cancelRouting(false);cableKey=e.target.value;updateInspector();};
$('#routeSide').onclick=()=>{routeBehind=!routeBehind;$('#routeSide').textContent='Route through: '+(routeBehind?'back tray':'open side');if(routeBehind)view('cable');else view('inside');message('New routing points will follow the '+(routeBehind?'rear cable compartment.':'open side of the chassis.'),'CABLE ROUTING');};
$('#disconnect').onclick=()=>{if(state.powered)return message('Switch off the PC first.','SAFETY');delete state.cables[cableKey];cancelRouting(false);changed();message('Cable removed from both connectors.','DISCONNECTED');};$('#cancelCable').onclick=()=>cancelRouting();
$('#power').onclick=()=>{if(state.powered){state.powered=false;changed();message('System switched off. You can service the hardware.','POWER OFF');return;}const checks=postChecks(state),failed=checks.filter(c=>!c.pass);if(failed.length)return message('POST blocked: '+failed.slice(0,3).map(c=>c.label).join('; ')+(failed.length>3?` and ${failed.length-3} other checks.`:'.'),'POST FAIL');state.powered=true;changed();const remaining=validate(state).filter(c=>!c.pass);if(new URLSearchParams(location.search).get('id')==='pc-reference')window.TechHubProgress?.record({started:true,completed:remaining.length===0});message('POST PASS · CPU, memory and graphics detected. '+(remaining.length?remaining.length+' assembly checks remain; USB, audio and drive cabling are checked separately.':'All reference-build assembly and cable checks also pass.'),'POST PASS');};
$('#report').onclick=()=>{const checks=validate(state),report={title:'Tech-Hub 3D Assembly Lab',date:new Date().toISOString(),passed:checks.every(c=>c.pass)&&state.powered,installed:state.installed.map(k=>PARTS[k].name),cables:Object.keys(state.cables).map(k=>({name:CABLES[k].name,route:state.cables[k]})),checks};const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tech-hub-3d-build-report.json';a.click();URL.revokeObjectURL(url);message('Build report exported. It includes the actual installed parts, cable routes and validation results.','REPORT');};
$('#reset').onclick=()=>{if(!confirm('Clear this 3D build and return all components to the staging mat?'))return;state=freshState();drag=null;selected=null;pasteTool=false;syringe.visible=false;cancelRouting(false);changed();view('inside');message('Fresh build ready. Install the motherboard or power supply first.');};
const observer=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(stage);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();message('The graphics context was interrupted. Refresh to restore your saved build.','GRAPHICS');});
view('inside');changed();$('#loading').hidden=true;if(state.installed.length)message('Restored '+state.installed.length+' installed parts and '+Object.keys(state.cables).length+' cable routes. Power is off for safe inspection.','BUILD RESTORED');
let previous=0;renderer.setAnimationLoop(time=>{const dt=Math.min((time-previous)/1000,.05);previous=time;controls.update();for(const a of anchorRecords){const p=worldToScreen(a.pos);a.element.hidden=!p.visible;a.element.style.left=p.x+'px';a.element.style.top=p.y+'px';}if(state.powered){for(const f of chassis.fans)f.rotation.z+=dt*12;for(const p of Object.values(parts))if(p.userData.rotor&&has(state,p.userData.part))p.userData.rotor.rotation.z+=dt*12;}renderer.render(scene,camera);});
