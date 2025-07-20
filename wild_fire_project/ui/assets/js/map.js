//팀 지도 생성, ui변경만 
//../assets/js/map.js 
//../data/raw/legal_codes/hangjeongdong_gangwon.geojson 에서 가져옴
//산불확산계산은 wildfire-calc.js에서 처리
//클릭시 위경도표시 (LatLng 출력)
//폴리곤은 strokeStyle: 'dash', fillOpacity: 0.0, hover 시 색상 바뀜
//turf.js로 강원내부만 클릭 허용

// 지도 생성
const mapContainer = document.getElementById('map');
const map = new kakao.maps.Map(mapContainer, {
  center: new kakao.maps.LatLng(35.4, 127.8), // 남한 중심좌표(위경도센터서울-대구중심)
  level: 12 //확대레벨(제주까지)
});

// 드래그/줌 가능 & cursor auto
map.setDraggable(true);
map.setZoomable(true);
mapContainer.style.cursor = 'grab';

// 부드러운 확대/축소 함수
function smoothZoomIn() {
  const lv = map.getLevel();
  if (lv > 1) {
    map.panTo(map.getCenter());
    setTimeout(() => map.setLevel(lv - 1), 200);
  }
}
function smoothZoomOut() {
  const lv = map.getLevel();
  if (lv < 14) {
    map.panTo(map.getCenter());
    setTimeout(() => map.setLevel(lv + 1), 200);
  }
}

// 중앙 경고·좌표 박스
const alertBox = document.getElementById('alertBox');
const coordBox = document.getElementById('coordBox');

// GeoJSON 데이터 보관
// turf.js 로딩 필수 (map.html <head>에 CDN 삽입)
let gangwonGeoJSON = null;


// ────────────────────────────────────────
// 👇 geojson 주석 처리 후 추가할 코드
// ────────────────────────────────────────
// 사진 기반 강원도 “사각형” 경계 좌표
const gangwonBoundsSW = new kakao.maps.LatLng(37.018205, 127.080231); // 남서
const gangwonBoundsNE = new kakao.maps.LatLng(38.642618, 129.371910); // 북동

// 1) 경계 박스 폴리곤 그리기
const boxCoords = [
  new kakao.maps.LatLng(37.018205, 127.080231), // SW
  new kakao.maps.LatLng(37.018205, 129.371910), // SE
  new kakao.maps.LatLng(38.642618, 129.371910), // NE
  new kakao.maps.LatLng(38.642618, 127.080231), // NW
  new kakao.maps.LatLng(37.018205, 127.080231)  // 닫기
];

const gangwonBox = new kakao.maps.Polygon({
  path: boxCoords,
  strokeWeight: 3,
  strokeColor: '#00aa00',
  strokeStyle: 'dash',
  strokeOpacity: 0.8,
  fillColor: 'rgba(0,255,0,0.05)',
  fillOpacity: 0.05
});
gangwonBox.setMap(map);

// 2) LatLngBounds 로 내부 판별용 객체 생성
const gangwonBounds = new kakao.maps.LatLngBounds(
  gangwonBoundsSW,
  gangwonBoundsNE
);

// ────────────────────────────────────────
// 클릭 이벤트: turf.js 없이 Bounds.contains 사용
 
// ────────────────────────────────────────

kakao.maps.event.addListener(map, 'click', async function(e) {
  console.log('지도 클릭!', e.latLng.getLat(), e.latLng.getLng());
  const lat = e.latLng.getLat();
  const lng = e.latLng.getLng();
  //사각경계 내부인지 LatLngBounds.contains 로 확인
  const inside = gangwonBounds.contain(latlng);
  // 클릭 시 커서 포인터
  mapContainer.style.cursor = 'pointer';

  // if (inside) {
  //   // coordBox.innerText = ` 위도: ${latlng.getLat().toFixed(5)}, 경도: ${latlng.getLng().toFixed(5)}`;
  //   // coordBox.style.display = 'block';
  //   // 산불 확산 계산 호출
  //   simulateFireEllipse(latlng.getLat(), latlng.getLng(), 2.5, 45, 3);
  // } else {
  //   alertBox.innerText = ' 강원도 외 지역은 클릭할 수 없습니다';
  //   alertBox.style.display = 'block';
  //   setTimeout(()=> alertBox.style.display = 'none', 2000);
  // }



// 1) 예측 API 호출
  try {
    const res = await fetch(`/api/predict?lat=${lat}&lng=${lng}`);
    const { area_ha, windDeg, windSpeed, spreadRate } = await res.json();
    
    // 2) 클릭 좌표 박스 업데이트
    coordBox.innerText = ` 위도:${lat.toFixed(5)}, 경도:${lng.toFixed(5)}`;
    coordBox.style.display = 'block';

    // 3) 애니메이션 타원 그리기
    animateFireExpansion(lat, lng, area_ha, windDeg, windSpeed, spreadRate);

  } catch (err) {
    console.error('예측 API 호출 오류', err);
    alertBox.innerText = ' 예측 정보를 불러오는 데 실패했습니다.';
    alertBox.style.display = 'block';
    setTimeout(() => alertBox.style.display = 'none', 2000);
  }
});


