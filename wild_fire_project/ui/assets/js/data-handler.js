//../assets/js/data-handler.js
// data-handler.js
// 강원도 시군 중심좌표 및 산불 확산 예측 데이터 관리

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

// 예측 산불 확산 데이터(시간,위치,속도)
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
// 마커 크기 계산 함수 예시 (속도에 따라)
function getMarkerSize(speed) {
  // 속도 0~100 범위를 20~50px 크기로 매핑 (임의값)
  return Math.min(50, 20 + (speed / 100) * 30);
}

// 마커 생성 및 애니메이션
let currentIndex = 0;
let marker = new kakao.maps.Marker({
  map: map,
  position: new kakao.maps.LatLng(wildfirePath[0].lat, wildfirePath[0].lng),
  image: new kakao.maps.MarkerImage(
    'https://cdn-icons-png.flaticon.com/512/482/482545.png',
    new kakao.maps.Size(getMarkerSize(wildfirePath[0].속도), getMarkerSize(wildfirePath[0].속도))
  )
});

// 1.5초마다 마커 위치와 크기 변경
const intervalId = setInterval(() => {
  currentIndex++;
  if (currentIndex >= wildfirePath.length) {
    clearInterval(intervalId);
    return;
  }
  const point = wildfirePath[currentIndex];
  // 위치 이동
  marker.setPosition(new kakao.maps.LatLng(point.lat, point.lng));
  // 크기 변경
  const size = getMarkerSize(point.속도);
  marker.setImage(new kakao.maps.MarkerImage(
    'https://cdn-icons-png.flaticon.com/512/482/482545.png',
    new kakao.maps.Size(size, size)
  ));
}, 1500);
// 예측 실행 버튼 클릭 시 가상 애니메이션 실행 예시 수정
  document.getElementById('run-predict').addEventListener('click', () => {
  // ... 기존 validation 및 지도 준비 로직 ...

  if (kakaoMapReady && typeof window.drawWildfireRoute === 'function') {
    // 기존 drawWildfireRoute 대신 가상 애니메이션 함수 호출
    startWildfireAnimation(virtualWildfirePath);
  }
});
// function getRegionCenters() {
//   return regionCenters;
// }

// function getWildfireData(region, date) {
//   return wildfireData[region]?.[date] ?? null;
// }

// export { getRegionCenters, getWildfireData };
