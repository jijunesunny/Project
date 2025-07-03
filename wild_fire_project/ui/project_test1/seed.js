// seed.js
const bg1 = document.querySelector('.seed-bg.bg1');
const bg2 = document.querySelector('.seed-bg.bg2');
let active = 1;

function swapBG() {
  if (active === 1) {
    bg1.classList.remove('active');
    bg2.classList.add('active');
    active = 2;
  } else {
    bg2.classList.remove('active');
    bg1.classList.add('active');
    active = 1;
  }
}
bg1.classList.add('active'); // 첫화면은 산불사진
setInterval(swapBG, 5000);


// const bgImages = [
//   "url('fire.png') right center/cover no-repeat",
//   "url('forest.jpg') right center/cover no-repeat" // ← 'forest.jpg'는 산속(초록) 이미지 파일명
// ];

// let current = 0;

// setInterval(() => {
//   current = (current + 1) % bgImages.length;
//   seed.style.background = `
//     linear-gradient(
//       to right,
//       var(--color-green) 0%,
//       var(--color-green) 45%,
//       rgba(0,0,0,0) 46%
//     ),
//     ${bgImages[current]}
//   `;
// }, 5000);
