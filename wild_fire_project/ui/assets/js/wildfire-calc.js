// ../assets/js/wildfire-calc.js
//팀 확산계산처리
//산불확산계산은 wildfire-calc.js에서 처리
//../assets/js/map.js 에서 지도 움직임만 처리
//../data/raw/legal_codes/hangjeongdong_gangwon.geojson 에서 가져옴
//클릭시 위경도표시 (LatLng 출력)
//폴리곤은 strokeStyle: 'dash', fillOpacity: 0.0, hover 시 색상 바뀜
// ----------------------------------------------
//  산불 확산 타원 계산 & 시각화 전담
// - 헥타르→m², 풍속/풍향 반영
// - rx/ry, 회전, 색상 지정
// ----------------------------------------------

//클릭좌표를 백엔드API로보내 예측결과를받고,
// 그결과(area_ha면적, windDeg풍향, windSpeed풍속,spreadRate확산속도)를 이용해
//시간에 따라 점점 커지는 타원

/**
 * 산불 확산 타원 그리기
 * @returns {kakao.maps.Polygon} 방금 그린 폴리곤 객체
 */
function simulateFireEllipse(lat, lng, area_ha, windDeg, windSpeed) {
  const area_m2 = area_ha * 10000;
  const windFactor = 1 + (windSpeed / 10);
  const ry = Math.sqrt(area_m2 / (Math.PI * windFactor));
  const rx = ry * windFactor;

  const rxLat = rx / 111000;
  const ryLng = ry / (111000 * Math.cos(lat * Math.PI / 180));

  const pts = [];
  const rad = windDeg * Math.PI / 180;
  for (let i = 0; i <= 60; i++) {
    const theta = (2 * Math.PI * i) / 60;
    const x = rxLat * Math.cos(theta);
    const y = ryLng * Math.sin(theta);
    const X = x * Math.cos(rad) - y * Math.sin(rad);
    const Y = x * Math.sin(rad) + y * Math.cos(rad);

    pts.push(new kakao.maps.LatLng(lat + X, lng + Y));
  }
  
//속도 기반 색상
  let fillColor = '#ffff00';
  if (windSpeed >= 2) fillColor = '#ff0000';
  else if (windSpeed >= 0.5) fillColor = '#ff9900';

  const polygon = new kakao.maps.Polygon({
    path: pts,
    strokeWeight: 2,
    strokeColor: '#aa0000',
    strokeOpacity: 0.7,
    fillColor,
    fillOpacity: 0.5
  });
  polygon.setMap(map);
  return polygon; // 반환
}


