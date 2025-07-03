const wrapper = document.querySelector('.loading-wrapper');
const canvas = document.createElement('canvas');
canvas.width = wrapper.clientWidth;
canvas.height = wrapper.clientHeight;
wrapper.appendChild(canvas);
const ctx = canvas.getContext('2d');

// 간단한 별(star) 효과
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 1.5 + 0.5,
  alpha: Math.random()
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    // 반짝임 변화
    s.alpha += (Math.random() - 0.5) * 0.05;
    if (s.alpha < 0) s.alpha = 0;
    if (s.alpha > 1) s.alpha = 1;
  });
  requestAnimationFrame(draw);
}
draw();
