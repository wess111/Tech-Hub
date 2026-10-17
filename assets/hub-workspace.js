/* Shared Tech-Hub workspace chrome. Activity engines keep their existing DOM IDs. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const rawPage = location.pathname.split('/').pop() || 'index';
  const page = rawPage.endsWith('.html') ? rawPage : rawPage + '.html';
  const tools = location.pathname.includes('/tools/');
  const labels = {'activity.html':'Incident workspace','assessment.html':'Knowledge assessment','project.html':'Capstone project','simulator.html':'PC Builder','troubleshooting-case.html':'Incident investigation','change-management.html':'Change management','config-report.html':'Configuration report','policy-procedure.html':'Policy & procedure'};
  const title = tools && page==='index.html' ? 'Documentation tools' : labels[page] || 'Learning workspace';
  const link = value => new URL(value,base).href;
  const sidebar = document.createElement('aside');
  sidebar.className='hub-sidebar';
  sidebar.innerHTML=`<a class="hub-logo" href="${link('index.html')}">tech<span>-hub</span><small>BUILD. BREAK. UNDERSTAND.</small></a><nav aria-label="Tech-Hub navigation"><a href="${link('index.html')}">Overview</a><a href="${link('index.html?view=labs')}" ${!tools?'aria-current="page"':''}>Explore labs</a><a href="${link('index.html?view=paths')}">Learning paths</a><a href="${link('index.html?view=dashboard')}">My learning</a><a href="${link('index.html?view=leaderboard')}">Leaderboard</a><a href="${link('tools/index.html')}" ${tools?'aria-current="page"':''}>Documentation tools</a></nav><div class="hub-sidebar-note"><b>YOUR PRACTICE WORKSPACE</b><p>Explore, experiment, and learn.<br>Your progress stays in this browser.</p></div>`;
  const bar=document.createElement('div');bar.className='hub-workspace-bar';
  const crumb=document.createElement('span');crumb.textContent=`Workspace / ${title}`;
  const returnLink=document.createElement('a');returnLink.href=link('index.html?view=dashboard');returnLink.textContent='My learning ↗';
  bar.append(crumb,returnLink);
  document.body.classList.add('hub-experience');
  const skip=document.createElement('a');skip.href='#hub-main';skip.className='hub-skip';skip.textContent='Skip to workspace';
  document.body.prepend(skip,sidebar,bar);
  const main=document.querySelector('main');if(main)main.id='hub-main';
  // A permanent Tech-Hub return path replaces history-dependent legacy links.
  document.querySelectorAll('.home-link').forEach(a=>{a.href=link('index.html?view=labs');a.textContent='← All labs';});
  document.querySelectorAll('.crumbs a').forEach(a=>{if(a.href.includes('capstone-projects'))a.href=link('index.html?view=labs&mode=capstone-projects');});
  document.querySelectorAll('.footer,.simVersionFooter').forEach(f=>{if(f.querySelector('#footerLeft')){const right=f.querySelector('#footerRight');if(right)right.textContent='TECH-HUB · Saved on this device';return;}f.innerHTML='<div class="hub-footer-content">TECH-HUB · Learn by doing. <span>Practice workspace · Saved on this device</span></div>';});
  document.querySelectorAll('input,textarea,select').forEach(el=>{if(!el.labels?.length&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.placeholder||el.name||el.id||'Activity input');});
  document.querySelectorAll('input[type="text"],input:not([type])').forEach(el=>{if(/^(analystName|techName|technicianName)$/.test(el.id)){el.placeholder='Display name (optional)';}});
  // The name is optional for local guest practice. Existing reports can still use a display name.
  if(page==='simulator.html'){
    const field=document.querySelector('#technicianName');if(field&&!field.value)field.value='Guest';
    document.querySelector('#consoleMessage').textContent='Start an attempt, choose a component, then place it in the case.';
    document.querySelector('.simActivityRecord').insertAdjacentHTML('beforeend','<p class="hub-record-note">No account needed. A display name is optional.</p>');
  }
})();
