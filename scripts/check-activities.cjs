const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let stages=0;
for(const file of fs.readdirSync(path.join(root,'data/labs'))) {
  if(!file.endsWith('.json'))continue;
  const lab=JSON.parse(fs.readFileSync(path.join(root,'data/labs',file)));
  for(const t of lab.tickets)for(const key of ['triage','diagnosis','fix']){
    const s=t.workflow[key];
    assert.equal(typeof s.q,'string',`${file} ${t.id} ${key}: missing question`);
    assert.ok(Array.isArray(s.options)&&s.options.length>=2,`${file} ${t.id} ${key}: invalid options`);
    assert.ok(Number.isInteger(s.correct)&&s.correct>=0&&s.correct<s.options.length,`${file} ${t.id} ${key}: invalid answer index`);
    stages++;
  }
}
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/activities.json')));
for(const a of catalog.filter(a=>a.status==='available')){
  const u=new URL(a.link,'https://local/');
  assert.ok(fs.existsSync(path.join(root,u.pathname)),`Missing route for ${a.title}`);
  const lab=u.searchParams.get('lab');
  if(lab)assert.ok(fs.existsSync(path.join(root,'data',u.pathname.includes('assessment')?'assessments':'labs',`${lab}.json`)),`Missing data for ${a.title}`);
}
console.log(`Validated ${stages} ticket stages and ${catalog.filter(a=>a.status==='available').length} available activity routes.`);
