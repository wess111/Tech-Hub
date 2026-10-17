import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assessPlan} from '../assets/pc-planner-rules.js';
const scenarios=JSON.parse(await readFile(new URL('../data/simulations.json',import.meta.url)));
const business=scenarios.find(s=>s.id==='pc-hardware');
const sel={motherboard:'mb-b760',cpu:'cpu-r5-7600',ram:{A2:'ram-16-d4'}};
assert.equal(assessPlan(business,sel).issues.length,2,'Socket and memory mismatches are visible');
const one=assessPlan(business,{ram:{A2:'ram-16-d5'}}),two=assessPlan(business,{ram:{A2:'ram-16-d5',B2:'ram-16-d5'}});
assert.equal(two.total,one.total*2);assert.equal(two.memoryGB,32);assert.equal(two.dual,true);
assert.equal(assessPlan(business,{ram:{A1:'ram-16-d5',A2:'ram-16-d5'}}).dual,false);
assert.equal(assessPlan(business,{}).ready,false);
assert.equal(assessPlan(business,{cpu:'unknown',ram:{A2:'unknown'}}).total,0);
// Every retained scenario must permit at least one plan meeting the restored checks.
for(const scenario of scenarios){
  const by=t=>scenario.components.filter(c=>c.type===t);let passing=false;
  outer:for(const motherboard of by('motherboard'))for(const cpu of by('cpu'))for(const ram of by('ram'))for(const gpu of [null,...by('gpu')])for(const storage of by('storage'))for(const psu of by('psu'))for(const cooler of by('cooler')){
    const selection={motherboard:motherboard.id,cpu:cpu.id,ram:{A2:ram.id,B2:ram.id},storage:storage.id,psu:psu.id,cooler:cooler.id,paste:by('paste')[0]?.id,casefan:by('casefan')[0]?.id,gpu:gpu?.id};
    if(assessPlan(scenario,selection).ready){passing=true;break outer;}
  }assert.ok(passing,`${scenario.id}: no plan can meet requirements`);
}
console.log('Planner passed: all four scenarios have viable plans; incompatible sockets/memory, memory channels, per-module prices and invalid saved IDs checked.');
