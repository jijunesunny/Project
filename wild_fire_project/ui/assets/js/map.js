// 1) 지도 생성 (남한 전체)
const map = new kakao.maps.Map(
  document.getElementById('map'),
  { center: new kakao.maps.LatLng(37.4,128.0), level:11,
    draggable:true, zoomable:true }
);
console.log('map initialized');

// 2) 더블클릭 줌 비활성화
// map.disableDoubleClickZoom(true);
// 2) 확대/축소 컨트롤 UI 추가
const zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);  // 우측에 배치
// 3) 강원도“사각”경계 정의
const sw = new kakao.maps.LatLng(37.018205, 127.080231);
const ne = new kakao.maps.LatLng(38.642618, 129.371910);
const box = [
  new kakao.maps.LatLng(sw.getLat(), sw.getLng()),
  new kakao.maps.LatLng(sw.getLat(), ne.getLng()),
  new kakao.maps.LatLng(ne.getLat(), ne.getLng()),
  new kakao.maps.LatLng(ne.getLat(), sw.getLng()),
  new kakao.maps.LatLng(sw.getLat(), sw.getLng()),
];
new kakao.maps.Polygon({
  map,
  path: box,
  strokeWeight:3,
  strokeColor:'#00aa00',
  strokeStyle:'dash',
  fillColor:'rgba(0,255,0,0.1)',
  fillOpacity:0.2
});
// gangwonPoly.setMap(map);
// 내부 판별용 Bounds
const bounds = new kakao.maps.LatLngBounds(sw, ne);
// 클릭 좌표 박스
const coordBox = document.getElementById('coordBox');
let currentEllipse = null;
let animTimer = null;

// 4) 클릭 이벤트
kakao.maps.event.addListener(map, 'click', function(e) {
  console.log('🖱 click event:', e.latLng.toString());
  if (!bounds.contain(e.latLng)) {
    console.warn(' outside bounds – ignored');
    return;
 }

   // 4-1) 좌표 표시
    const lat = e.latLng.getLat(), lng = e.latLng.getLng();
    coordBox.innerText = `📍 위도:${lat.toFixed(5)}, 경도:${lng.toFixed(5)}`;
    coordBox.style.display = 'block';
    setTimeout(() => coordBox.style.display = 'none', 3000);
   // **샘플** 파라미터 (API 연동 시 여기를 대체)
    animateEllipse(lat, lng, /*area_ha=*/4, /*windDeg=*/60, /*windSpeed=*/2.0, /*secs=*/6);
    });
      // 4-2) 예시 시뮬레이션: 빨간 타원 애니메이션
    //   simulate(lat, lng);
    // });


  // 샘플 파라미터 (API로부터 실제 값을 받으시면 여기만 교체)
// 디버그: animateEllipse 호출 직전
      // const area_ha = 4, windDeg = 60, windSpeed = 2.0, duration = 8;
      // animateEllipse(lat, lng, area_ha, windDeg, windSpeed, duration);


//   animateEllipse(lat, lng, area_ha, windDeg, windSpeed, duration);
// });

// 5) 타원 애니메이션
function animateEllipse(lat, lng, maxHa, windDeg, windSpeed, durationSec) {
  // console.log(' animateEllipse start', {lat,lng,maxHa,windDeg,windSpeed,durationSec});
  if (currentEllipse) currentEllipse.setMap(null);
  if (animTimer) clearInterval(animTimer);

  const windFactor = 1 + windSpeed/10;
  const rad = windDeg * Math.PI/180;
  let t = 0;

  animTimer = setInterval(() => {
    t++;
    const frac = t/durationSec;
    const ha   = maxHa * frac;
    const ry   = Math.sqrt((ha*10000)/(Math.PI*windFactor));
    const rx   = ry * windFactor;
    const dLat = rx / 111000;
    const dLng = ry / (111000 * Math.cos(lat * Math.PI/180));
    // console.log(` t=${t}`, {ha, rx, ry, dLat, dLng});
    // 60분할 타원
    const path = [];
    for (let i=0; i<60; i++) {
      const theta = (2*Math.PI*i)/60;
      const x = dLat * Math.cos(theta), y = dLng * Math.sin(theta);
      const X = x*Math.cos(rad) - y*Math.sin(rad);
      const Y = x*Math.sin(rad) + y*Math.cos(rad);
      path.push(new kakao.maps.LatLng(lat+X, lng+Y));
    }
    // console.log(' path length:', path.length);

    let fill = '#ffff00';
    if (windSpeed>=2.0) fill = '#ff0000';
    else if (windSpeed>=0.5) fill = '#ff9900';

    if (currentEllipse) currentEllipse.setMap(null);
    currentEllipse = new kakao.maps.Polygon({
      map, path,
      strokeWeight:2,
      strokeColor:'#aa0000',
      fillColor: fill,
      fillOpacity:0.4
    });

    if (t>=durationSec) clearInterval(animTimer);
  }, 1000);
}

