// 1) 지도 생성
const mapContainer = document.getElementById('map');
const map = new kakao.maps.Map(mapContainer, {
  center: new kakao.maps.LatLng(37.7, 128.0),
  level: 8
});

// 2) 더블클릭 줌 비활성화
map.disableDoubleClickZoom(true);

// 3) 강원도 “사각” 경계 정의
const sw = new kakao.maps.LatLng(37.018205, 127.080231);
const ne = new kakao.maps.LatLng(38.642618, 129.371910);
const boxPath = [
  sw,
  new kakao.maps.LatLng(sw.getLat(), ne.getLng()),
  ne,
  new kakao.maps.LatLng(ne.getLat(), sw.getLng()),
  sw
];
new kakao.maps.Polygon({
  map,
  path: boxPath,
  strokeWeight:3,
  strokeColor:'#00aa00',
  strokeStyle:'dash',
  fillColor:'rgba(0,255,0,0.1)',
  fillOpacity:0.2
});

// 내부 판별용 Bounds
const bounds = new kakao.maps.LatLngBounds(sw, ne);

// 클릭 좌표 박스
const coordBox = document.getElementById('coordBox');

let currentEllipse = null;
let animTimer = null;

// 4) 클릭 이벤트
kakao.maps.event.addListener(map, 'click', function(e) {
  console.log('>>> map click', e.latLng.toString());

  const pt = e.latLng;
  if (!bounds.contain(pt)) {
    console.warn('강원도 외부 클릭 무시');
    return;
  }

  const lat = pt.getLat(), lng = pt.getLng();
  coordBox.innerText = `📍 위도:${lat.toFixed(5)}, 경도:${lng.toFixed(5)}`;
  coordBox.style.display = 'block';
  setTimeout(() => coordBox.style.display='none', 3000);

  // 샘플 파라미터 (API로부터 실제 값을 받으시면 여기만 교체)
  const area_ha   = 4,
        windDeg   = 60,
        windSpeed = 2.0,
        duration  = 8; 

  animateEllipse(lat, lng, area_ha, windDeg, windSpeed, duration);
});

// 5) 타원 애니메이션
function animateEllipse(lat, lng, maxHa, windDeg, windSpeed, durationSec) {
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

    // 60분할 타원
    const path = [];
    for (let i=0; i<60; i++) {
      const theta = (2*Math.PI*i)/60;
      const x = dLat * Math.cos(theta), y = dLng * Math.sin(theta);
      const X = x*Math.cos(rad) - y*Math.sin(rad);
      const Y = x*Math.sin(rad) + y*Math.cos(rad);
      path.push(new kakao.maps.LatLng(lat+X, lng+Y));
    }

    let fill = '#ffff00';
    if (windSpeed>=2.0) fill = '#ff0000';
    else if (windSpeed>=0.5) fill = '#ff9900';

    if (currentEllipse) currentEllipse.setMap(null);
    currentEllipse = new kakao.maps.Polygon({
      map,
      path,
      strokeWeight:2,
      strokeColor:'#aa0000',
      fillColor: fill,
      fillOpacity:0.4
    });

    if (t>=durationSec) clearInterval(animTimer);
  }, 1000);
}
