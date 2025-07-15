// 지도 생성, 마커, 경로 그리기, 초기화 전담
//../assets/js/map-handler.js
//강원도경계그리기(카카오맵기본지도,마커위주)
//행정구역경계(시군,읍면동경계데이터(GeoJSON)준비후처리
//Leaflet.js를 활용해 경계선 그리고 클릭 이벤트 처리
//클릭시 선택행정구역중심좌표드롭다운자동업데이트가능
// map-handler.js
// 카카오맵 기반 지도 생성, 마커 표시, 경로 그리기 담당
import { getRegionCenters, getWildfireData } from './data-handler.js';

let map = null;
let mapMarkers = [];
let mapPolyline = null;
let mapTimer = null;
let kakaoMapReady = false;

function initKakaoMapAPI(callback) {
  if (kakaoMapReady) {
    if (callback) callback();
    return;
  }
  kakao.maps.load(() => {
    kakaoMapReady = true;
    if (callback) callback();
  });
}

// 지도 생성 혹은 중심 이동
function showMap(region) {
  if (!kakaoMapReady) {
    alert('카카오맵 API가 아직 준비되지 않았습니다.');
    return;
  }
  const centers = getRegionCenters();
  const coord = centers[region];
  if (!coord) return;

  const mapDiv = document.getElementById('map-area');
  if (!map) {
    map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(coord[0], coord[1]),
      level: 7,
      mapTypeId: kakao.maps.MapTypeId.ROADMAP
    });
  } else {
    map.setCenter(new kakao.maps.LatLng(coord[0], coord[1]));
  }

  clearMarkers();
  addMarker(coord[0], coord[1], '현재 선택지역');

  resetMapTimer();
}

function addMarker(lat, lng, title) {
  if (!map) return;
  const marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(lat, lng),
    title: title
  });
  mapMarkers.push(marker);
  return marker;
}

function clearMarkers() {
  mapMarkers.forEach(marker => marker.setMap(null));
  mapMarkers = [];
  if (mapPolyline) {
    mapPolyline.setMap(null);
    mapPolyline = null;
  }
  if (mapTimer) {
    clearTimeout(mapTimer);
    mapTimer = null;
  }
}

// 산불 확산 경로 그리기
function drawWildfireRoute(region, date) {
  if (!kakaoMapReady) {
    alert('카카오맵 API가 아직 준비되지 않았습니다.');
    return;
  }
  const data = getWildfireData(region, date);
  if (!data || !data.확산경로 || data.확산경로.length === 0) {
    alert('해당 날짜 및 지역에 데이터가 없습니다.');
    resetMapToGuide();
    return;
  }

  const mapDiv = document.getElementById('map-area');
  if (!map) {
    map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng),
      level: 7,
      mapTypeId: kakao.maps.MapTypeId.ROADMAP
    });
  } else {
    map.setCenter(new kakao.maps.LatLng(data.확산경로[0].lat, data.확산경로[0].lng));
  }
//기존마커, 폴리라인 제거
  clearMarkers();
//확산 경로 커스텀 오버레이(불빛) 생성
  data.확산경로.forEach(point => {
   const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(point.lat, point.lng),
      content: '<div class="fire-overlay"></div>',
      map: map,
      yAnchor: 1
    });
    mapMarkers.push(overlay);  // 마커 배열에 저장해서 나중에 제거 가능하도록
  });
  // 확산 경로를 잇는 선 그리기 (기존 폴리라인 움직임)
  const linePath = path.map(p => new kakao.maps.LatLng(p.lat, p.lng));
  mapPolyline = new kakao.maps.Polyline({
    map: map,
    path: linePath,
    strokeWeight: 5,
    strokeColor: '#ff6347',
    strokeOpacity: 0.7
  });

  resetMapTimer();
}



  // const pathCoords = data.확산경로.map(p => new kakao.maps.LatLng(p.lat, p.lng));
  // mapPolyline = new kakao.maps.Polyline({
  //   path: pathCoords,
  //   strokeWeight: 5,
  //   strokeColor: '#ff6347',
  //   strokeOpacity: 0.7,
  //   map: map
  // });

//   data.확산경로.forEach((p, idx) => {
//     addMarker(p.lat, p.lng, `${p.time} - 거리:${p.거리}m 속도:${p.속도}m/h`);
//   });

//   resetMapTimer();
// }

// function resetMapToGuide() {
//   const mapArea = document.getElementById('map-area');
//   if (mapArea) {
//     mapArea.innerHTML = `
//       <div class="placeholder-graphic">
//         <i class="fas fa-map-marked-alt"></i>
//         <div class="ph-text">
//           예측실행 결과를 여기에서 <b>KakaoMap</b>으로<br>확인하실 수 있습니다.
//         </div>
//       </div>
//     `;
//   }
//   map = null;
//   clearMarkers();
// }

// function resetMapTimer() {
//   if (mapTimer) clearTimeout(mapTimer);
//   mapTimer = setTimeout(resetMapToGuide, 5 * 60 * 1000);
// }

// export { initKakaoMapAPI, showMap, drawWildfireRoute, resetMapToGuide };
