// spread-dashboard.js
// 산불 확산 예측 대시보드 JS 스크립트
// 2025.07.11 기준 최신 수정본


// === 전역 변수 선언 ===
let kakaoMapReady = false;  // 카카오맵 API 로딩 완료 여부 플래그
let map = null;             // 카카오맵 지도 객체
let mapMarker = null;       // 현재 지도에 표시된 마커 객체
let mapTimer = null;        // 5분 후 지도 초기화 타이머
let fireMarkerImage = null; // 전역변수로 미리 선언

kakao.maps.load(() => {
  console.log('카카오맵 API 정상 로드');
  kakaoMapReady = true;

  // 여기서 마커 이미지 생성
  fireMarkerImage = new kakao.maps.MarkerImage(
    'https://cdn-icons-png.flaticon.com/512/482/482545.png',
    new kakao.maps.Size(32, 32)
  );

  // 최초 지도 띄우기 (기본지역: 춘천시)
  showKakaoMap("춘천시");
});

// 지역별 위도경도 좌표 데이터 (강원도 각 시군)
const regionCenters = {
  "춘천시": [37.8813, 127.7298],
  "원주시": [37.3422, 127.9201],
  "강릉시": [37.7519, 128.8761],
  "동해시": [37.5246, 129.1144],
  "태백시": [37.1641, 128.9856],
  "속초시": [38.2070, 128.5912],
  "삼척시": [37.4436, 129.1652],
  "홍천군": [37.6910, 127.8889],
  "횡성군": [37.4914, 127.9853],
  "영월군": [37.1844, 128.4642],
  "평창군": [37.3704, 128.3900],
  "정선군": [37.3806, 128.6601],
  "철원군": [38.1462, 127.3136],
  "화천군": [38.1051, 127.7080],
  "양구군": [38.1055, 127.9894],
  "인제군": [38.0694, 128.1701],
  "고성군": [38.3800, 128.4677],
  "양양군": [38.0755, 128.6168]
};

// 테스트용 산불 확산 데이터 샘플 (춘천시 예시)
const wildfireData = {
  "춘천시": {
    "2025-07-06": {
      "확산경로": [
        { time: "14:00", lat: 37.8813, lng: 127.7298, 거리: 0, 속도: 0, 풍향: 90 },
        { time: "14:20", lat: 37.8842, lng: 127.7335, 거리: 270, 속도: 47, 풍향: 110 },
        { time: "16:40", lat: 37.8872, lng: 127.7370, 거리: 800, 속도: 104, 풍향: 130 }
      ],
      "속도등급": 3,
      "누적산불수": 2
    }
  }
};

// --- DOMContentLoaded 이벤트: UI 초기화와 이벤트 등록 ---
window.addEventListener('DOMContentLoaded', () => {
  console.log('페이지 다 로드됨! 이벤트 등록 시작!');

  // 지역 드롭다운 클릭 시 리스트 열기/닫기
  const dropdownSelected = document.querySelector('#region-dropdown .dropdown-selected');
  if (dropdownSelected) {
    dropdownSelected.addEventListener('click', () => {
      const dropdownList = document.querySelector('#region-dropdown .dropdown-list');
      if (dropdownList) dropdownList.classList.toggle('open');
    });
  } else {
    console.error('드롭다운 선택자 못 찾음!');
  }

  // 바깥 클릭 시 드롭다운 닫기
  document.addEventListener('mousedown', (e) => {
    const dd = document.getElementById('region-dropdown');
    if (dd && !dd.contains(e.target)) {
      const dropdownList = dd.querySelector('.dropdown-list');
      if (dropdownList) dropdownList.classList.remove('open');
    }
  });

  // 댓글 초기화 및 렌더링
  initComments();

  // 예측 실행 버튼 이벤트 등록
  const runPredictBtn = document.getElementById('run-predict');
  if (runPredictBtn) {
    runPredictBtn.addEventListener('click', () => {
      // 드롭다운에서 선택된 지역 텍스트
      const region = document.querySelector('#region-dropdown .dropdown-selected span').textContent.trim();
      // 날짜 선택 input 값
      const predictDate = document.getElementById('predict-date').value;

      // 지역 선택 유효성 검사
      if (!region || region === "시군 지역을 선택하세요") {
        alert("시군 지역을 선택하세요!");
        return;
      }
      // 날짜 선택 유효성 검사
      if (!predictDate) {
        alert("산불예측일자를 선택하세요!");
        return;
      }

      // 카카오맵 API 준비 여부 확인 후 예측 경로 그리기 호출
      if (kakaoMapReady && typeof window.drawWildfireRoute === 'function') {
        window.drawWildfireRoute(region, predictDate);
      } else {
        alert('카카오맵 API가 아직 준비되지 않았습니다. 1');
      }
    });
  } else {
    console.error('예측 실행 버튼 못 찾음!');
  }

  // 초기 안내 문구 표시 (지도 영역 빈 상태)
  resetMapToGuide();
});

