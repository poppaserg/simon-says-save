// Original category illustrations (line art). No Amazon imagery.
window.CAT_ART = (() => {
  const P = {
    Baby: '<path d="M9 3h6M10 3v2.5M14 3v2.5"/><rect x="8" y="5.5" width="8" height="15" rx="3"/><path d="M8 10h3M8 13h3M8 16h3"/>',
    Beauty: '<rect x="5" y="11" width="5" height="10" rx="1"/><path d="M6 11V7.5L9 5v6"/><rect x="13" y="9" width="6" height="12" rx="2"/><path d="M15 9V6h2v3M14.5 3h3"/>',
    Electronics: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    Health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M7.5 12h2.5l1.2-2.5 1.8 5 1.2-2.5h2.3"/>',
    Home: '<path d="M4 20v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M3 20h18M6 12V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M8 16h8"/>',
    Kids: '<rect x="3" y="13" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/><rect x="8.5" y="5" width="7" height="7" rx="1"/><path d="M6.5 16.5h0M17.5 16.5h0M12 8.5h0" stroke-width="2.4"/>',
    Kitchen: '<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M2 11h2M20 11h2M9 4c0 1.5 1 1.5 1 3M13 4c0 1.5 1 1.5 1 3"/>',
    'Smart Home': '<path d="M4 11l8-7 8 7v9H4z"/><path d="M9 15.5a4.2 4.2 0 0 1 6 0M10.7 17.6a1.8 1.8 0 0 1 2.6 0"/><path d="M12 19.5h0" stroke-width="2.2"/>',
    Tools: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2 2 0 0 1-3-3l7.5-7.5"/><path d="M3 21l3-3M5 4l4 4M4 9l5-5"/>',
    Drinks: '<path d="M8 4h8l-.6 2H8.6z"/><path d="M8.6 6l-.6 2v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8l-.6-2"/><path d="M8 11h8M11 14h0M13 16h0M12 12.8h0" stroke-width="1.6"/>',
    Christmas: '<path d="M12 3l1 2h-2z"/><path d="M12 5l-4 5h2.5L7 15h3l-4 4h12l-4-4h3l-3.5-5H16z"/><path d="M11 19v2h2v-2"/>',
    _: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'
  };
  const HUE = { Baby: 240, Beauty: 350, Electronics: 265, Health: 15, Home: 60, Kids: 140, Kitchen: 35, 'Smart Home': 200, Tools: 95, Drinks: 175, Christmas: 150, _: 30 };
  return cat => {
    const k = P[cat] ? cat : '_', h = HUE[k];
    return `<div class="art" style="--h:${h}" aria-hidden="true">
      <span class="blob b1"></span><span class="blob b2"></span>
      <svg viewBox="0 0 24 24">${P[k]}</svg></div>`;
  };
})();
