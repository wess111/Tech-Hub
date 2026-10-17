import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scenarioProfiles,referenceHardware as h,compatibilityIssues,buildStorageKey} from '../assets/pc-build-profiles.mjs';
const scenarios=JSON.parse(await readFile(new URL('../data/simulations.json',import.meta.url),'utf8'));
const profiles=scenarioProfiles(scenarios);
assert.deepEqual(profiles.map(p=>p.id),['pc-hardware','pc-architect','pc-gaming','pc-demo']);
for(const p of profiles)for(const b of p.motherboardVariants){
  assert.ok(b.mechanism,`${b.name}: socket mechanism missing`);
  assert.ok(b.cpuChoices.length,`${b.name}: no compatible CPU`);
  assert.ok(b.memoryChoices.length,`${b.name}: no compatible memory`);
}
const base={motherboard:h.motherboard,cpu:h.cpu,cooler:h.cooler,pcCase:h.case,memory:[{memoryType:'DDR4'}],gpu:{lengthMM:250}};
assert.deepEqual(compatibilityIssues(base),[]);
assert.match(compatibilityIssues({...base,cpu:{socket:'AM5'}}).join(),/CPU socket/);
assert.match(compatibilityIssues({...base,memory:[{memoryType:'DDR5'}]}).join(),/Memory generation/);
assert.match(compatibilityIssues({...base,gpu:null}).join(),/discrete graphics/);
assert.match(compatibilityIssues({...base,cooler:{sockets:['AM4'],dimensionsMM:{height:180}}}).join(),/height clearance/);
assert.match(compatibilityIssues({...base,gpu:{lengthMM:370}}).join(),/length clearance/);
assert.notEqual(buildStorageKey('pc-gaming','am5',1),buildStorageKey('pc-gaming','lga1700',1));
assert.notEqual(buildStorageKey('pc-gaming','am5',1),buildStorageKey('pc-gaming','am5',2));
assert.throws(()=>buildStorageKey('../bad','am5',1));
console.log(`Build profiles: ${profiles.length} retained scenarios, ${profiles.reduce((n,p)=>n+p.motherboardVariants.length,0)} motherboard variants; compatibility and isolated save identities passed.`);
