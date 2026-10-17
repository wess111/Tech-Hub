export const PARTS = {
  motherboard:{name:'ATX motherboard',detail:'Seat on standoffs · rear ports align with the rear opening',target:[.79,2.65,-.65],radius:.65},
  cpu:{name:'Desktop CPU',detail:'Align the gold corner · open the socket first',target:[.66,3.13,-.75],radius:.27},
  cooler:{name:'Tower air cooler',detail:'Mount over the CPU after thermal compound',target:[.46,3.13,-.75],radius:.4},
  ramA2:{name:'Memory · DIMM A2',detail:'Open the clips · align the keyed connector',target:[.63,3.03,.08],radius:.32},
  ramB2:{name:'Memory · DIMM B2',detail:'Matching memory in the second channel',target:[.63,3.03,.38],radius:.32},
  gpu:{name:'Graphics card',detail:'PCIe x16 · remove the expansion covers',target:[-.05,1.85,-.3],radius:.5},
  psu:{name:'Modular power supply',detail:'Rear inlet faces the back of the case',target:[0,.43,-1.3],radius:.55},
  ssd:{name:'2.5-inch SATA SSD',detail:'Drive cage · needs both data and power',target:[.35,1.14,1.25],radius:.45},
  fan:{name:'Rear exhaust fan',detail:'Rear mounting position · connect SYS_FAN',target:[0,3.43,-1.98],radius:.45}
};
export const CABLES = {
  atx:{name:'24-pin motherboard power',source:'PSU · ATX',dest:'Motherboard · 24-pin',parts:['psu','motherboard'],from:[-.65,.5,-.8],to:[.58,2.92,.52],color:0xc5b27a},
  eps:{name:'8-pin CPU power',source:'PSU · CPU',dest:'Motherboard · EPS',parts:['psu','motherboard'],from:[-.65,.44,-1.03],to:[.58,3.89,-1.5],color:0xd0a953},
  gpuPower:{name:'PCIe graphics power',source:'PSU · PCIe',dest:'GPU · 8-pin',parts:['psu','gpu'],from:[-.65,.38,-1.26],to:[-.55,1.98,.75],color:0x798fa7},
  sataPower:{name:'SATA drive power',source:'PSU · SATA',dest:'SSD · power',parts:['psu','ssd'],from:[-.65,.32,-1.49],to:[.01,1.1,1.4],color:0xaa7d51},
  sataData:{name:'SATA data',source:'Motherboard · SATA',dest:'SSD · data',parts:['motherboard','ssd'],from:[.57,1.45,.45],to:[.01,1.18,1.4],color:0xb66150},
  cpuFan:{name:'CPU cooler fan',source:'Cooler · fan lead',dest:'Motherboard · CPU_FAN',parts:['cooler','motherboard'],from:[-.1,3.45,-.4],to:[.58,3.72,-.25],color:0x777f88},
  sysFan:{name:'Rear case fan',source:'Rear fan · lead',dest:'Motherboard · SYS_FAN',parts:['fan','motherboard'],from:[-.48,3.18,-1.85],to:[.58,2.2,-1.55],color:0x6c9293},
  usb:{name:'Front USB 3 header',source:'Case · front USB',dest:'Motherboard · USB 3',parts:['motherboard'],from:[-.5,3.98,1.98],to:[.58,2.2,.46],color:0x5374a0},
  audio:{name:'Front audio header',source:'Case · audio',dest:'Motherboard · HD_AUDIO',parts:['motherboard'],from:[-.35,3.98,1.98],to:[.58,1.44,-1.53],color:0x865d95},
  powerSwitch:{name:'Front power switch',source:'Case · power switch',dest:'Motherboard · PWR_SW',parts:['motherboard'],from:[-.2,4.04,1.98],to:[.58,1.44,.18],color:0x9a9b78}
};
export function freshState(){return {version:1,installed:[],rotations:{},boardScrews:0,psuScrews:0,coolerScrews:0,socketOpen:false,cpuLatched:false,clips:{ramA2:false,ramB2:false},expansionOpen:false,paste:[],cables:{},panelsOpen:true,powered:false};}
export function sanitizeState(raw){
  const s=freshState();if(!raw||raw.version!==1)return s;
  s.installed=[...new Set((Array.isArray(raw.installed)?raw.installed:[]).filter(k=>Object.hasOwn(PARTS,k)))];
  for(const k of ['boardScrews','psuScrews','coolerScrews'])s[k]=Math.max(0,Math.min(4,Math.floor(Number(raw[k])||0)));
  for(const k of ['socketOpen','cpuLatched','expansionOpen','panelsOpen'])s[k]=raw[k]===true;
  for(const k of ['ramA2','ramB2'])s.clips[k]=raw.clips?.[k]===true;
  s.paste=(Array.isArray(raw.paste)?raw.paste:[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(p.z)&&Math.abs(p.y)<=.19&&Math.abs(p.z)<=.19).slice(0,90);
  for(const k of Object.keys(CABLES))if(Array.isArray(raw.cables?.[k]))s.cables[k]=raw.cables[k].filter(p=>Array.isArray(p)&&p.length===3&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<8)).slice(0,12).map(p=>[Math.max(-1.05,Math.min(1.05,p[0])),Math.max(.1,Math.min(4.1,p[1])),Math.max(-2.05,Math.min(2.05,p[2]))]);
  return s;
}
export const has=(s,key)=>s.installed.includes(key);
export function canInstall(s,key,rotation=0){
  if(!Object.hasOwn(PARTS,key))return 'Choose a component first.';
  if(has(s,key))return 'This component is already installed.';
  if(!s.panelsOpen)return 'Remove the side panels before working inside the case.';
  if(s.powered)return 'Switch the PC off before changing components.';
  if(rotation%4!==0)return 'The component is rotated incorrectly. Use Rotate part to align its keyed orientation.';
  if(key==='motherboard'||key==='psu')return null;
  if(key==='fan'||key==='ssd')return null;
  if(!has(s,'motherboard'))return 'Install the motherboard first.';
  if(s.boardScrews<4)return 'Secure the motherboard to all four reference mounting points first.';
  if(key==='cpu'&&!s.socketOpen)return 'Open the CPU socket retention mechanism first.';
  if(key==='cooler'){
    if(!has(s,'cpu')||!s.cpuLatched)return 'Seat the CPU and latch the socket before fitting the cooler.';
    if(s.paste.length<4)return 'Apply a small amount of thermal compound to the CPU first.';
    if(s.paste.length>40)return 'Too much compound. Wipe it off and apply a smaller amount.';
  }
  if(key.startsWith('ram')&&!s.clips[key])return 'Open the memory slot retention clips first.';
  if(key==='gpu'&&!s.expansionOpen)return 'Remove the rear expansion-slot covers first.';
  return null;
}
export function install(s,key,rotation=0){const error=canInstall(s,key,rotation);if(error)return error;s.installed.push(key);if(key.startsWith('ram'))s.clips[key]=false;s.powered=false;return null;}
export function canRemove(s,key){
  if(s.powered)return 'Switch off the PC first.';
  if(!s.panelsOpen)return 'Remove the side panels first.';
  if(Object.keys(s.cables).some(k=>CABLES[k].parts.includes(key)))return 'Disconnect the cables attached to this component first.';
  if(key==='motherboard'&&s.installed.some(k=>['cpu','cooler','ramA2','ramB2','gpu'].includes(k)))return 'Remove the components attached to the motherboard first.';
  if(key==='cpu'&&(has(s,'cooler')||!s.socketOpen))return 'Remove the cooler and open the socket before lifting out the CPU.';
  return null;
}
export function cableReady(s,key){return CABLES[key].parts.every(k=>has(s,k));}
export function validate(s){
  const checks=Object.entries(PARTS).map(([k,p])=>({label:p.name,pass:has(s,k)}));
  checks.push({label:'Motherboard secured on standoffs',pass:s.boardScrews===4},{label:'CPU socket latched',pass:s.cpuLatched&&has(s,'cpu')},{label:'Thermal compound beneath cooler',pass:s.paste.length>=4&&s.paste.length<=40&&has(s,'cooler')},{label:'Cooler mounting secured',pass:s.coolerScrews===4},{label:'Power supply secured',pass:s.psuScrews===4});
  for(const[k,c]of Object.entries(CABLES))checks.push({label:c.name,pass:Array.isArray(s.cables[k])&&cableReady(s,k)});
  return checks;
}
export function postChecks(s){
  return [
    {label:'Motherboard secured',pass:has(s,'motherboard')&&s.boardScrews===4},
    {label:'CPU seated and socket latched',pass:has(s,'cpu')&&s.cpuLatched&&!s.socketOpen},
    {label:'CPU cooling and thermal compound',pass:has(s,'cooler')&&s.coolerScrews===4&&s.paste.length>=4&&s.paste.length<=40},
    {label:'Memory detected',pass:has(s,'ramA2')||has(s,'ramB2')},
    {label:'Power supply secured',pass:has(s,'psu')&&s.psuScrews===4},
    {label:'Graphics installed and powered',pass:has(s,'gpu')&&Array.isArray(s.cables.gpuPower)},
    ...['atx','eps','cpuFan','powerSwitch'].map(k=>({label:CABLES[k].name,pass:Array.isArray(s.cables[k])&&cableReady(s,k)}))
  ];
}
