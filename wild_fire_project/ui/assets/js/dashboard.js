//../assets/js/dashboard.js ((4개코드로 분리했음))
// 산불 확산 예측 대시보드 JS 스크립트
// UI 이벤트,공통 기능(드롭다운, 댓글 등)
//spread-dashboard.js스타트 메인초기화 +UI이벤트핸들러
// dashboard.js 시작 부분

import { initKakaoMapAPI, showMap, drawWildfireRoute, resetMapToGuide } from './map-handler.js';
import { getRegionCenters } from './data-handler.js';
import { initCharts, updateCharts } from './chart-handler.js';
const centers = getRegionCenters();
console.log(centers);
initCharts();

document.addEventListener('DOMContentLoaded', () => {
  // 드롭다운 관련
  const dropdownSelected = document.querySelector('#region-dropdown .dropdown-selected');
  const dropdownList = document.querySelector('#region-dropdown .dropdown-list');

  if (dropdownSelected && dropdownList) {
    dropdownSelected.addEventListener('click', () => {
      dropdownList.classList.toggle('open');
    });

    // 드롭다운 리스트 클릭 처리
    dropdownList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        selectRegion(li);
      });
    });
  }

  // 바깥 클릭 시 드롭다운 닫기
  document.addEventListener('mousedown', (e) => {
    const dd = document.getElementById('region-dropdown');
    if (dd && !dd.contains(e.target)) {
      dropdownList.classList.remove('open');
    }
  });

  // 예측 실행 버튼
  const runPredictBtn = document.getElementById('run-predict');
  if (runPredictBtn) {
    runPredictBtn.addEventListener('click', () => {
      const region = dropdownSelected.querySelector('span').textContent.trim();
      const dateInput = document.getElementById('predict-date');
      const predictDate = dateInput ? dateInput.value : '';

      if (!region || region === '시군 지역을 선택하세요') {
        alert('시군 지역을 선택하세요!');
        return;
      }
      if (!predictDate) {
        alert('산불예측일자를 선택하세요!');
        return;
      }

      drawWildfireRoute(region, predictDate);
      updateCharts(region, predictDate);
    });
  }

  // 초기 지도 안내 문구 표시
  resetMapToGuide();

  // 카카오맵 API 초기화 및 기본 지도 표시 (춘천시)
  initKakaoMapAPI(() => {
    showMap('춘천시');
  });

  // 댓글 기능 초기화는 기존 코드에서 유지
  initComments();
});

// 지역 선택 함수 (드롭다운 선택 및 UI 변경)
function selectRegion(el) {
  const dropdownSelected = document.querySelector('#region-dropdown .dropdown-selected span');
  const dropdownList = document.querySelector('#region-dropdown .dropdown-list');
  if (dropdownSelected && dropdownList) {
    dropdownSelected.textContent = el.textContent;
    dropdownList.classList.remove('open');
  }
  showMap(el.textContent.trim());
}

// 댓글 기능 부분 (기존 함수 유지)
// initComments() 함수 및 댓글 이벤트는 여기 넣으세요. (기존 spread-dashboard.js 내용 복사)