/**
 * 시간에 따라 점점 커지는 산불 확산 애니메이션
 * @param {number} lat         클릭 위도
 * @param {number} lng         클릭 경도
 * @param {number} maxAreaHa   최종 예측 면적 (ha)
 * @param {number} windDeg     풍향(도)
 * @param {number} windSpeed   풍속(m/s)
 * @param {number} spreadRate  확산 속도(ha/초)
 */
function animateFireExpansion(lat, lng, maxAreaHa, windDeg, windSpeed, spreadRate) {
  let t = 0;                           // 경과 시간(초)
  let currentEllipse = null;          // 이전에 그린 폴리곤 참조
  const interval = setInterval(() => {
    t += 1;
    const areaHa = Math.min(spreadRate * t, maxAreaHa);

    // 이전 타원 제거
    if (currentEllipse) currentEllipse.setMap(null);

    // 새로운 타원 그리기
    currentEllipse = simulateFireEllipse(lat, lng, areaHa, windDeg, windSpeed);

    // 최대 면적에 도달하면 애니메이션 종료
    if (areaHa >= maxAreaHa) {
      clearInterval(interval);
    }
  }, 1000); // 1초마다 갱신
}




// 1) GeoJSON으로 강원도 경계 그리기
// fetch('/data/fetch/legal_codes/gangwon_legal_codes.geojson')
//   .then(res => {
//     if (!res.ok) throw new Error(`GeoJSON 로드 실패: ${res.status}`);
//     return res.json();
//   })
//   .then(data => {
//     gangwonGeoJSON = data;
//     data.features.forEach(feat => {
//       // Polygon vs MultiPolygon 처리
//       let coordsArr;
//       if (feat.geometry.type === 'Polygon') {
//         coordsArr = feat.geometry.coordinates;
//       } else if (feat.geometry.type === 'MultiPolygon') {
//         coordsArr = feat.geometry.coordinates[0];
//       } else return;

//       // 첫 번째 링만 사용 (외곽 경계)
//       const path = coordsArr[0].map(pt => new kakao.maps.LatLng(pt[1], pt[0]));
//       const poly = new kakao.maps.Polygon({
//         path,
//         strokeWeight: 2,
//         strokeColor: '#00aa00',
//         strokeStyle: 'dash',
//         strokeOpacity: 0.9,
//         fillColor: '#00ff0055',
//         fillOpacity: 0.1
//       });
//       poly.setMap(map);

//       // hover 시 커서 & 색상
//       kakao.maps.event.addListener(poly, 'mouseover', () => {
//         poly.setOptions({ strokeColor: '#ff6600' });
//         mapContainer.style.cursor = 'pointer';
//       });
//       kakao.maps.event.addListener(poly, 'mouseout', () => {
//         poly.setOptions({ strokeColor: '#00aa00' });
//         mapContainer.style.cursor = 'grab';
//       });
//     });
//   })
//   .catch(err => console.error(err));

// 2) 지도 클릭 시 turf.js로 내부 판별 & 메시지 출력
// kakao.maps.event.addListener(map, 'click', e => {
//   const lat = e.latLng.getLat();
//   const lng = e.latLng.getLng();
//   const pt = turf.point([lng, lat]);

//   let inside = false;
//   if (gangwonGeoJSON) {
//     for (const feat of gangwonGeoJSON.features) {
//       // turf용 Polygon 생성
//       const polyCoords = feat.geometry.type === 'Polygon'
//         ? feat.geometry.coordinates
//         : feat.geometry.type === 'MultiPolygon'
//           ? feat.geometry.coordinates[0]
//           : null;
//       if (!polyCoords) continue;

//       const turfPoly = turf.polygon(polyCoords);
//       if (turf.booleanPointInPolygon(pt, turfPoly)) {
//         inside = true;
//         break;
//       }
//     }
//   }

//   // 클릭 시 커서 포인터
//   mapContainer.style.cursor = 'pointer';

//   if (inside) {
//     coordBox.innerText = ` 위도: ${lat.toFixed(5)}, 경도: ${lng.toFixed(5)}`;
//     coordBox.style.display = 'block';
//     // 산불 확산 계산 호출
//     simulateFireEllipse(lat, lng, 2.5, 45, 3);
//   } else {
//     alertBox.innerText = ' 강원도 외 지역은 클릭할 수 없습니다';
//     alertBox.style.display = 'block';
//     setTimeout(() => { alertBox.style.display = 'none'; }, 2000);
//   }
// });

