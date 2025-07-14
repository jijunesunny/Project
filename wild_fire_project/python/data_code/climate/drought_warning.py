import requests
import json
import os

#한국수자원공사의 정보 API 가뭄 지수, 이미지,표,그래프
#1.'기상 가뭄예경보(drght_forecast)'
BASE_URL = "http://apis.data.go.kr/B500001/drghtFrcstAlarmWeather/frcstInfoList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 2. 데이터를 저장할 폴더와 파일명 지정
DATA_DIR = "../wild_fire_project/data/raw/climate"  # 원시 데이터를 저장할 폴더 경로
FILE_NAME = "drought_forecast_201908.json" # 저장할 JSON 파일명

# 폴더 없으면 생성
os.makedirs(DATA_DIR, exist_ok=True)

# 3. API 요청 파라미터
params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 10,
    "anlDt": "201908",  # 분석 연월 (필요에 따라 변경)
    "_type": "json"
}

def fetch_and_save_drought_data():   #verify=False보안상 권장않음//꼭!!테스트용으로만 사용권장
    response = requests.get(BASE_URL, params=params)

    if response.status_code == 200:
        data = response.json()

 # JSON 파일로 저장 (폴더 + 파일명 결합)
        file_path = os.path.join(DATA_DIR, FILE_NAME)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f" 데이터 저장 완료: {file_path}")

        # 데이터 일부 미리보기
        items = data.get("response", {}).get("body", {}).get("items", {}).get("item")
        if items:
            if isinstance(items, dict):
                items = [items]
            print("데이터 일부 미리보기:")
            for i, item in enumerate(items[:3]):
                print(f"{i+1}. {item}")
        else:
            print("데이터가 없습니다.")
    else:
        print(f"API 호출 실패: 상태코드 {response.status_code}")

if __name__ == "__main__":
    fetch_and_save_drought_data()