function initComments() {
  let comments = [];
  try {
    comments = JSON.parse(localStorage.getItem('seed_comments_json')) || [
      { id: 1, text: "좋은 예측입니다!", replies: [ { id: 11, text: "동의합니다.", replies: [] } ] },
      { id: 2, text: "지도 확대기능까지있고~와우", replies: [] }
    ];
  } catch (e) {
    comments = [
      { id: 1, text: "좋은 예측입니다!", replies: [ { id: 11, text: "동의합니다.", replies: [] } ] },
      { id: 2, text: "지도 확대기능까지있고~와우", replies: [] }
    ];
  }

  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form');
  let replyOpen = null;

  function saveComments() {
    localStorage.setItem('seed_comments_json', JSON.stringify(comments));
  }

  function renderReplies(replies, parentIds) {
    let html = '';
    replies.forEach(r => {
      html += `
        <div style="margin-bottom: 0.5em; margin-left:1.7em; position:relative;">
          <span class="cmt-ico"><i class="fas fa-comment-dots"></i></span>
          ↳ ${r.text}
          <button class="reply-btn" style="color:var(--color-nav-text);" onclick="showReplyForm(${JSON.stringify([...parentIds, r.id])})">답글</button>
          <div id="reply-form-${[...parentIds, r.id].join('-')}" class="reply-form"></div>
          ${r.replies && r.replies.length ? renderReplies(r.replies, [...parentIds, r.id]) : ''}
        </div>
      `;
    });
    return html;
  }

  function renderComments() {
    commentList.innerHTML = '';
    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <span class="cmt-ico"><i class="fas fa-comment-dots"></i></span>
        <b>익명</b>: ${c.text}
        <button class="reply-btn" style="color:var(--color-nav-text);" onclick="showReplyForm([${c.id}])">답글</button>
        <div id="reply-form-${c.id}" class="reply-form"></div>
        <div class="reply-list">${c.replies && c.replies.length ? renderReplies(c.replies, [c.id]) : ''}</div>
      `;
      commentList.appendChild(item);
    });
    if (replyOpen) openReplyInput(replyOpen.ids);
  }

  window.showReplyForm = function(ids) {
    document.querySelectorAll('.reply-form').forEach(f => f.innerHTML = '');
    replyOpen = { ids };
    openReplyInput(ids);
  };

  function openReplyInput(ids) {
    const formId = `reply-form-${ids.join('-')}`;
    const targetDiv = document.getElementById(formId);
    if (!targetDiv) return;
    targetDiv.innerHTML = `
      <input type="text" class="reply-input" placeholder="답글 입력"
        style="width:55%;min-width:8rem;max-width:16rem;
        background:var(--color-body-bg);color:#21897e;
        border:1.2px solid var(--color-nav-text);border-radius:0.6rem;
        padding:0.3rem 0.6rem;font-size:1.01rem;margin-right:0.4em;">
      <button class="reply-write-btn" style="
        background:var(--color-nav-text);color:#4d3733;border-radius:0.5rem;
        font-weight:700;padding:0.22rem 1.1rem;border:none;font-size:1.01rem;
        margin-top:0.05rem;vertical-align:middle;" onclick="submitReply('${ids.join('-')}')">작성</button>
    `;
    const input = targetDiv.querySelector('.reply-input');
    input.focus();
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        targetDiv.innerHTML = '';
        replyOpen = null;
      }
    });
  }

  window.submitReply = function(idsStr) {
    const ids = idsStr.split('-').map(Number);
    const formId = `reply-form-${ids.join('-')}`;
    const targetDiv = document.getElementById(formId);
    const input = targetDiv.querySelector('.reply-input');
    const txt = input.value.trim();
    if (!txt) return;

    let arr = comments;
    for (let i = 0; i < ids.length; i++) {
      const found = arr.find(c => c.id === ids[i]);
      if (i === ids.length - 1) {
        found.replies = found.replies || [];
        found.replies.push({ id: Date.now(), text: txt, replies: [] });
      } else {
        arr = found.replies;
      }
    }
    saveComments();
    renderComments();
    replyOpen = null;
  };

  commentForm.onsubmit = e => {
    e.preventDefault();
    const txt = commentForm.comment.value.trim();
    if (txt) {
      comments.push({ id: Date.now(), text: txt, replies: [] });
      commentForm.comment.value = '';
      saveComments();
      renderComments();
    }
  };

  document.addEventListener('mousedown', function (e) {
    if (!e.target.closest('.reply-form') && !e.target.classList.contains('reply-btn')) {
      document.querySelectorAll('.reply-form').forEach(f => f.innerHTML = '');
      replyOpen = null;
    }
  });

  renderComments();
}
