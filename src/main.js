import './style.css'

function createCard(site) {
  const card = document.createElement('div');
  card.className = `card ${site.size || ''}`;

  const lastUpdated = new Date(site.updated_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  // 영문 원본 이름은 작게 주소 옆에 표시
  const displayUrl = site.url.replace('https://', '');

  card.innerHTML = `
    <div class="card-content">
      <span class="card-tag">${site.tag || 'LIVE PROJECT'}</span>
      <h3>${site.name}</h3>
      <p class="site-url">${displayUrl}</p>
    </div>
    <div class="card-footer">
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span style="font-size: 0.75rem; color: var(--text-secondary)">Sync: ${lastUpdated}</span>
      </div>
      <a href="${site.url}" target="_blank" class="visit-btn">방문하기</a>
    </div>
  `;
  return card;
}

async function init() {
  const container = document.querySelector('#project-container');
  container.innerHTML = '';

  let sites = [];

  try {
    const response = await fetch('/sites-manifest.json');
    if (response.ok) {
      sites = await response.json();
    }
  } catch (e) {
    console.log('No manifest found.');
  }

  if (sites.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'card card-large';
    emptyCard.innerHTML = `
      <div class="card-content">
        <span class="card-tag">NOTICE</span>
        <h3>프로젝트를 찾을 수 없습니다</h3>
        <p>터미널에서 'node fetch-sites.js'를 실행해 주세요.</p>
      </div>
    `;
    container.appendChild(emptyCard);
    return;
  }

  sites.forEach((site, index) => {
    const card = createCard(site);
    card.style.animationDelay = `${index * 0.05}s`;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', init);
