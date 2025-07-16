//팀 지도
//산불 확산 계산, 타원 그리기, 면적 수학식, 확산속도 기반 스타일 계산
//../assets/js/wildfire-calc.js
//면적 ha → m² 변환(m 단위)
// 풍향→ 회전각도 적용
// 풍속  → windFactor 적용
// 확산방향, rx, ry 계산
//타원 polygon 만들고 map.addOverlay()
//속도기반 색상: 확산속도에 따라 빨강-주황-노랑

//  산불 확산 타원 그리기 함수
function simulateFireEllipse(lat, lng, area_ha, windDeg, windSpeed) {
  const area_m2 = area_ha * 10000; //면적 헥타르=> m²
  const windFactor = 1 + (windSpeed / 10); //풍속 영향
  //타원 반지름 계산
  const ry = Math.sqrt(area_m2 / (Math.PI * windFactor));
  const rx = ry * windFactor;
  //위경도 환산   
  const rxLat = rx / 111000; // 위도 환산
  const ryLng = ry / (111000 * Math.cos(lat * Math.PI / 180)); // 경도 환산
  //타원 점 생성
  const steps = 60;
  const points = [];
  const rad = windDeg * Math.PI / 180;

  for (let i = 0; i < steps; i++) {
    const theta = (2 * Math.PI * i) / steps;
    const x = rxLat * Math.cos(theta);
    const y = ryLng * Math.sin(theta);

    const rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
    const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);

    points.push(new kakao.maps.LatLng(lat + rotatedX, lng + rotatedY));
  }

  // 색상 결정 => 확산속도 = windSpeed 사용)
  let fillColor = "#ffff00"; // 느림
  if (windSpeed >= 2.0) fillColor = "#ff0000"; // 빠름
  else if (windSpeed >= 0.5) fillColor = "#ff9900"; // 보통
  //지도에 타원 표시 
  const ellipse = new kakao.maps.Polygon({
    path: points,
    strokeWeight: 2,
    strokeColor: "#aa0000",
    strokeOpacity: 0.7,
    strokeStyle: 'solid',
    fillColor: fillColor,
    fillOpacity: 0.5,
  });

  ellipse.setMap(map);
}
