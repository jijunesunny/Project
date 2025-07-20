// ../server/app.js
const express = require('express');
const cors = require('cors');   // ➊ CORS 미들웨어
// body-parser는 Express 4.16+에 내장되어 있습니다.
const app = express();

//express서버에서 요청(Request)데이터를 파싱하거나,
// body-parser, CORS(교차출처리소스공유)허용하기위해 미들웨어를 추가하라 등 필요 미들웨어 세팅...

// ─── ➊ CORS 설정 ─────────────────────────
// 모든 출처(도메인)에서의 요청을 허용하려면:
app.use(cors());
// * 보안을 위해 실제 서비스에서는 도메인을 좁혀서 allowList 형태로 설정하세요.
// 예: app.use(cors({ origin: ['https://내도메인.com'] }));

// ─── ➋ JSON 바디 파싱 ──────────────────────
// Content-Type: application/json 인 요청의 바디를 파싱해서
// req.body 로 붙여 줍니다.
app.use(express.json());

// ─── ➌ URL-encoded 폼 파싱 ─────────────────
// Content-Type: application/x-www-form-urlencoded 인 요청 바디를
// 파싱해서 req.body 로 붙여 줍니다.
app.use(express.urlencoded({ extended: true }));


//server/app.js 내부에서 같은 폴더 ./api/... 로 불러와야함
// api 라우터 연결
const wildfirePredict = require('./api/wildfire-predict');
app.use('/api', wildfirePredict);

//서버 기동
app.listen(3000, () => console.log('Server running on port 3000'));
