document.getElementById('vacationForm').addEventListener('submit', async e => {
  e.preventDefault();

  const nameInput = document.getElementById('vacName');
  const dateInput = document.getElementById('vacDate');
  const name = nameInput.value.trim();
  const date = dateInput.value;

  nameInput.classList.toggle('input-error', !name);
  dateInput.classList.toggle('input-error', !date);
  if (!name || !date) return;

  const btn = document.querySelector('.submit-btn');
  btn.disabled = true;
  btn.textContent = '신청 중...';

  try {
    const result = await gasPost({ action: 'vacation', name, date });

    if (result.success === false) {
      throw new Error(result.message || '신청에 실패했습니다.');
    }

    const [y, m, d] = date.split('-');
    document.getElementById('successDesc').textContent =
      result.message ||
      `${name} 님의 ${y}년 ${parseInt(m)}월 ${parseInt(d)}일 휴가 신청이 접수되었습니다.`;

    document.getElementById('vacationForm').hidden    = true;
    document.getElementById('vacationSuccess').hidden = false;
  } catch (err) {
    alert(`신청 중 오류가 발생했습니다.\n${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = '신청하기';
  }
});

document.getElementById('vacResetBtn').addEventListener('click', () => {
  document.getElementById('vacationForm').reset();
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.getElementById('vacationForm').hidden    = false;
  document.getElementById('vacationSuccess').hidden = true;
});
