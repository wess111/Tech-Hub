export function assessPlan(scenario,selection){
  const find=(type,id)=>scenario.components.find(c=>c.type===type&&c.id===id);
  const chosen=Object.fromEntries(Object.entries(selection).filter(([k])=>k!=='ram').map(([k,id])=>[k,find(k,id)]));
  const ram=Object.entries(selection.ram||{}).map(([slot,id])=>({slot,part:find('ram',id)})).filter(x=>x.part);
  const {motherboard:mb,cpu,cooler,gpu,psu,storage}=chosen,r=scenario.requirements||{};
  const total=Object.values(chosen).filter(Boolean).reduce((n,c)=>n+c.price,0)+ram.reduce((n,x)=>n+x.part.price,0);
  const issues=[];const checks=[];const add=(label,pass)=>checks.push({label,pass:!!pass});
  if(mb&&cpu&&mb.socket!==cpu.socket)issues.push('CPU and motherboard sockets differ.');
  if(mb&&ram.some(x=>x.part.memoryType!==mb.memoryType))issues.push('RAM generation does not match the motherboard.');
  if(mb&&cooler&&!cooler.sockets?.includes(mb.socket))issues.push('Cooler does not support this motherboard socket.');
  if(gpu?.requiresPower&&psu&&!psu.hasGpuPower)issues.push('Power supply lacks the required graphics power lead.');
  const memoryGB=ram.reduce((n,x)=>n+x.part.capacityGB,0);
  // A1/A2 share channel A; B1/B2 share channel B. Require matched populated pairs.
  const a=ram.filter(x=>x.slot.startsWith('A')),b=ram.filter(x=>x.slot.startsWith('B'));
  const signature=list=>list.map(x=>`${x.part.id}`).sort().join('|');
  const dual=a.length>0&&a.length===b.length&&signature(a)===signature(b);
  for(const type of ['motherboard','cpu','paste','cooler','storage','psu','casefan'])add(`${type==='casefan'?'Case fan':type} selected`,chosen[type]);
  add(`Memory: ${r.memoryGB||1} GB minimum`,memoryGB>=(r.memoryGB||1));
  if(r.dualChannelRequired)add('Matched memory across channels A and B',dual);
  add('Platform compatibility',mb&&cpu&&cooler&&ram.length&&issues.length===0);
  if(r.storageGB)add(`Storage: ${r.storageGB} GB ${r.storageInterface||''}`,storage&&storage.capacityGB>=r.storageGB&&(!r.storageType||storage.storageType===r.storageType)&&(!r.storageInterface||storage.interface===r.storageInterface));
  if(r.minCpuCores)add(`CPU: ${r.minCpuCores}+ cores`,cpu?.cores>=r.minCpuCores);
  if(r.minCpuThreads)add(`CPU: ${r.minCpuThreads}+ threads`,cpu?.threads>=r.minCpuThreads);
  if(r.minCpuTier)add('CPU meets workload performance',cpu?.performanceTier>=r.minCpuTier);
  if(r.minCoolingTier)add('Cooling meets workload',cooler?.coolingTier>=r.minCoolingTier);
  if(r.dedicatedGpuRequired)add('Dedicated graphics selected',gpu);
  if(r.gpuVramGB)add(`Graphics: ${r.gpuVramGB} GB VRAM minimum`,gpu?.vramGB>=r.gpuVramGB);
  if(r.minGpuTier)add('Graphics meets workload performance',gpu?.performanceTier>=r.minGpuTier);
  const outputs=gpu?.displayOutputs||(cpu?.integratedGraphics?mb?.displayOutputs:0)||0;
  add(`${r.displayOutputs||1} usable display output(s)`,outputs>=(r.displayOutputs||1));
  // Teaching estimate, not manufacturer PSU qualification or a clearance check.
  const load=80+(cpu?(cpu.wattage||Math.max(65,(cpu.cores||4)*12)):0)+(gpu?.wattage||0)+ram.length*4;
  const minimum=Math.ceil(load/(1-(r.minPsuHeadroomPercent||0)/100));
  add(`Estimated PSU capacity: ${Math.max(minimum,r.minPsuWattage||0)} W minimum`,psu&&psu.wattage>=Math.max(minimum,r.minPsuWattage||0));
  if(r.budget)add(`Within $${r.budget} scenario budget`,total>0&&total<=r.budget);
  return {total,memoryGB,dual,issues,checks,load,ready:checks.every(c=>c.pass)};
}
