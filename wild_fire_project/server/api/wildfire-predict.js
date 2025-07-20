// ../server/api/wildfire-predict.js
const express = require('express');
const router = express.Router();
// predictFireSpread는 머신러닝 모델 호출 함수
const { predictFireSpread } = require('../models/wildfire-model');

router.get('/predict', async (req, res) => {
  const { lat, lng } = req.query;
  try {
// 예: { area_ha: 5.2, windDeg: 135, windSpeed: 1.8, spreadRate: 0.8 }
    const result = await predictFireSpread({ lat, lng });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '예측 실패' });
  }
});

module.exports = router;
