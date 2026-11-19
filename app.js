(() => {
  const TAG = 'sergiosimon-20';
  const SALE_END = new Date('2026-12-01T03:00:00-05:00'); // Nov 30, 11:59 pm Pacific
  const state = { deals: [], type: 'all', cat: 'All', q: '', sort: 'default' };
  // Saved list: kept in a first party cookie when the browser allows it, otherwise for this visit only.
  const CK = 'sss_saved';
  const readSaved = () => { try { const m = document.cookie.match(new RegExp('(?:^|; )' + CK + '=([^;]*)')); return m ? decodeURIComponent(m[1]).split(',').filter(Boolean) : []; } catch(e) { return []; } };
  let saved = new Set(readSaved());
  const persist = () => { try { document.cookie = CK + '=' + encodeURIComponent([...saved].join(',')) + '; max-age=31536000; path=/; SameSite=Lax'; } catch(e) {} };
  const $ = id => document.getElementById(id);
  const grid = $('grid');
  grid.innerHTML = '<div class="skel"></div>'.repeat(6);

  const link = asin => `https://www.amazon.com/dp/${asin}?tag=${TAG}&linkCode=ll1`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct = d => { const m = String(d.offer||'').match(/(\d+)\s*%/); return m ? +m[1] : 0; };
  const media = d => d.image ? `<div class="art photo"><img src="${esc(d.image)}" alt="" loading="lazy" width="400" height="400"></div>` : window.CAT_ART(d.category);
  const TYPES = [['all','All deals'],['saved','Saved'],['code','Promo codes'],['coupon','Clip coupons'],['deal','Price drops'],['best','Best sellers'],['fav',"Simon's picks"]];
  const ICON = {
    bolt: '<svg class="f-bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    star: '<svg class="f-star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    check: '<svg class="f-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>'
  };

  function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1800); }

  function syncSaved(){
    const n = [...saved].filter(a=>state.deals.some(d=>d.asin===a)).length;
    $('savedN').textContent = n;
    document.querySelectorAll('.qchip[data-type]').forEach(b => b.setAttribute('aria-pressed', state.type===b.dataset.type));
    return n;
  }

  function chips(){
    const n = syncSaved();
    $('types').innerHTML = TYPES.filter(([k]) => !(k==='code' && state.noCodes)).map(([k,l]) => `<button type="button" class="chip" data-type="${k}" aria-pressed="${state.type===k}">${k==='saved' ? `<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>${l}${n ? ` <span class="n">${n}</span>` : ''}` : l}</button>`).join('');
    const cats = ['All', ...new Set(state.deals.map(d => d.category))].sort((a,b)=> a==='All'?-1:b==='All'?1:a.localeCompare(b));
    $('cats').innerHTML = cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${state.cat===c}">${esc(c)}</button>`).join('');
  }

  function tile(d){
    const p = pct(d);
    return `<a class="tile" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored">${media(d)}<span class="pct">${p ? p+'% off' : esc(d.offer)}</span><span class="tt">${esc(d.title)}</span></a>`;
  }

  function panels(){
    const byDrop = [...state.deals].sort((a,b)=>pct(b)-pct(a));
    const fill = (list) => { const out=[...list]; for (const d of byDrop){ if(out.length>=4) break; if(!out.includes(d)) out.push(d); } return out.slice(0,4); };
    const picks = fill(state.deals.filter(d=>d.pick).sort((a,b)=>pct(b)-pct(a)));
    const gifts = fill(byDrop.filter(d=>['Christmas','Kids','Clothing','Beauty'].includes(d.category)).slice(0,4));
    const home = fill(byDrop.filter(d=>['Smart Home','Home','Kitchen'].includes(d.category)).slice(0,4));
    const P = [
      ['Black Friday Top Picks','Deals Simon is most excited about',picks,''],
      ['Gift-Worthy Finds','Holiday gifts at Black Friday prices',gifts,'alt'],
      ['Home and Kitchen Steals','Thermostats, vacuums, cookware and more',home,'red']
    ];
    $('panels').innerHTML = P.map(([h,s,list,cls]) => `<section class="panel ${cls}"><h2>${esc(h)} <span aria-hidden="true">›</span></h2><p class="sub">${esc(s)}</p><div class="tiles">${list.map(tile).join('')}</div></section>`).join('');
  }

  function rank(){
    const top = [...state.deals].filter(d=>pct(d)).sort((a,b)=>pct(b)-pct(a)).slice(0,10);
    $('rank').innerHTML = top.map((d,i)=>`<a class="rcard" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored"><span class="crown ${i===0?'':i===1?'n2':i===2?'n3':'nx'}">${i<3?ICON.crown:''}No. ${i+1}</span>${media(d)}<div class="rb"><div class="pct">${pct(d)}% off</div><div class="tt">${esc(d.title)}</div></div></a>`).join('');
  }

  function card(d){
    const p = pct(d);
    const tag = d.code ? '<span class="bftag code">Promo code</span>' : d.type==='coupon' ? '<span class="bftag coupon">Clip coupon</span>' : d.type==='best' ? '<span class="bftag best">Best seller</span>' : d.type==='fav' ? '<span class="bftag best">Simon\'s pick</span>' : '<span class="bftag">Black Friday</span>';
    const flags = [];
    if (p >= 50) flags.push(`<li>${ICON.bolt}Huge price drop</li>`);
    if (d.pick) flags.push(`<li>${ICON.star}Top pick</li>`);
    if (d.type==='best') flags.push(`<li>${ICON.check}Popular on Amazon</li>`);
    if (d.code) flags.push(`<li>${ICON.bolt}Extra savings with code</li>`);
    const code = d.code ? `<div class="codebox"><code>${esc(d.code)}</code><button type="button" class="btn small" data-copy="${esc(d.code)}" aria-label="Copy code ${esc(d.code)}">Copy</button></div>` : '';
    const on = saved.has(d.asin);
    const fav = `<button type="button" class="fav" data-fav="${esc(d.asin)}" aria-pressed="${on}" aria-label="${on?'Remove from saved':'Save for later'}: ${esc(d.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>`;
    const meta = [d.brand, d.category].filter(Boolean).join(' · ');
    return `<article class="card">
      ${tag}${fav}
      <a class="media" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored" tabindex="-1" aria-hidden="true">${media(d)}</a>
      <div class="cb">
        <p class="off${p?'':' word'}">${esc(p ? p+'% off' : d.offer)}</p>
        <h3>${esc(d.title)}</h3>
        <p class="meta">${esc(meta)}</p>
        ${flags.length ? `<ul class="flags">${flags.join('')}</ul>` : ''}
        ${d.note ? `<p class="meta" title="${esc(d.note)}">${esc(d.note)}</p>` : ''}
        ${d.desc ? `<p class="desc">${esc(d.desc)}</p><button type="button" class="more" data-more>Details</button>` : ''}
        ${code}
        <div class="actions"><a class="btn primary" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored">Get deal</a></div>
      </div>
    </article>`;
  }

  function render(){
    const q = state.q.trim().toLowerCase();
    let list = state.deals.filter(d =>
      (state.type==='all' || (state.type==='saved' ? saved.has(d.asin) : state.type==='code' ? !!d.code : d.type===state.type && !d.code)) &&
      (state.cat==='All' || d.category===state.cat) &&
      (!q || `${d.title} ${d.brand} ${d.category} ${d.desc||''}`.toLowerCase().includes(q)));
    if (state.sort==='drop') list = [...list].sort((a,b)=>pct(b)-pct(a));
    grid.innerHTML = list.map(card).join('');
    $('empty').hidden = list.length>0;
    $('empty').querySelector('p').innerHTML = state.type==='saved' && !q && state.cat==='All'
      ? '<strong>Nothing saved yet.</strong> Tap the heart on any deal to keep it here for later.'
      : '<strong>No deals match that.</strong> Try a different word or clear the filters.';
    chips();
  }

  const go = id => document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});
  function setTab(name){ document.querySelectorAll('.tabbar button').forEach(b => b.dataset.tab===name ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current')); }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if (b.dataset.fav){
      const a=b.dataset.fav; const was=saved.has(a);
      was ? saved.delete(a) : saved.add(a); persist();
      toast(was ? 'Removed from saved' : 'Saved for later');
      if (state.type==='saved') render(); else { b.setAttribute('aria-pressed', !was); b.setAttribute('aria-label', (was?'Save for later':'Remove from saved') + b.getAttribute('aria-label').replace(/^[^:]*/,'')); chips(); }
    }
    else if (b.dataset.more !== undefined){ const c=b.closest('.card'); c.classList.toggle('open'); b.textContent = c.classList.contains('open') ? 'Less' : 'Details'; }
    else if (b.dataset.tab){
      const t=b.dataset.tab; setTab(t);
      if (t==='home'){ state.type='all'; state.cat='All'; state.q=''; state.sort='default'; $('q').value=''; render(); window.scrollTo({top:0,behavior:'smooth'}); }
      else if (t==='drops'){ go('drops'); }
      else { state.type = t==='bf' ? 'all' : t==='codes' ? 'code' : 'saved'; render(); go('filters'); }
    }
    else if (b.dataset.sort){ state.sort=b.dataset.sort; state.type='all'; state.cat='All'; render(); go('filters'); }
    else if (b.dataset.type){ state.type = (state.type===b.dataset.type && b.classList.contains('qchip')) ? 'all' : b.dataset.type; render(); if (!b.classList.contains('chip')) go('filters'); }
    else if (b.dataset.cat){ state.cat=b.dataset.cat; render(); }
    else if (b.dataset.copy){
      const c=b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(()=>toast(`Copied ${c}`)).catch(()=>{
        const r=document.createRange(); r.selectNodeContents(b.previousElementSibling); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast('Code selected, copy it manually');
      });
    } else if (b.id==='reset'){ state.type='all'; state.cat='All'; state.q=''; state.sort='default'; $('q').value=''; render(); }
  });
  $('q').addEventListener('input', e => { state.q=e.target.value; render(); });
  $('q').addEventListener('keydown', e => { if (e.key==='Enter') go('filters'); });

  function countUp(el, n){ let i=0; const step=()=>{ i=Math.min(n,i+Math.max(1,Math.ceil(n/20))); el.textContent=i; if(i<n) requestAnimationFrame(step); }; n?step():el.textContent='0'; }
  function tick(){
    const ms = SALE_END - Date.now(), el = $('countdown');
    if (ms <= 0){ el.textContent = 'Ended'; return; }
    const d = Math.floor(ms/864e5), h = Math.floor(ms%864e5/36e5), m = Math.floor(ms%36e5/6e4);
    el.textContent = d ? `${d}d ${h}h` : `${h}h ${m}m`;
  }
  tick(); setInterval(tick, 30000);

  fetch('./deals.json?v=' + Date.now()).then(r=>r.json()).then(data => {
    state.deals = data.deals || [];
    const dt = new Date(data.updated);
    $('updated').textContent = 'Updated ' + dt.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ', ' + dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    countUp($('count'), state.deals.length);
    const nCodes = state.deals.filter(d=>d.code).length;
    $('codes').textContent = nCodes;
    if (!nCodes) state.noCodes = true;
    $('coupons').textContent = state.deals.filter(d=>d.type==='coupon' && !d.code).length;
    panels(); rank(); render();
  }).catch(() => { grid.innerHTML=''; $('empty').hidden=false; $('empty').querySelector('p').textContent='Deals could not load right now. Please refresh the page.'; });
})();
