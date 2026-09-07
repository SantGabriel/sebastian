import { renderNav } from './lib/nav.js';

renderNav('ajuda');

const links = [...document.querySelectorAll('.toc a')].filter((link) => link.hash);
const sections = links
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function setActive(id) {
  links.forEach((link) => link.classList.toggle('active', link.hash === `#${id}`));
}

let ignoreScrollUntil = 0;

links.forEach((link) => {
  link.addEventListener('click', () => {
    setActive(link.hash.slice(1));
    ignoreScrollUntil = Date.now() + 700;
  });
});

function updateActive() {
  if (Date.now() < ignoreScrollUntil) return;

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) {
    setActive(sections[sections.length - 1].id);
    return;
  }

  const bandBottom = window.innerHeight * 0.3;
  let best = null;
  let bestOverlap = 0;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const overlap = Math.min(rect.bottom, bandBottom) - Math.max(rect.top, 0);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = section;
    }
  });

  if (best) setActive(best.id);
}

let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateActive();
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
updateActive();

const pixCopyBtn = document.getElementById('pix-copy-btn');
const pixCode = document.getElementById('pix-code');

if (pixCopyBtn && pixCode) {
  pixCopyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(pixCode.textContent.trim());
    const originalLabel = pixCopyBtn.innerHTML;
    pixCopyBtn.classList.add('copied');
    pixCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
    setTimeout(() => {
      pixCopyBtn.classList.remove('copied');
      pixCopyBtn.innerHTML = originalLabel;
    }, 2000);
  });
}
