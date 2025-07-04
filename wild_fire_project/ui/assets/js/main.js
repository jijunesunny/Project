//../assets/js/main.js
// 공통 Header/Footer 불러오기 (상대경로 유의)
function loadComponent(selector, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => document.querySelector(selector).innerHTML = html)
    .then(() => { if(selector==="#header-area") setHeaderActions(); 
  });
}
// header, footer 삽입 (상대경로!)
loadComponent("#header-area", "../assets/common/header.html");
loadComponent("#footer-area", "../assets/common/footer.html");

// 배너 이미지 5초 전환 + overlay 유지
document.addEventListener('DOMContentLoaded', () => {
  const slideImgs = document.querySelectorAll('.banner-img');
  if(slideImgs.length) {
    let idx = 0;
    setInterval(() => {
      slideImgs[idx].classList.remove('active');
      idx = (idx+1) % slideImgs.length;
      slideImgs[idx].classList.add('active');
    }, 5000);
  }
});
// 네비/언어/로그인 hover & 클릭
function setHeaderActions() {
  // 언어 버튼 토글
  const langBtn = document.querySelector('.btn-lang');
  if(langBtn) {
    langBtn.addEventListener('click', () => {
      langBtn.textContent = langBtn.textContent === '한국어' ? 'English' : '한국어';
    });
  }
// header 로드 후 "로그인" 이벤트 연결
  const btnLogin = document.querySelector('.btn-login');
  if(btnLogin) {
    btnLogin.addEventListener('mouseenter', () => btnLogin.classList.add('hover'));
    btnLogin.addEventListener('mouseleave', () => btnLogin.classList.remove('hover'));
    btnLogin.addEventListener('click', showLoginForm);
  }
// 네비/인스타 후버(아이콘, a링크 CSS에서) 
}

// (index.html에 .feature-item이 여러개라면 정확히 "실시간 확인"만 골라야함)
document.querySelectorAll('.feature-item')[0].onclick = function() {
  window.location.href = '../assets/pages/dashboard.html';
};