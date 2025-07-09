//2025.07.08 오후 5:30맵만 뜨면됨
//../assets/js/spread-dashboard.js
//자바스크립스안에서 const (변경 없는 변수), let (변경 가능한 변수)
// 1. DOMContentLoaded 이벤트에서 모든 UI 이벤트 연결 및 댓글 초기화
// 2. 지역 드롭다운 이벤트 함수 (전역에 노출)
// 3. 카카오맵 API 비동기 로딩 및 플래그 세팅
// 3. 예측 실행 버튼 이벤트 (유효성 검사 후 경로 그리기)
// 4. 지도 초기 안내문구 함수
// 5. 지도 그리기 함수 (showKakaoMap, drawWildfireRoute)
// 6. 댓글 렌더링 및 이벤트 처리 함수
// 7. 5분 리셋 타이머 및 helper 함수들
  //콜백·이벤트에서 사용되는 함수명(drawWildfireRoute, showKakaoMap, 등등)
//실제 데이터를 담는 객체명(wildfireData, regionCenters, 등등)

//1. DOMContentLoaded 이벤트 내에서 클릭 이벤트 등록이벤트 초기화 (드롭다운 토글, 버튼 클릭, 댓글 등)
window.addEventListener('DOMContentLoaded', () => {
 console.log('페이지 다 로드됨! 이벤트 등록 시작!');

//==지역 드롭다운 이벤트 등록==
  const dropdownSelected = document.querySelector('#region-dropdown .dropdown-selected');
  if (dropdownSelected) {
    dropdownSelected.addEventListener('click', () => {
      const dropdownList = document.querySelector('#region-dropdown .dropdown-list');
      if (dropdownList) dropdownList.classList.toggle('open');
    });
  } else {
    console.error('드롭다운 선택자 못 찾음!');
}

//바깥 클릭시 드롭다운 닫기
document.addEventListener('mousedown', (e) => {
  const dd = document.getElementById('region-dropdown');
  if(dd && !dd.contains(e.target)) {
    const dropdownList = dd.querySelector('.dropdown-list');
      if (dropdownList) dropdownList.classList.remove('open');
    }
  });

//시군 지역 선택 예측실행클릭(이벤트연동)시 지도+경로 렌더링
//"예측 실행" 버튼에 연결 (테스트/실제 모두 사용)(window 필요 없음)
const runPredictBtn = document.getElementById('run-predict');
  if (runPredictBtn) {
     runPredictBtn.addEventListener('click', () => {
  const region = document.querySelector('#region-dropdown .dropdown-selected span').textContent.trim();
  const predictDate = document.getElementById('predict-date').value;
  if (!region || region === "시군 지역을 선택하세요") {
    alert("시군 지역을 선택하세요!");
    return;
  }
  if (!predictDate) {
    alert("산불예측일자를 선택하세요!");
    return;
  }
  //예측 로직, 지도, 차트 등 연동!
 // 예측일자,지역 경로 그리기(window로 접근)
  if (kakaoMapReady && typeof window.drawWildfireRoute === 'function') {
      window.drawWildfireRoute(region, predictDate);
    } else {
      alert('카카오맵 API가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
  });
} else {
    console.error('예측 실행 버튼 못 찾음!');
  }
 // 댓글 초기화 및 렌더링 시작 (함수들 아래 정의 예정)
  initComments();
});



//  2.전역 함수 selectRegion - UI 드롭다운에서 바로 호출되므로 전역에 반드시 존재해야 함
//(※ window. 붙이면 전역에 적용// HTML inline 이벤트에서 작동 보장!)
// 드롭다운 등 이벤트 핸들러는 window에 부착
// 드롭다운 아이템 선택 시
 window.selectRegion = function(el) {
  const selectedSpan = document.querySelector('#region-dropdown .dropdown-selected span');
  if (selectedSpan) selectedSpan.textContent = el.textContent;
  
  const dropdownList = document.querySelector('#region-dropdown .dropdown-list');
  if (dropdownList) dropdownList.classList.remove('open');

  // 지도 업데이트
  if (kakaoMapReady && typeof window.showKakaoMap === 'function') {
    window.showKakaoMap(el.textContent.trim());
  } else {
    alert('카카오맵 API가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
  }
};


// 3.전역 변수 선언: 카카오맵 로딩 상태, 지도 객체, 마커, 타이머
let kakaoMapReady = false;
let map = null;
let mapMarker = null;
let mapTimer = null;

//  카카오맵 API 비동기 로드 후 콜백 등록 (최초 1회)
kakao.maps.load(() => {
  console.log('카카오맵 API가 정상적으로 로드되었습니다.');
  kakaoMapReady = true;
   // 지도 초기 안내문구 세팅 함수
  resetMapToGuide();

//  카카오맵 함수, 전역에서 정의
// showKakaoMap 함수 수정: kakao.maps.load() 호출 제거 후, kakaoMapReady 체크 후 바로 지도 생성
window.showKakaoMap = function(region) {
  if (!kakaoMapReady) {
    alert('카카오맵 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  const coord = regionCenters[region];
  if (!coord) return;

  
  //마커, polyline 추가 가능
 // 기존 마커 제거
  if (mapMarker) { mapMarker.setMap(null); mapMarker = null; }
 // 초기 마커>>>>>>>>>>>>>>>>>coord[0] (위도), coord[1] (경도)>>>>>>>>>>>>>>>>>>>
    mapMarker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(coord[0], coord[1]),
    map: map,
    title: region
  });
  resetMapTimer(); // 5분 후 리셋 타이머
};

// drawWildfireRoute 함수 정의 (실제로 카카오맵 그리기)
//산불확산을 지도에 경로, 마커, 툴팁 그리기
window.drawWildfireRoute = function(region, date) {
    if (!kakaoMapReady) {
      alert('카카오맵 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    // date는 단일 문자열이어야 하므로 배열이나 객체 체크 금지
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

//div가 없으면 위에서 real-map만들어주고,있으면 그냥 쓰게됨
  const mapDiv = ensureRealMapDiv(); 
//지도생성>>>>>>>>>>>>>>>>>>>>>>>>>>>>>(위도, 경도)>>>>>>>>>>>>>>>>
  map = new kakao.maps.Map(mapDiv, {
     center: new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng),
     level: 7,
      mapTypeId: kakao.maps.MapTypeId.TERRAIN
  });

 // 산불 확산 경로를 잇는 선 그리기 (Polyline)
  const linePath = data.확산경로.map(p => new kakao.maps.LatLng(p.lat, p.lng));
  const polyline = new kakao.maps.Polyline({
    map, path: linePath, strokeWeight: 5,
    strokeColor: '#ff6347', strokeOpacity: 0.7
  });
  // 시작 지점 마커 (빨간 불)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    const start = data.확산경로[0];
    new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(start.lat, start.lng),
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        new kakao.maps.Size(24, 36)
      )
    });
    // 종료 지점 마커 (파란 불)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    const end = data.확산경로[data.확산경로.length - 1];
    new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(end.lat, end.lng),
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStarBlue.png',
        new kakao.maps.Size(24, 36)
      )
    });

  // 각 구간별 풍향(화살표) 표시와 정보창 (InfoWindow)>>>>>>>>>>>>>>>>>
  data.확산경로.forEach((p, idx) => {
    if(idx === 0) return;   // 첫 지점은 스킵
  // 구간 선 그리기
    new kakao.maps.Polyline({
      map: map,
      path: [
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        new kakao.maps.LatLng(data.확산경로[idx-1].lat, data.확산경로[idx-1].lng),
        new kakao.maps.LatLng(p.lat, p.lng)
      ],
      strokeWeight: 3, strokeColor: '#21897e', strokeOpacity: 0.9
    });
    // 정보창 생성 및 오픈   
    new kakao.maps.InfoWindow({
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content: `<div style="font-size:11px;color:#21897e;">
        ${p.time}<br>거리:${p.거리}m<br>속도:${p.속도}m/h
      </div>`
    }).open(map);
  });
//   resetMapTimer
//  5분 후 안내문구 자동 복귀
  if (mapTimer) clearTimeout(mapTimer);
  mapTimer = setTimeout(resetMapToGuide, 5*60*1000);
 };


 // 지도 초기 안내문구 함수 (map-area 영역에 메시지 표시)(항상전역에~~위치)
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

