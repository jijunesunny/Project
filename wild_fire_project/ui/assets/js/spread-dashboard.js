//../assets/js/spread-dashboard.js
//(※ window. 붙이면 전역에 적용// HTML inline 이벤트에서 작동 보장!)
window.addEventListener('DOMContentLoaded', () => {
  // ========== 댓글 데이터 ================
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

  // 최상위 렌더링
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

  renderComments();


  //===================================================================
  //===================================================================
  //===================================================================
  //콜백·이벤트에서 사용되는 함수명(drawWildfireRoute, showKakaoMap, 등등)
//실제 데이터를 담는 객체명(wildfireData, regionCenters, 등등)
  //실제데이터만 wildfireData에 넣으면 끝
  // ----------- [여기부터 드롭다운/맵 유지] ---------------------
// ① 지역 위도경도 데이터
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
// 춘천시내용삭제하고 실제 데이터도 이 구조에 맞춰 넣으면 됨!
  }
};

 // ② 지도 안내문구 초기화
function resetMapToGuide() {
  document.getElementById('map-area').innerHTML = `
    <div class="placeholder-graphic">
      <i class="fas fa-map-marked-alt"></i>
      <div class="ph-text">
        예측실행 결과를 여기에서 <b>KakaoMap</b>으로<br>확인하실 수 있습니다.
      </div>
    </div>  
  `;
   map = null;
}
let map = null, mapTimer = null, mapMarker = null;
  //최초 첫 진입시 안내문구!(한번만)
window.addEventListener('DOMContentLoaded', resetMapToGuide);
//   document.getElementById('map-area').innerHTML = `
//   <div id="real-map"></div>`;
//   setTimeout(function(){
//     drawWildfireRoute(region, predictDate);
//   }, 30);
// };

  //====real-map div가 없으면 생성(무조건 map-area 안에 들어가도록!)====
function ensureRealMapDiv() {
  const mapArea = document.getElementById('map-area');
  let mapDiv = document.getElementById('real-map');
  if (!mapDiv) {
    mapArea.innerHTML = `<div id="real-map" style="width:100%;height:340px"></div>`;
    mapDiv = document.getElementById('real-map');
  }
  return mapDiv;
}

//③ 카카오맵 함수, 전역에서 정의
window.showKakaoMap = function (region) {
  const coord = regionCenters[region];
  if (!coord) return;
  const mapArea = document.getElementById('map-area');
    mapArea.innerHTML = `<div id="real-map" style="width:100%;height:100%"></div>`;
    map = new kakao.maps.Map(document.getElementById('real-map'), {
      center: new kakao.maps.LatLng(coord[0], coord[1]),
      level: 8,
      mapTypeId: kakao.maps.MapTypeId.TERRAIN
    });
  //마커, polyline 추가 가능
 // 기존 마커 제거
  if (mapMarker) { mapMarker.setMap(null); mapMarker = null; }
 // 초기 마커
    mapMarker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(coord[0], coord[1]),
    map: map,
    title: region
  });
  resetMapTimer(); // 5분 후 리셋 타이머
}

//실제로 카카오맵 그리기
//산불확산을 지도에 경로, 마커, 툴팁 그리기
window.drawWildfireRoute = function (region, date) {
  const data = wildfireData[region]?.[date];
  if (!data || !data.확산경로) {
    resetMapToGuide();
    return;
  }
//div가 없으면 위에서 real-map만들어주고,있으면 그냥 쓰게됨
  const mapDiv = ensureRealMapDiv(); 
    map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng),
      level: 7,
      mapTypeId: kakao.maps.MapTypeId.TERRAIN
  });
  //polyline/marker/tooltip 등 추가