// --- 카카오맵 API 비동기 로드 ---
// API가 정상 로드되면 초기 지도 생성 (춘천시 기본)
// 그리고 kakaoMapReady 플래그 true로 세팅
kakao.maps.load(() => {
  console.log('카카오맵 API 정상 로드');
  kakaoMapReady = true;

  // 최초 지도 띄우기 (기본지역: 춘천시)
  showKakaoMap("춘천시");
});

// --- 전역 함수: 지역 선택 시 호출되는 함수 ---
// UI 드롭다운 클릭 시 선택 지역 표시 및 지도 이동/마커 표시
window.selectRegion = function(el) {
  const selectedSpan = document.querySelector('#region-dropdown .dropdown-selected span');
  if (selectedSpan) selectedSpan.textContent = el.textContent;

  const dropdownList = document.querySelector('#region-dropdown .dropdown-list');
  if (dropdownList) dropdownList.classList.remove('open');

  // 카카오맵 API 준비되었으면 해당 지역으로 지도 업데이트
  if (kakaoMapReady && typeof window.showKakaoMap === 'function') {
    window.showKakaoMap(el.textContent.trim());
  } else {
    alert('카카오맵 API가 아직 준비되지 않았습니다. 2');
  }
};

// --- 카카오맵 지도 생성 및 마커 표시 함수 ---
window.showKakaoMap = function(region) {
  if (!kakaoMapReady) {
    alert('카카오맵 API가 아직 로드되지 않았습니다. 3');
    return;
  }

  const coord = regionCenters[region];
  if (!coord) return;

  // 지도 객체가 없으면 새로 생성
  if (!map) {
    const mapDiv = document.getElementById('map-area');
    map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(coord[0], coord[1]),
      level: 7,
      mapTypeId: kakao.maps.MapTypeId.ROADMAP
    });
  } else {
    // 기존 지도 중심 위치 변경
    map.setCenter(new kakao.maps.LatLng(coord[0], coord[1]));
  }

  // 기존 마커 제거
  if (mapMarker) {
    mapMarker.setMap(null);
    mapMarker = null;
  }

  //마커 칼라 지도 생성 
  const fireMarkerImage = new kakao.maps.MarkerImage(
  'https://cdn-icons-png.flaticon.com/512/482/482545.png', // 불모양 아이콘 URL
  new kakao.maps.Size(32, 32) // 크기 조절
);

  new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(start.lat, start.lng),
    image: fireMarkerImage
});



  // 새로운 마커 생성 및 지도에 표시
  // mapMarker = new kakao.maps.Marker({
  //   position: new kakao.maps.LatLng(coord[0], coord[1]),
  //   map: map,
  //   title: region
  // });

  // 5분 후 초기 안내 문구로 리셋하는 타이머 설정
  resetMapTimer();
};

// --- 예측 실행 후 산불 확산 경로 지도에 그리기 ---
// 지역, 날짜를 받아 wildfireData에서 경로정보 가져와 지도에 경로, 마커, 정보창 표시
window.drawWildfireRoute = function(region, date) {
  if (!kakaoMapReady) {
    alert('카카오맵 API가 아직 로드되지 않았습니다. 4');
    return;
  }

  // 날짜 인자는 문자열이어야 하며 배열 등은 불가
  if (typeof date !== 'string') {
    alert('날짜 형식이 올바르지 않습니다.');
    resetMapToGuide();
    return;
  }

  const data = wildfireData[region]?.[date];
  if (!data || !data.확산경로) {
    resetMapToGuide();
    return;
  }

  // 지도 표시용 div가 없으면 생성
  const mapDiv = ensureRealMapDiv();

  // 지도 생성 (지도 중심을 확산 경로 첫 지점으로 설정)
  map = new kakao.maps.Map(mapDiv, {
    center: new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng),
    level: 7,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP
  });

  // 확산 경로를 잇는 폴리라인 그리기
  const linePath = data.확산경로.map(p => new kakao.maps.LatLng(p.lat, p.lng));
  const polyline = new kakao.maps.Polyline({
    map: map,
    path: linePath,
    strokeWeight: 5,
    strokeColor: '#ff6347', // 토마토색
    strokeOpacity: 0.7
  });

  // 시작 지점 마커 (빨간색 불꽃 아이콘)
  const start = data.확산경로[0];
  new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(start.lat, start.lng),
    image: new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 36)
    )
  });

  // 종료 지점 마커 (파란색 불꽃 아이콘)
  const end = data.확산경로[data.확산경로.length - 1];
  new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(end.lat, end.lng),
    image: new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStarBlue.png',
      new kakao.maps.Size(24, 36)
    )
  });

  // 구간별 풍향(화살표) 표시 및 정보창(InfoWindow) 생성
  data.확산경로.forEach((p, idx) => {
    if (idx === 0) return; // 첫 지점은 스킵

    // 구간 선 그리기
    new kakao.maps.Polyline({
      map: map,
      path: [
        new kakao.maps.LatLng(data.확산경로[idx - 1].lat, data.확산경로[idx - 1].lng),
        new kakao.maps.LatLng(p.lat, p.lng)
      ],
      strokeWeight: 3,
      strokeColor: '#21897e',
      strokeOpacity: 0.9
    });

    // 정보창 생성 및 오픈 >>>>>칼라 꾸밀수 있다~속도거리창~~~~~
    new kakao.maps.InfoWindow({
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content: `
      <div style="
        padding: 8px 8px; 
        border-radius: 0px; 
        background: white; 
        color: rgba(255, 99, 71, 0.9); 
        font-weight: bold; 
        box-shadow: white;
        font-size: 12px;
        max-width: 150px;
        ">
        시간:${p.time}<br>
        거리:${p.거리}m<br>
        속도:${p.속도}m/h
      </div>`
    }).open(map);
  });

  // 5분 후 안내문구 자동 복귀 타이머 설정
  if (mapTimer) clearTimeout(mapTimer);
  mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
};

