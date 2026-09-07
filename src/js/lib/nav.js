const NAV_ITEMS = [
  { id: 'dashboard', label: 'Vagas', href: '/index.html', icon: 'fa-solid fa-briefcase' },
  { id: 'candidaturas', label: 'Candidaturas', href: '/src/pages/candidaturas.html', icon: 'fa-solid fa-clock-rotate-left' },
  { id: 'insights', label: 'Insights', href: '/src/pages/insights.html', icon: 'fa-solid fa-chart-line' },
  { id: 'ajuda', label: 'Ajuda', href: '/src/pages/ajuda.html', icon: 'fa-solid fa-circle-question' }
];

export function renderNav(activeId) {
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.innerHTML = `
    <a href="/index.html" class="toc-brand">
      <img src="/assets/logo.png" alt="Sebastian Logo" height="50" />
      <span class="nome-logo fonte-baskerville">Sebastian</span>
    </a>
    <div class="app-nav-links">
      ${NAV_ITEMS.map(item => `
        <a href="${item.href}" class="app-nav-link${item.id === activeId ? ' active' : ''}">
          <i class="${item.icon}"></i> ${item.label}
        </a>
      `).join('')}
    </div>
  `;
  document.body.insertBefore(nav, document.body.firstChild);
}
