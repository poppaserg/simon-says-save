(() => {
  const TAG = 'sergiosimon-20';
  const state = { deals: [], type: 'all', cat: 'All', q: '' };
  const $ = id => document.getElementById(id);
  const grid = $('grid');
  grid.innerHTML = '<div class="skel"></div>'.repeat(6);

  const link = asin => `https://www.amazon.com/dp/${asin}?tag=${TAG}&linkCode=ll1`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TYPES = [['all','All deals'],['code','Promo codes'],['coupon','Clip coupons'],['deal','Price drops']];

  function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1800); }

  function chips(){
    $('types').innerHTML = TYPES.filter(([k]) => !(k==='code' && state.noCodes)).map(([k,l]) => `<button type="button" class="chip" data-type="${k}" aria-pressed="${state.type===k}">${l}</button>`).join('');
    const cats = ['All', ...new Set(state.deals.map(d => d.category))].sort((a,b)=> a==='All'?-1:b==='All'?1:a.localeCompare(b));
    $('cats').innerHTML = cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${state.cat===c}">${esc(c)}</button>`).join('');
  }

  function card(d){
    const typeTag = d.code ? '<span class="tag code">Promo code</span>' : d.type==='coupon' ? '<span class="tag coupon">Clip coupon</span>' : d.pick ? '<span class="tag pick">Top pick</span>' : '<span class="tag">Price drop</span>';
    const code = d.code ? `<div class="codebox"><code>${esc(d.code)}</code><button type="button" class="btn small" data-copy="${esc(d.code)}" aria-label="Copy code ${esc(d.code)}">Copy code</button></div>` : '';
    return `<article class="card">
      <div class="card-top"><span class="cat">${esc(d.category)}</span>${typeTag}</div>
      <p class="off">${esc(d.offer)}</p>
      <h2>${esc(d.title)}</h2>
      ${d.brand ? `<p class="brand">${esc(d.brand)}</p>` : ''}
      <p class="note">${esc(d.note||'')}</p>
      ${code}
      <div class="actions"><a class="btn primary" href="${link(d.asin)}" target="_blank" rel="noopener noreferrer sponsored">Get deal on Amazon</a></div>
    </article>`;
  }

  function render(){
    const q = state.q.trim().toLowerCase();
    const list = state.deals.filter(d =>
      (state.type==='all' || (state.type==='code' ? !!d.code : d.type===state.type && !d.code)) &&
      (state.cat==='All' || d.category===state.cat) &&
      (!q || `${d.title} ${d.brand} ${d.category}`.toLowerCase().includes(q)));
    grid.innerHTML = list.map(card).join('');
    $('empty').hidden = list.length>0;
    chips();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if (b.dataset.type){ state.type=b.dataset.type; render(); }
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
