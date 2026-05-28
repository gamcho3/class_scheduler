const today = new Date();
let calendarData = {};  // 날짜별 항목 배열 { [dateKey]: [{제목, 설명, 상태, 색상}] }

const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const MAX_PILLS  = 2;

const RANGE_START = new Date(2026, 2, 30);   // 2026-03-30
const RANGE_END   = new Date(2026, 9, 22);   // 2026-10-22

// 현재 달이 범위 밖이면 가장 가까운 범위 월로 고정
function clampToRange(date) {
  const startMonth = new Date(RANGE_START.getFullYear(), RANGE_START.getMonth(), 1);
  const endMonth   = new Date(RANGE_END.getFullYear(),   RANGE_END.getMonth(),   1);
  if (date < startMonth) return new Date(startMonth);
  if (date > endMonth)   return new Date(endMonth);
  return date;
}

let current      = clampToRange(new Date(today.getFullYear(), today.getMonth(), 1));
let selectedDate = toDateKey(
  today >= RANGE_START && today <= RANGE_END ? today : RANGE_START
);

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeColor(color) {
  if (!color) return '#888888';
  const hex = color.replace('#', '');
  return '#' + hex.padEnd(6, '0').slice(0, 6);
}

// ── 데이터 로드 ──────────────────────────────────────
// GAS 응답 형식: [{날짜, 제목, 설명, 상태, 색상}, ...]
async function loadCalendarData() {
  const json = await gasGet('calendar');
  calendarData = {};
  for (const item of (Array.isArray(json) ? json : [])) {
    const [yy, mm, dd] = item['날짜'].split('-');
    const key = `20${yy}-${mm}-${dd}`;
    if (!calendarData[key]) calendarData[key] = [];
    calendarData[key].push({
      title:       item['제목']  || '',
      description: item['설명'] || '',
      status:      item['상태'] || '',
      color:       normalizeColor(item['색상']),
    });
  }
}

// ── 셀 생성 ──────────────────────────────────────────
function makeCell(dateNum, classes, dateKey) {
  const cell = document.createElement('div');

  // 범위 밖 날짜는 other-month처럼 비활성화
  const inRange = dateKey && dateKey >= toDateKey(RANGE_START) && dateKey <= toDateKey(RANGE_END);
  if (dateKey && !inRange) classes += ' out-of-range';

  cell.className = 'day ' + classes;

  const numEl = document.createElement('span');
  numEl.className = 'day-num';
  numEl.textContent = dateNum;
  cell.appendChild(numEl);

  if (inRange) {
    const items = calendarData[dateKey] || [];

    // 공휴일 → 날짜 숫자 빨간색 + 이름 라벨
    items.filter(i => i.status === '공휴일').forEach(i => {
      cell.classList.add('holiday');
      const label = document.createElement('span');
      label.className = 'holiday-label';
      label.textContent = i.title;
      cell.appendChild(label);
    });

    // 나머지 → 컬러 pill
    const pillItems = items.filter(i => i.status !== '공휴일');
    pillItems.slice(0, MAX_PILLS).forEach(i => {
      const pill = document.createElement('div');
      pill.className = 'event-pill';
      pill.style.cssText = `background:${i.color}22;color:${i.color};border-left:3px solid ${i.color}`;
      pill.textContent = i.title;
      cell.appendChild(pill);
    });

    if (pillItems.length > MAX_PILLS) {
      const more = document.createElement('div');
      more.className = 'event-more';
      more.textContent = `+${pillItems.length - MAX_PILLS}`;
      cell.appendChild(more);
    }

    cell.addEventListener('click', () => selectDate(dateKey, cell));
  }
  return cell;
}

// ── 달력 렌더링 ──────────────────────────────────────
function renderCalendar() {
  const year  = current.getFullYear();
  const month = current.getMonth();

  document.getElementById('monthTitle').textContent = `${year}년 ${monthNames[month]}`;

  const grid = document.getElementById('daysGrid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLast = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(makeCell(prevLast - firstDay + 1 + i, 'other-month' + (i === 0 ? ' sunday' : ''), null));
  }
  for (let d = 1; d <= lastDate; d++) {
    const dow     = (firstDay + d - 1) % 7;
    const dateKey = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = '';
    if (dow === 0) cls += ' sunday';
    if (dow === 6) cls += ' saturday';
    if (dateKey === toDateKey(today)) cls += ' today';
    if (dateKey === selectedDate)     cls += ' selected';
    grid.appendChild(makeCell(d, cls.trim(), dateKey));
  }
  const total = firstDay + lastDate;
  const rem   = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= rem; i++) {
    const dow = (total + i - 1) % 7;
    grid.appendChild(makeCell(i, 'other-month' + (dow === 6 ? ' saturday' : ''), null));
  }

  // 범위 경계에서 이전/다음 버튼 비활성화
  const startMonth = new Date(RANGE_START.getFullYear(), RANGE_START.getMonth(), 1);
  const endMonth   = new Date(RANGE_END.getFullYear(),   RANGE_END.getMonth(),   1);
  document.getElementById('prevBtn').disabled = current <= startMonth;
  document.getElementById('nextBtn').disabled = current >= endMonth;
}

function selectDate(dateKey, el) {
  selectedDate = dateKey;
  document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  renderDetail(dateKey);
}

function renderDetail(dateKey) {
  const [y, m, d] = dateKey.split('-');
  document.getElementById('eventHeader').textContent = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;

  const list  = document.getElementById('eventList');
  const items = calendarData[dateKey] || [];
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<p class="event-empty">일정이 없습니다.</p>';
    return;
  }

  items.forEach(i => {
    const item = document.createElement('div');
    item.className = 'event-item';
    item.innerHTML = `
      <div class="event-dot" style="background:${i.color}"></div>
      <div class="event-info">
        <div class="event-title">${i.title}</div>
        <div class="event-desc">${i.description}</div>
      </div>
      <div class="event-time">${i.status}</div>
    `;
    list.appendChild(item);
  });
}

// ── 월 이동 ──────────────────────────────────────────
document.getElementById('prevBtn').addEventListener('click', () => {
  current.setMonth(current.getMonth() - 1);
  renderCalendar();
});
document.getElementById('nextBtn').addEventListener('click', () => {
  current.setMonth(current.getMonth() + 1);
  renderCalendar();
});

// ── 초기화 ──────────────────────────────────────────
const grid = document.getElementById('daysGrid');
grid.innerHTML = '<p class="grid-loading">불러오는 중...</p>';

loadCalendarData()
  .then(() => {
    renderCalendar();
    renderDetail(selectedDate);
  })
  .catch(err => {
    grid.innerHTML = `<p class="grid-error">데이터를 불러오지 못했습니다.<br>${err.message}</p>`;
  });
