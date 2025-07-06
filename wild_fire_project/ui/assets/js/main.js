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
  // ── 사용자 메뉴 드롭다운 토글 & 클릭 핸들러 ──
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    const loginBtn = userMenu.querySelector('.btn-login');
    const menuList = userMenu.querySelector('.dropdown-list-user');

    // 1) 로그인 상태라면 메뉴 열기, 아니라면 로그인 폼
    loginBtn.addEventListener('click', () => {
      if (localStorage.getItem('loggedUser')) {
        menuList.classList.toggle('open');
      } else {
        window.showLoginForm();
      }
    });

    // 2) 메뉴 항목별 동작
    userMenu.querySelector('#link-mypage')
      .addEventListener('click', () => {
        menuList.classList.remove('open');
        location.href = '../assets/pages/mypage.html';
      });
    userMenu.querySelector('#link-view-results')
      .addEventListener('click', () => {
        menuList.classList.remove('open');
        // 마지막 조회 결과 대시보드에서 보기
        location.href = '../assets/pages/dashboard.html?view=last';
      });
    userMenu.querySelector('#link-download')
      .addEventListener('click', () => {
        menuList.classList.remove('open');
        // 마지막 조회 결과 다운로드
        const rec = JSON.parse(localStorage.getItem('lastViewedResult'));
        if (rec) {
          const blob = new Blob([JSON.stringify(rec.payload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `result-${rec.id}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    userMenu.querySelector('#link-logout')
      .addEventListener('click', () => {
        menuList.classList.remove('open');
        localStorage.removeItem('loggedUser');
        location.href = '../pages/index.html';
      });

    // 3) 외부 클릭 시 드롭다운 닫기
    document.addEventListener('mousedown', e => {
      if (!userMenu.contains(e.target)) {
        menuList.classList.remove('open');
      }
    });
  }

// header 로드 후 "로그인" 이벤트 연결
//─ 로그인 버튼 hover & click (추가)
  const btnLogin = document.querySelector('.btn-login');
  if(btnLogin) {
    // btnLogin.addEventListener('mouseenter', () => btnLogin.classList.add('hover'));
    // btnLogin.addEventListener('mouseleave', () => btnLogin.classList.remove('hover'));
    // btnLogin.addEventListener('click', showLoginForm);
    btnLogin.addEventListener('mouseenter', () => btnLogin.classList.add('hover'));
    btnLogin.addEventListener('mouseleave', () => btnLogin.classList.remove('hover'));
    btnLogin.addEventListener('click', () => {
      // 보완: login-signup.js 의 전역 showLoginForm 호출
      if (typeof window.showLoginForm === 'function') {
        window.showLoginForm();
      }
    });
  }

  // showLoginForm 임시방편
function showLoginForm() {
  alert('로그인 기능 준비중!');
}
// 네비/인스타 후버(아이콘, a링크 CSS에서) 
}

//실시간확인창 눌러서 dashboard.html로 연결
// (index.html에 .feature-item이 여러개라면 정확히 "실시간 확인"만 골라야함)
const featureItems = document.querySelectorAll('.feature-item');
if (featureItems.length > 0) {
  featureItems[0].onclick = function() {
    window.location.href = '../assets/pages/dashboard.html';
  };
}