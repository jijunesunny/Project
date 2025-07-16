//팀 지도 생성, ui변경만 
//../assets/js/map.js 
//../data/raw/legal_codes/hangjeongdong_gangwon.geojson 에서 가져옴
//산불확산계산은 wildfire-calc.js에서 처리
//클릭시 위경도표시 (LatLng 출력)
//폴리곤은 strokeStyle: 'dash', fillOpacity: 0.0, hover 시 색상 바뀜

// 지도 생성
const mapContainer = document.getElementById('map');
const mapOption = {
  // center: new kakao.maps.LatLng(37.7, 128.3),
  // level: 9
  center: new kakao.maps.LatLng(35.8, 127.8), //남한 중심 좌표(위도경도센터서울-대구중심)
  level: 12, // 확대 레벨(제주까지)
};
const map = new kakao.maps.Map(mapContainer, mapOption);

// 마우스 커서 스타일 - 클릭 가능 상태로 보이도록
mapContainer.style.cursor = 'pointer';

// 남한 경계 제한: 지도 이동이 남한을 벗어나지 못하도록 설정
const southKoreaBounds = new kakao.maps.LatLngBounds(
  new kakao.maps.LatLng(33.0, 124.5),  // 남서쪽 경계
  new kakao.maps.LatLng(39.3, 131.0)   // 북동쪽 경계
);



// 지도 동작 가능하게 설정
map.setDraggable(true);
map.setZoomable(true);

// CSS 상으로도 클릭 허용되게 확인
mapContainer.style.pointerEvents = 'auto';

// GeoJSON 경계 불러오기
let gangwonGeoJSON = null;

//확대축소 부드럽게
function smoothZoomIn() {
  const currentLevel = map.getLevel();
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

//GeoJSON 파일불러와서 강원도전체폴리곤 경계그리기
//../data/fetch/legal_codes/gangwon_legal_codes.geojson 좌표연결
fetch('../data/fetch/legal_codes/gangwon_legal_codes.geojson')
  .then(res => res.json())
  .then(data => {
    gangwonGeoData = data;
    drawGangwonBoundary(data);  // 폴리라인 표시 함수 호출
  });

   function drawGangwonBoundary(geojson) {
  geojson.features.forEach((feature) => {
    const coord = feature.geometry.coordinates;
    if (!coord || coord[0] === 0) return;  // 유효 좌표만

    const lat = coord[1];
    const lng = coord[0];

    const marker = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(lat, lng),
      radius: 30,
      strokeWeight: 1,
      strokeColor: "#00aa00",
      strokeOpacity: 0.6,
      strokeStyle: "dash",
      fillColor: "#00ff00",
      fillOpacity: 0.08
    });

    marker.setMap(map);

    // Hover 효과
    kakao.maps.event.addListener(marker, 'mouseover', function () {
      marker.setOptions({ fillColor: '#ffaa00' });
    });

    kakao.maps.event.addListener(marker, 'mouseout', function () {
      marker.setOptions({ fillColor: '#00ff00' });
    });

    // 클릭 시 위경도 표시
    kakao.maps.event.addListener(marker, 'click', function () {
      const coordBox = document.getElementById('coordBox');
      coordBox.innerText = `📍 ${feature.properties.name}\n위도: ${lat}, 경도: ${lng}`;
    });
  });
}


// 클릭 시 turf.js로 강원도 안쪽인지 판단
kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
  const latlng = mouseEvent.latLng;
  const clickedPoint = turf.point([latlng.getLng(), latlng.getLat()]);

  let isInside = false;
  if (gangwonGeoJSON) {
    for (const feature of gangwonGeoJSON.features) {
      const turfPoly = turf.polygon(feature.geometry.coordinates);
      if (turf.booleanPointInPolygon(clickedPoint, turfPoly)) {
        isInside = true;
        break;
      }
    }
  }
 
  const alertBox = document.getElementById('alertBox');
  if (isInside) {
      coordBox.innerText = ` 위도: ${latlng.getLat().toFixed(5)} / 경도: ${latlng.getLng().toFixed(5)}`;
  simulateFireEllipse(latlng.getLat(), latlng.getLng(), 2.5, 45, 3);
  } else {
    alertBox.innerText = ' 강원도 외 지역은 클릭할 수 없습니다';
    alertBox.style.display = 'block';

    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 2000); // 2초 후 자동 숨김
  }
});

 