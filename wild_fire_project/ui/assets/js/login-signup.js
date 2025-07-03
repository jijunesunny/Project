//../ui/assets/js/login-signup.js

// 로그인 성공/실패 처리 함수
// 로그인 시도 (JSP로 post 날릴 땐 e.preventDefault 지우고 서버로 전송)
function handleLogin(e) {
  e.preventDefault();
  const id = document.getElementById('userId').value.trim();
  const pw = document.getElementById('userPw').value.trim();
  const msg = document.getElementById('loginMsg');

  // (실제는 JSP에서 처리)
  if (!id || !pw) {
    msg.textContent = "아이디와 비밀번호를 모두 입력하세요.";
    msg.style.color = "#ce3131";
    return false;
  }

  //(예시) 실제는 서버에서 처리
  if (id === "testuser" && pw === "12345678") {
    msg.style.color = "green";
    msg.textContent = "로그인 성공!";
    setTimeout(() => location.href="main.html", 1200); // 로그인 성공 후 메인(혹은 리로드)
  } else {
    msg.textContent = "잘못입력하셨습니다. 다시 입력해주세요.";
    msg.style.color = "#ce3131";
  }
  return false;
}
function handleSignup(e) {
  e.preventDefault();
  // 간단 안내
  alert('회원가입 요청이 서버로 전송되었습니다!\n(실제로는 JSP에서 처리)');
  showLoginForm();
  return false;
}

// 로그인 폼 렌더
function showLoginForm() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="login-bg-center">
      <section class="login-box-centered">
        <h2 class="login-title">로그인</h2>
        <form class="login-form" method="post" action="/member" onsubmit="return handleLogin(event)">
          <input type="text" id="userId" name="userId" placeholder="아이디 (6~20자)" required minlength="6" maxlength="20" autocomplete="username">
          <input type="password" id="userPw" name="userPw" placeholder="비밀번호 (8~12자)" required minlength="8" maxlength="12" autocomplete="current-password">
          <div class="form-options">
            <label><input type="checkbox" id="saveId"> 아이디 저장</label>
            <span class="find-links">
              <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a>
            </span>
          </div>
          <button type="submit" class="login-btn">로그인</button>
          <div class="login-message" id="loginMsg"></div>
        </form>
        <div class="social-login-wrap">
          <span>간편 로그인</span>
          <div class="social-buttons">
            <button type="button" class="sns-btn naver" title="네이버" onclick="alert('준비중!')">N</button>
            <button type="button" class="sns-btn kakao" title="카카오" onclick="alert('준비중!')">K</button>
            <button type="button" class="sns-btn google" title="구글" onclick="alert('준비중!')">G</button>
            <button type="button" class="sns-btn facebook" title="페이스북" onclick="alert('준비중!')">F</button>
          </div>
        </div>
        <div class="to-signup">
          <span>아직 회원이 아니신가요?</span>
          <button class="signup-link login-back-btn" onclick="gotoSignup()">회원가입</button>
        </div>
      </section>
    </div>
  `;
}

// 회원가입 폼 렌더
function gotoSignup() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="login-bg-center">
      <section class="signup-box-centered">
        <h2 class="signup-title">회원가입</h2>
        <form class="signup-form" method="post" action="/register" onsubmit="return handleSignup(event)">
          <input type="text" id="name" name="name" placeholder="이름(한글)" required maxlength="10">
          <input type="text" id="newUserId" name="userId" placeholder="아이디(6~20자)" required minlength="6" maxlength="20">
          <input type="password" id="newUserPw" name="userPw" placeholder="비밀번호(8~12자)" required minlength="8" maxlength="12">
          <input type="email" id="email" name="email" placeholder="이메일" required>
          <input type="text" id="phone" name="phone" placeholder="전화번호" required maxlength="15">
          <button type="submit" class="login-btn signup-btn">회원가입</button>
        </form>
        <div class="to-login">
          <span>이미 회원이신가요?</span>
          <button class="login-link-box" onclick="showLoginForm()">로그인</button>
        </div>
      </section>
    </div>
  `;
}


