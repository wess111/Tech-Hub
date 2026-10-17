// Scenario choices stay in simulations.json. Physical models belong to exact SKUs.
// Do not substitute this specification for verified geometry or licensed artwork.
export const referenceHardware = {
  case: {id:'corsair-4000d-airflow', name:'Corsair 4000D Airflow', dimensionsMM:{width:230,height:466,depth:453}, maxCoolerHeightMM:170, maxGpuLengthMM:360, source:'https://assets.corsair.com/image/upload/v1684779868/corsairmedia/sys_master/productcontent/WW_4000D_4000D_Airflow_QSG_AB.pdf'},
  motherboard: {id:'msi-b550-a-pro',name:'MSI B550-A PRO',socket:'AM4',memoryType:'DDR4',dimensionsMM:{height:305,width:244},mountingHoles:9,source:'https://www.msi.com/Motherboard/B550-A-PRO/Specification',manual:'https://download.msi.com/archive/mnu_exe/mb/B550-APRO_EN.pdf'},
  cpu: {id:'amd-ryzen-5-5600x',name:'AMD Ryzen 5 5600X',socket:'AM4',integratedGraphics:false,source:'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600x.html'},
  cooler: {id:'noctua-nh-u12s-redux',name:'Noctua NH-U12S redux',sockets:['AM4'],dimensionsMM:{height:158,width:125,depth:71},factoryPaste:true,source:'https://cdn.noctua.at/media/noctua_nh_u12s_redux_infosheet_en_web.pdf'}
};

export const socketMechanisms = {
  AM4:{contacts:'pins-on-cpu',retention:'zif-lever',loadPlate:false},
  AM5:{contacts:'pins-in-socket',retention:'load-plate-and-lever',loadPlate:true},
  LGA1700:{contacts:'pins-in-socket',retention:'load-plate-and-lever',loadPlate:true}
};

// Derive choices from the retained scenarios rather than maintaining a second,
// eventually inconsistent, list of business/gaming/architect components.
export function scenarioProfiles(scenarios){
  return scenarios.map(s=>({
    id:s.id,title:s.title,requirements:structuredClone(s.requirements),
    status:'awaiting-verified-assets',
    motherboardVariants:s.components.filter(c=>c.type==='motherboard').map(board=>({
      componentId:board.id,name:board.name,socket:board.socket,memoryType:board.memoryType,
      mechanism:socketMechanisms[board.socket] ?? null,
      cpuChoices:s.components.filter(c=>c.type==='cpu'&&c.socket===board.socket).map(c=>c.id),
      memoryChoices:s.components.filter(c=>c.type==='ram'&&c.memoryType===board.memoryType).map(c=>c.id)
    }))
  }));
}

export function compatibilityIssues({motherboard,cpu,memory=[],cooler,pcCase,gpu}){
  const issues=[];
  if(motherboard&&cpu&&motherboard.socket!==cpu.socket)issues.push('CPU socket does not match motherboard.');
  if(motherboard&&memory.some(m=>m.memoryType!==motherboard.memoryType))issues.push('Memory generation does not match motherboard.');
  if(cooler&&motherboard&&!cooler.sockets.includes(motherboard.socket))issues.push('Cooler requires a mounting kit for this socket.');
  if(pcCase&&cooler&&cooler.dimensionsMM.height>pcCase.maxCoolerHeightMM)issues.push('Cooler exceeds case height clearance.');
  if(pcCase&&gpu&&gpu.lengthMM>pcCase.maxGpuLengthMM)issues.push('Graphics card exceeds case length clearance.');
  if(cpu?.integratedGraphics===false&&!gpu)issues.push('This CPU needs a discrete graphics card for display output.');
  return issues;
}

// Separate saves by physical build and assembly schema. A completed AM4 build
// must never restore as a completed AM5 or Intel assembly.
export function buildStorageKey(scenarioId,variantId,revision){
  if(![scenarioId,variantId].every(v=>typeof v==='string'&&/^[a-z0-9-]+$/.test(v))||!Number.isInteger(revision)||revision<1)throw new Error('Invalid build identity');
  return `tech-hub-assembly:${scenarioId}:${variantId}:v${revision}`;
}
