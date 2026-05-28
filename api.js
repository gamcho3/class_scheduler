/**
 * Google Apps Script 웹 앱 URL
 * GAS 배포 후 아래 URL을 교체하세요.
 *
 * GAS doGet(e)  → e.parameter.action 으로 분기
 * GAS doPost(e) → JSON.parse(e.postData.contents) 로 본문 파싱
 *
 * 예상 응답 형식:
 *   action=calendar → [{날짜, 제목, 설명, 상태, 색상}, ...]  (공휴일 + 이벤트 통합)
 *   action=notices  → [{id, title, date, content}, ...]
 *   POST {action:'vacation', name, date} → {success: true, message: '...'}
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwtrEzlYbODIt5gStJViG-sHUS942QsM2yuMvBikk7RJ66IsOqQO-73D60Tckm7r6-P/exec';

/**
 * GAS GET 요청
 * GAS 웹 앱은 배포 시 CORS 헤더를 자동 포함합니다.
 */
async function gasGet(action) {
  const res = await fetch(`${GAS_URL}?action=${encodeURIComponent(action)}`);
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
  return res.json();
}

/**
 * GAS POST 요청
 * Content-Type을 text/plain으로 지정해 브라우저 CORS preflight(OPTIONS)를 우회합니다.
 * GAS 측에서는 e.postData.contents 를 JSON.parse 하여 사용하세요.
 */
async function gasPost(payload) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
  return res.json();
}