// --- 지도 초기 안내문구 함수 ---
// #map-area 영역에 예측 실행 전 기본 메시지 출력
function resetMapToGuide() {
  const mapArea = document.getElementById('map-area');
  if (mapArea) {
    mapArea.innerHTML = `
      <div class="placeholder-graphic">
        <i class="fas fa-map-marked-alt"></i>
        <div class="ph-text">
          예측실행 결과를 여기에서 <b>KakaoMap</b>으로<br>확인하실 수 있습니다.
        </div>
      </div>
    `;
  }
  map = null;
}

// --- 지도 div가 없으면 생성하고 반환하는 함수 ---
// 지도 렌더링 시 #real-map div 생성 및 높이 고정해서 반환
function ensureRealMapDiv() {
  const mapArea = document.getElementById('map-area');
  if (!mapArea) return null;

  let mapDiv = document.getElementById('real-map');
  if (!mapDiv) {
    // 높이 38vh 이상, 최소 300px 확보 (CSS 강제)
    mapArea.innerHTML = `<div id="real-map" style="width:100%; height:38vh; min-height:300px;"></div>`;
    mapDiv = document.getElementById('real-map');
  }
  return mapDiv;
}

// --- 5분 후 지도 초기화 타이머 리셋 함수 ---
function resetMapTimer() {
  if (mapTimer) clearTimeout(mapTimer);
  mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
}

// --- 댓글 관련 함수 ---
// 댓글 초기화 및 렌더링
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
  let replyOpen = null; // { ids: [부모id,...,나의id] }

  // 저장
  function saveComments() {
    localStorage.setItem('seed_comments_json', JSON.stringify(comments));
  }

  // 무한 렌더링 (재귀)
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

  // 최상위 댓글 렌더링 함수
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
    // 답글 폼 다시 열기
    if (replyOpen) openReplyInput(replyOpen.ids);
  }

  // 답글 폼 열기 (ids: 부모id 배열)
  window.showReplyForm = function(ids) {
    document.querySelectorAll('.reply-form').forEach(f => f.innerHTML = '');
    replyOpen = { ids };
    openReplyInput(ids);
  }

  // 답글 입력폼 실제 표시
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
    // ESC로 닫기
    const input = targetDiv.querySelector('.reply-input');
    input.focus();
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        targetDiv.innerHTML = '';
        replyOpen = null;
      }
    });
  }

  // 답글 저장 (ids: "1-11-99" 처럼 경로)
  window.submitReply = function(idsStr) {
    const ids = idsStr.split('-').map(Number);
    const formId = `reply-form-${ids.join('-')}`;
    const targetDiv = document.getElementById(formId);
    const input = targetDiv.querySelector('.reply-input');
    const txt = input.value.trim();
    if (!txt) return;

    // 부모 찾아서 push (무한단계)
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

  // 댓글 등록
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

  // 답글 입력창 바깥 클릭시 닫기
  document.addEventListener('mousedown', function (e) {
    if (!e.target.closest('.reply-form') && !e.target.classList.contains('reply-btn')) {
      document.querySelectorAll('.reply-form').forEach(f => f.innerHTML = '');
      replyOpen = null;
    }
  });
  // 초기 댓글 렌더링
  renderComments();
}

