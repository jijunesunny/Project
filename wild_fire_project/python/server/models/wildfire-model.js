//../server/models/wildfire-model.js
//ML모델 입출력전담
// 실제 머신러닝 예측 로직을 담고 있는 곳
//firePredict.js (라우터) 가 HTTP 요청을 받아 좌표를 전달하면,
//그 좌표를 기반으로“산불 확산 속도·거리 모델"을 실행해서 결과를 돌려주는 역할
//1.학습모델불러오기(ONNX, TensorFlow, PyTorch, scikit-learn 등)
//2.입력전처리>lat, lng 에서 필요한 지형·기후·식생 인덱스 값을 추출
//DB/파일에서 기상·지형 데이터를 가져와서 모델에 맞는 입력 형태(feature vector)로 변환
//3.예측실행>전처리된데이터를모델에 넣고
//면적(area_ha), 풍향(windDeg), 풍속(windSpeed), 확산속도(spreadRate) 등 4가지 지표를 반환
//4.후처리&반환>모델이 내놓은 raw 예측값에 추가 연산(단위 변환, 보정 등)을 적용
//firePredict.js 라우터에 넘길 깔끔한 객체 형태로 리턴
// server/models/wildfire-model.js
const path = require('path');
// 예: ONNX Runtime, TensorFlow.js, scikit-learn wrapped via Python-shell 등
const { loadModel, runModel } = require('./model-utils');

let model = null;

/**
 * 최초 한 번만 모델을 로드
 */
async function initModel() {
  if (!model) {
    const modelPath = path.join(__dirname, 'saved-models', 'fire_spread.onnx');
    model = await loadModel(modelPath);
  }
}

/**
 * 좌표를 받아서 산불 확산 예측을 수행합니다.
 * @param  {object} opts 
 * @param  {number} opts.lat  클릭 위도
 * @param  {number} opts.lng  클릭 경도
 * @returns {Promise<object>} { area_ha, windDeg, windSpeed, spreadRate }
 */
async function predictFireSpread({ lat, lng }) {
  await initModel();

  // 1) 입력 벡터 생성 (예: [lat, lng, elevation, vegetationIndex, ...])
  const features = await prepareFeatures(lat, lng);

  // 2) 모델 실행
  const rawOutput = await runModel(model, features);
  //    rawOutput 예: [predArea_m2, predWindDeg, predWindSpeed]

  // 3) 후처리:  
  const area_ha    = rawOutput[0] / 10000;       // ㎡ → ha  
  const windDeg    = rawOutput[1];               // 도 단위  
  const windSpeed  = rawOutput[2];               // m/s  
  const spreadRate = area_ha / 3600;             // ha/초 (예시: 1시간 예측값을 3600s 로 나눈 값)

  return { area_ha, windDeg, windSpeed, spreadRate };
}

/**
 * 좌표로부터 필요한 입력 피처(기후·지형·식생)들을 수집/전처리합니다.
 */
async function prepareFeatures(lat, lng) {
  // 예: 지형고도 DB에서 elevation 가져오기
  //     기상 API 호출해서 평균 풍속/풍향 가져오기
  //     NDVI 등 식생지수 계산
  // → [elevation, avgWindSpeed, avgWindDir, ndvi, slope, ...]
  return [/* 숫자 배열 */];
}

module.exports = { predictFireSpread };
