(() => {
  const TAG = 'sergiosimon-20';
  const state = { deals: [], type: 'all', cat: 'All', q: '' };
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
  const TYPES = [['all','All deals'],['saved','Saved'],['code','Promo codes'],['coupon','Clip coupons'],['deal','Price drops']];

  function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1800); }

  function chips(){
    $('types').innerHTML = TYPES.filter(([k]) => !(k==='code' && state.noCodes)).map(([k,l]) => `<button type="button" class="chip" data-type="${k}" aria-pressed="${state.type===k}">${k==='saved' ? `<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>${l}${saved.size ? ` <span class="n">${[...saved].filter(a=>state.deals.some(d=>d.asin===a)).length}</span>` : ''}` : l}</button>`).join('');
    const cats = ['All', ...new Set(state.deals.map(d => d.category))].sort((a,b)=> a==='All'?-1:b==='All'?1:a.localeCompare(b));
    $('cats').innerHTML = cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${state.cat===c}">${esc(c)}</button>`).join('');
  }

  function card(d){
    const typeTag = d.code ? '<span class="tag code">Promo code</span>' : d.type==='coupon' ? '<span class="tag coupon">Clip coupon</span>' : d.pick ? '<span class="tag pick">Top pick</span>' : '<span class="tag">Price drop</span>';
    const code = d.code ? `<div class="codebox"><code>${esc(d.code)}</code><button type="button" class="btn small" data-copy="${esc(d.code)}" aria-label="Copy code ${esc(d.code)}">Copy code</button></div>` : '';
    const media = d.image
      ? `<div class="art photo"><img src="${esc(d.image)}" alt="${esc(d.title)}" loading="lazy" width="400" height="300"></div>`
      : window.CAT_ART(d.category);
    const on = saved.has(d.asin);
    const fav = `<button type="button" class="fav" data-fav="${esc(d.asin)}" aria-pressed="${on}" aria-label="${on?'Remove from saved':'Save for later'}: ${esc(d.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>`;
    return `<article class="card">
      ${fav}
      <a class="media" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored" tabindex="-1" aria-hidden="true">${media}</a>
      <div class="card-top"><span class="cat">${esc(d.category)}</span>${typeTag}</div>
      <p class="off">${esc(d.offer)}</p>
      <h2>${esc(d.title)}</h2>
      ${d.brand ? `<p class="brand">${esc(d.brand)}</p>` : ''}
      ${d.desc ? `<p class="desc">${esc(d.desc)}</p>` : ''}
      <p class="note">${esc(d.note||'')}</p>
      ${code}
      <div class="actions"><a class="btn primary" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored">See today's price on Amazon</a></div>
    </article>`;
  }

  function render(){
    const q = state.q.trim().toLowerCase();
    const list = state.deals.filter(d =>
      (state.type==='all' || (state.type==='saved' ? saved.has(d.asin) : state.type==='code' ? !!d.code : d.type===state.type && !d.code)) &&
      (state.cat==='All' || d.category===state.cat) &&
      (!q || `${d.title} ${d.brand} ${d.category} ${d.desc||''}`.toLowerCase().includes(q)));
    grid.innerHTML = list.map(card).join('');
    $('empty').hidden = list.length>0;
    $('empty').querySelector('p').innerHTML = state.type==='saved' && !q && state.cat==='All'
      ? '<strong>Nothing saved yet.</strong> Tap the heart on any deal to keep it here for later.'
      : '<strong>No deals match that.</strong> Try a different word or clear the filters.';
    chips();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if (b.dataset.fav){
      const a=b.dataset.fav; const was=saved.has(a);
      was ? saved.delete(a) : saved.add(a); persist();
      toast(was ? 'Removed from saved' : 'Saved for later');
      if (state.type==='saved') render(); else { b.setAttribute('aria-pressed', !was); b.setAttribute('aria-label', (was?'Save for later':'Remove from saved') + b.getAttribute('aria-label').replace(/^[^:]*/,'')); chips(); }
    }
    else if (b.dataset.type){ state.type=b.dataset.type; render(); }
    else if (b.dataset.cat){ state.cat=b.dataset.cat; render(); }
    else if (b.dataset.copy){
      const c=b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(()=>toast(`Copied ${c}`)).catch(()=>{
        const r=document.createRange(); r.selectNodeContents(b.previousElementSibling); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast('Code selected, copy it manually');
      });
    } else if (b.id==='reset'){ state.type='all'; state.cat='All'; state.q=''; $('q').value=''; render(); }
  });
  $('q').addEventListener('input', e => { state.q=e.target.value; render(); });

  function countUp(el, n){ let i=0; const step=()=>{ i=Math.min(n,i+Math.max(1,Math.ceil(n/20))); el.textContent=i; if(i<n) requestAnimationFrame(step); }; n?step():el.textContent='0'; }

  fetch('./deals.json?v=' + Date.now()).then(r=>r.json()).then(data => {
    state.deals = data.deals || [];
    const dt = new Date(data.updated);
    $('updated').textContent = 'Updated ' + dt.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ', ' + dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    countUp($('count'), state.deals.length);
    const nCodes = state.deals.filter(d=>d.code).length;
    countUp($('codes'), nCodes);
    if (!nCodes) { $('codes').parentElement.hidden = true; state.noCodes = true; }
    countUp($('coupons'), state.deals.filter(d=>d.type==='coupon' && !d.code).length);
    render();
  }).catch(() => { grid.innerHTML=''; $('empty').hidden=false; $('empty').querySelector('p').textContent='Deals could not load right now. Please refresh the page.'; });
})();
