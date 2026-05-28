// ── 초기 로딩 상태 ──────────────────────────────────
const noticeListEl = document.getElementById('noticeList');
noticeListEl.innerHTML = '<p class="list-loading">불러오는 중...</p>';

// ── 공지사항 목록 렌더링 ─────────────────────────────
function renderList(notices) {
  noticeListEl.innerHTML = '';

  if (!notices.length) {
    noticeListEl.innerHTML = '<p class="event-empty">공지사항이 없습니다.</p>';
    return;
  }

  notices.forEach(n => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <span class="notice-item-title">${n.title}</span>
      <span class="notice-item-date">${n.date}</span>
      <span class="notice-item-preview">${n.content.replace(/\n/g, ' ')}</span>
    `;
    item.addEventListener('click', () => openDetail(n));
    noticeListEl.appendChild(item);
  });
}

function openDetail(n) {
  document.getElementById('noticeDetailTitle').textContent = n.title;
  document.getElementById('noticeDetailDate').textContent  = n.date;
  document.getElementById('noticeDetailBody').textContent  = n.content;
  noticeListEl.hidden = true;
  document.getElementById('noticeDetail').hidden = false;
}

document.getElementById('noticeBackBtn').addEventListener('click', () => {
  document.getElementById('noticeDetail').hidden = true;
  noticeListEl.hidden = false;
});

// ── GAS에서 공지사항 로드 ────────────────────────────
gasGet('notices')
  .then(json => renderList(Array.isArray(json) ? json : []))
  .catch(err => {
    noticeListEl.innerHTML =
      `<p class="list-error">공지사항을 불러오지 못했습니다.<br>${err.message}</p>`;
  });