//  drawWildfireRoute(region, predictDate);
  //선(확산 경로) 그리기
  const linePath = data.확산경로.map(p => new kakao.maps.LatLng(p.lat, p.lng));
  const polyline = new kakao.maps.Polyline({
    map, path: linePath, strokeWeight: 5,
    strokeColor: '#ff6347', strokeOpacity: 0.7
  });
  //시작/종료 지점 마커(data.확산경로 배열의 첫/마지막 값을 Lat/Lng 값으로 직접 생성)
  const start = data.확산경로[0];
  const end = data.확산경로[data.확산경로.length - 1];
  new kakao.maps.Marker({
    map, position: new kakao.maps.LatLng(start.lat, start.lng),
    image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new kakao.maps.Size(24, 36))
  });
  new kakao.maps.Marker({
    map, position: new kakao.maps.LatLng(end.lat, end.lng),
    image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStarBlue.png', new kakao.maps.Size(24, 36))
  });
  //각 지점 풍향(애로우) 그리기 (각 경로마다), 인포윈도우 화살표/튤팁
  data.확산경로.forEach((p, idx) => {
    if(idx === 0) return;
    new kakao.maps.Polyline({
      map,
      path: [
        new kakao.maps.LatLng(data.확산경로[idx-1].lat, data.확산경로[idx-1].lng),
        new kakao.maps.LatLng(p.lat, p.lng)
      ],
      strokeWeight: 3, strokeColor: '#21897e', strokeOpacity: 0.9
    });
    new kakao.maps.InfoWindow({
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content: `<div style="font-size:11px;color:#21897e;">
        ${p.time}<br>거리:${p.거리}m<br>속도:${p.속도}m/h
      </div>`
    }).open(map);
  });
//   resetMapTimer();
// }
// ④ 5분 후 안내문구 자동 복귀
// function resetMapTimer() {
  if (mapTimer) clearTimeout(mapTimer);
  mapTimer = setTimeout(resetMapToGuide, 5*60*1000);
}
// 최초엔 안내문구
// resetMapToGuide();

//드롭다운 등 이벤트 핸들러는 window에 부착!
// ⑤ 드롭다운에서 시군 클릭 시 showKakaoMap(region) 호출!
window.toggleDropdown = function() {
  document.querySelector('#region-dropdown .dropdown-list').classList.toggle('open');
};
//dropdown-selected span').textContent = el.textContent;이게있어야 텍스트span만바뀌고 역삼각형아이콘이 사라지고있음
window.selectRegion = function(el) {
  document.querySelector('#region-dropdown .dropdown-selected span').textContent = el.textContent;
  document.querySelector('#region-dropdown .dropdown-list').classList.remove('open');
  //지도연동 원하면 추가
  window.showKakaoMap(el.textContent.trim()); 
};
//바깥 클릭시 닫기
document.addEventListener('mousedown', function(e){
  const dd = document.getElementById('region-dropdown');
  if(dd && !dd.contains(e.target))
    dd.querySelector('.dropdown-list').classList.remove('open');
});


//시군 지역 선택 예측실행클릭(이벤트연동)시 지도+경로 렌더링
//"예측 실행" 버튼에 연결 (테스트/실제 모두 사용)
//(window 필요 없음)
document.getElementById('run-predict').onclick = function() {
  const region = document.querySelector('#region-dropdown .dropdown-selected span').textContent.trim();
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
  //예측 로직, 지도, 차트 등 연동!
 // 예측일자(혹은 둘 다!)로 경로 그리기
 // window로 접근!!
  window.drawWildfireRoute(region, predictDate);
};












// 예시 경고
  // alert(`실행!\n지역: ${region}\n과거: ${prevDate}\n예측: ${predictDate}`);





//================================

// → 우측 차트(Chart.js 연동)
//예측실행 버튼 누르면 drawWildfireRoute(region, date) + drawSpeedChart(region, date) 모두 실행
// function drawSpeedChart(region, date) {
//   const data = wildfireData[region]?.[date]?.확산경로 || [];
//   const ctx = document.getElementById('speedChart').getContext('2d');
//   new Chart(ctx, {
//     type: 'line',
//     data: {
//       labels: data.map(p=>p.time),
//       datasets: [{
//         label: '확산속도(m/h)',
//         data: data.map(p=>p.속도),
//         borderColor: '#21897e', fill: false
//       }]
//     }
//   });
// }




});