// ../assets/js/spread-dashboard.js
window.addEventListener('DOMContentLoaded', () => {
  console.log('페이지 다 로드됨! 이벤트 등록 시작!');

  // 지역 위도경도 데이터
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

  // 테스트용 산불확산 데이터
  const wildfireData = {
    "춘천시": {
      "2025-07-05": {
        "확산경로": [
          { time: "14:00", lat: 37.8813, lng: 127.7298, 거리: 0, 속도: 0, 풍향: 110 },
          { time: "14:20", lat: 37.8830, lng: 127.7325, 거리: 250, 속도: 45, 풍향: 125 },
          { time: "14:40", lat: 37.8852, lng: 127.7350, 거리: 510, 속도: 50, 풍향: 130 }
        ],
        "속도등급": 2, "누적산불수": 1
      },
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

  // 카카오맵 관련 전역변수
  let kakaoMapReady = false;
  let map = null;
  let mapMarker = null;
  let mapTimer = null;

  // 드롭다운 엘리먼트
  const dropdownSelected = document.querySelector('#region-dropdown .dropdown-selected');
  const dropdownList = document.querySelector('#region-dropdown .dropdown-list');

  // 댓글 관련 엘리먼트
  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form');

  // 댓글 데이터 초기화
  let comments = [];
  try {
    comments = JSON.parse(localStorage.getItem('seed_comments_json')) || [
      { id: 1, text: "좋은 예측입니다!", replies: [{ id: 11, text: "동의합니다.", replies: [] }] },
      { id: 2, text: "지도 확대기능까지있고~와우", replies: [] }
    ];
  } catch {
    comments = [
      { id: 1, text: "좋은 예측입니다!", replies: [{ id: 11, text: "동의합니다.", replies: [] }] },
      { id: 2, text: "지도 확대기능까지있고~와우", replies: [] }
    ];
  }
  let replyOpen = null;

  //==================== 드롭다운 이벤트 ====================
  function setupDropdown() {
    if (!dropdownSelected || !dropdownList) {
      console.error('드롭다운 요소를 찾을 수 없습니다.');
      return;
    }

    dropdownSelected.addEventListener('click', () => {
      dropdownList.classList.toggle('open');
    });

    // 리스트 아이템 클릭 이벤트 연결
    dropdownList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        dropdownSelected.querySelector('span').textContent = li.textContent;
        dropdownList.classList.remove('open');
        window.showKakaoMap(li.textContent.trim());
      });
    });

    // 바깥 클릭 시 닫기
    document.addEventListener('mousedown', e => {
      if (!document.getElementById('region-dropdown').contains(e.target)) {
        dropdownList.classList.remove('open');
      }
    });
  }

  //==================== 댓글 렌더링 ====================
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
  }

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
    input.addEventListener('keydown', e => {
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

  // 댓글 등록 이벤트
  if (commentForm) {
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
  }

  // 답글 입력창 외부 클릭 시 닫기
  document.addEventListener('mousedown', e => {
    if (!e.target.closest('.reply-form') && !e.target.classList.contains('reply-btn')) {
      document.querySelectorAll('.reply-form').forEach(f => f.innerHTML = '');
      replyOpen = null;
    }
  });

  renderComments();

  //==================== "예측 실행" 버튼 이벤트 ====================
  const runPredictBtn = document.getElementById('run-predict');
  if (runPredictBtn) {
    runPredictBtn.addEventListener('click', () => {
      const region = dropdownSelected.querySelector('span').textContent.trim();
      console.log('run-predict 클릭! 선택된 지역:', region);
      const prevDate = document.getElementById('prev-date').value;
      const predictDate = document.getElementById('predict-date').value;
      if (!region || region === "시군 지역을 선택하세요") {
        alert("시군 지역을 선택하세요!");
        return;
      }
      if (!prevDate || !predictDate) {
        alert("산불일자(과거/예측)를 모두 선택하세요!");
        return;
      }
      window.drawWildfireRoute(region, predictDate);
    });
  } else {
    console.error('예측 실행 버튼 못 찾음!');
  }

  //==================== 카카오맵 API 비동기 로드 및 초기화 ====================
  kakao.maps.load(() => {
    kakaoMapReady = true;
    resetMapToGuide();
  });

  //==================== 카카오맵 관련 함수 ====================
  window.showKakaoMap = function(region) {
    if (!kakaoMapReady) {
      alert('카카오맵 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const coord = regionCenters[region];
    if (!coord) return;

    const mapArea = document.getElementById('map-area');
    mapArea.innerHTML = `<div id="real-map" style="width:100%; height: 100%;"></div>`;

    map = new kakao.maps.Map(document.getElementById('real-map'), {
      center: new kakao.maps.LatLng(coord[0], coord[1]),
      level: 8,
      mapTypeId: kakao.maps.MapTypeId.TERRAIN
    });

    if (mapMarker) {
      mapMarker.setMap(null);
      mapMarker = null;
    }
    mapMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(coord[0], coord[1]),
      map: map,
      title: region
    });
    resetMapTimer();
  };

  window.drawWildfireRoute = function(region, date) {
    if (!kakaoMapReady) {
      alert('카카오맵 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const data = wildfireData[region]?.[date];
    if (!data || !data.확산경로) {
      resetMapToGuide();
      return;
    }

    const mapDiv = ensureRealMapDiv();
    map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng),
      level: 7,
      mapTypeId: kakao.maps.MapTypeId.TERRAIN
    });

    const linePath = data.확산경로.map(p => new kakao.maps.LatLng(p.lat, p.lng));
    const polyline = new kakao.maps.Polyline({
      map,
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#ff6347',
      strokeOpacity: 0.7
    });

    // 시작 지점 마커
    const start = data.확산경로[0];
    new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(start.lat, start.lng),
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        new kakao.maps.Size(24, 36)
      )
    });

    // 종료 지점 마커
    const end = data.확산경로[data.확산경로.length - 1];
    new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(end.lat, end.lng),
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStarBlue.png',
        new kakao.maps.Size(24, 36)
      )
    });

    // 각 구간별 화살표, 정보창
    data.확산경로.forEach((p, idx) => {
      if (idx === 0) return;
      new kakao.maps.Polyline({
        map,
        path: [
          new kakao.maps.LatLng(data.확산경로[idx - 1].lat, data.확산경로[idx - 1].lng),
          new kakao.maps.LatLng(p.lat, p.lng)
        ],
        strokeWeight: 3,
        strokeColor: '#21897e',
        strokeOpacity: 0.9
      });

      new kakao.maps.InfoWindow({
        position: new kakao.maps.LatLng(p.lat, p.lng),
        content: `<div style="font-size:11px;color:#21897e;">
          ${p.time}<br>거리:${p.거리}m<br>속도:${p.속도}m/h
        </div>`
      }).open(map);
    });

    if (mapTimer) clearTimeout(mapTimer);
    mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
  };

  //==================== 도우미 함수 ====================
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

  function ensureRealMapDiv() {
    const mapArea = document.getElementById('map-area');
    if (!mapArea) return null;
    let mapDiv = document.getElementById('real-map');
    if (!mapDiv) {
      mapArea.innerHTML = `<div id="real-map" style="width:100%;height:340px"></div>`;
      mapDiv = document.getElementById('real-map');
    }
    return mapDiv;
  }

  function resetMapTimer() {
    if (mapTimer) clearTimeout(mapTimer);
    mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
  }

  // 드롭다운 초기화
  setupDropdown();

});