// 지도 div가 없으면 생성하고 반환하는 함수
function ensureRealMapDiv() {
  const mapArea = document.getElementById('map-area');
  if (!mapArea) return null;

  let mapDiv = document.getElementById('real-map');
  if (!mapDiv) {
    mapArea.innerHTML = `<div id="real-map" style="width:100%;height:40vh"></div>`;
    mapDiv = document.getElementById('real-map');
  }
  return mapDiv;
}

//  5분 후 지도 초기화 타이머 리셋 함수
function resetMapTimer() {
  if (mapTimer) clearTimeout(mapTimer);
  mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
}


//  초기 안내문구 표시
  resetMapToGuide();
});



  //실제데이터만 wildfireData에 넣으면 끝
  // ----------- [여기부터 드롭다운/맵 유지] ---------------------
//  지역 위도경도 데이터
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

//지금은 테스트용 예측 경로 가상 데이터 (춘천시  예시)
//과거/예측 일자별 산불 확산 데이터
const wildfireData = {
   "춘천시": {
  //   "2025-07-05": {
  //     "확산경로": [
      //   { time: "14:00", lat: 37.8813, lng: 127.7298, 거리: 0, 속도: 0, 풍향: 110 },
      //   { time: "14:20", lat: 37.8830, lng: 127.7325, 거리: 250, 속도: 45, 풍향: 125 },
      //   { time: "14:40", lat: 37.8852, lng: 127.7350, 거리: 510, 속도: 50, 풍향: 130 }
      // ],
      // "속도등급": 2, "누적산불수": 1
    // },
    "2025-07-06": {
      "확산경로": [
        { time: "14:00", lat: 37.8813, lng: 127.7298, 거리: 0, 속도: 0, 풍향: 90 },
        { time: "14:20", lat: 37.8842, lng: 127.7335, 거리: 270, 속도: 47, 풍향: 110 },
        { time: "14:40", lat: 37.8872, lng: 127.7370, 거리: 580, 속도: 54, 풍향: 130 }
      ],
      "속도등급": 3, "누적산불수": 2
    }
}
  };
  // 춘천시내용삭제하고 실제 데이터도 이 구조에 맞춰 넣으면 됨!



//========================================================
//=============================================================
  // ========== 댓글 데이터 ================
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
//초기 댓글 렌더링
  renderComments();
}

