//../assets/js/spread-dashboard.js
window.addEventListener('DOMContentLoaded', () => {
  // 파라미터 예측 폼
  document.getElementById('param-form').onsubmit = function(e) {
    e.preventDefault();
    // 폼 파라미터 취득, 서버 연동 후 데이터 바인딩 등
    document.getElementById('temp-val').textContent = 27;
    document.getElementById('humid-val').textContent = 42;
    document.getElementById('wind-val').textContent = 3.8;
    document.getElementById('slope-val').textContent = 19;
    document.getElementById('ndvi-val').textContent = 0.68;
    document.getElementById('hist-val').textContent = 3;
    document.getElementById('mae-val').textContent = '91.6';
    document.getElementById('rmse-val').textContent = '120.2';
    updateCharts();
  };

  window.updateCharts = function() {
    // Pie Chart (속도 등급 분포)
    const pieChart = document.getElementById('pie-chart');
    pieChart.innerHTML = `<svg width="80" height="80"><circle cx="40" cy="40" r="36" fill="#b0e8d6"/><text x="40" y="45" text-anchor="middle" fill="#493c30" font-size="19">빠름</text></svg>`;
    // Line Chart (확산거리 추이)
    const lineChart = document.getElementById('line-chart');
    lineChart.innerHTML = `<svg width="140" height="80">
      <polyline points="0,70 20,50 40,35 60,45 80,30 100,38 120,16 140,10" stroke="#208e56" stroke-width="2" fill="none"/>
      <polyline points="0,70 20,62 40,63 60,55 80,47 100,55 120,38 140,29" stroke="#b0e8d6" stroke-width="2" fill="none"/>
    </svg>`;
  }
  updateCharts();
});
