import requests
import json
import os

#산림청 국립산림과학원_산악기상정보//서비스 유형: REST API, GET 방식
# API 기본 정보
BASE_URL = "http://apis.data.go.kr/1400377/mtweather/mountListSearch"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 요청 파라미터 예시
params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 10,
    "_type": "json",
    "localArea": "10",      # 강원도 지역코드
    "obsid": "2001",        # 춘천 연엽산 지점번호
    "tm": "202106301809"    # 관측시간 (YYYYMMDDHHmm)
}

response = requests.get(BASE_URL, params=params)

if response.status_code == 200:
    data = response.json()

    # 저장 경로 및 파일명 지정
    save_dir = "./data/raw/climate"
    os.makedirs(save_dir, exist_ok=True)  #os 모듈 필요!
    file_path = os.path.join(save_dir, "mountain_weather_202106301809.json")

    # JSON 파일로 저장
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f" JSON 파일 저장 완료: {file_path}")
else:
    print(f"API 호출 실패: 상태코드 {response.status_code}")