// ../assets/js/spread-dashboard.js
window.addEventListener('DOMContentLoaded', () => {
  // 댓글 + 대댓글 + 아이콘
  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form');
  let comments = [
    { id:1, text:"좋은 예측입니다!", replies:[{id:11, text:"동의합니다."}] },
    { id:2, text:"지도 확대기능까지있고~~", replies:[] }
  ];
  function renderComments() {
    commentList.innerHTML = '';
    comments.forEach(c=>{
      const item = document.createElement('div');
      item.className='comment-item';
      item.innerHTML = 
         <span class="cmt-ico"><i class="fas fa-comment-dots"></i></span>
        <b>익명</b>: ${c.text} 
        <button class="reply-btn" onclick="showReply(${c.id})">답글</button>;
      if(c.replies.length) {
        const replyDiv = document.createElement('div');
        replyDiv.className='reply-list';
        replyDiv.innerHTML = c.replies.map(r=>
          <div>
            <span class="cmt-ico"><i class="fas fa-comment-dots"></i></span>
            ↳ ${r.text}
          </div>
        ).join('');
        item.appendChild(replyDiv);
      }
      commentList.appendChild(item);
    });
  }
  window.showReply = function(cid) {
    const reply = prompt("대댓글을 입력하세요");
    if(reply) {
      const cmt = comments.find(c=>c.id===cid);
      cmt.replies.push({id:Date.now(), text:reply});
      renderComments();
    }
  }
  commentForm.onsubmit = e=>{
    e.preventDefault();
    const txt = commentForm.comment.value.trim();
    if(txt) {
      comments.push({id:Date.now(), text:txt, replies:[]});
      commentForm.comment.value = '';
      renderComments();
    }
  }
  renderComments();
});

function toggleDropdown() {
  document.querySelector('.dropdown-list').classList.toggle('open');
}
function selectRegion(el) {
  document.querySelector('.dropdown-selected').textContent = el.textContent;
  document.querySelector('.dropdown-list').classList.remove('open');
}
// 드롭다운 외부 클릭시 닫기
window.addEventListener('click', function(e){
  const dd = document.getElementById('region-dropdown');
  if(!dd.contains(e.target)) dd.querySelector('.dropdown-list').classList.remove('open');
});