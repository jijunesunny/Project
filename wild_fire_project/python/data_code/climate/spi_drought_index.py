import requests
import json
import os
#한국수자원공사 SPI 가뭄지수정보 API
# API 기본 정보
BASE_URL = "https://apis.data.go.kr/B500001/drghtIdexSpiAnals/analsInfoList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 저장 경로 및 파일명 설정
DATA_DIR = "../wild_fire_project/data/fetch/climate"
os.makedirs(DATA_DIR, exist_ok=True)
FILE_NAME = "spi_drought_index_201905.json"

# 요청 파라미터
params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": "1",
    "numOfRows": "10",
    "hjdCd": "1168058000",     # 행정동 코드 예시 (강원도 코드로 교체 필요)
    "stDt": "20190501",        # 검색 시작일 (YYYYMMDD)
    "edDt": "20241231",        # 검색 종료일 (YYYYMMDD)
    "_type": "json"
}

def fetch_spi_data():
    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()

        # JSON 파일 저장
        file_path = os.path.join(DATA_DIR, FILE_NAME)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"데이터 저장 완료: {file_path}")
        print("응답 데이터 일부 미리보기:")

        items = data.get("response", {}).get("body", {}).get("items", {}).get("item")
        if items:
            if isinstance(items, dict):
                items = [items]
            for i, item in enumerate(items[:3]):
                print(f"{i+1}. {item}")
        else:
            print("조회된 데이터가 없습니다.")
    else:
        print(f"API 호출 실패, 상태 코드: {response.status_code}")

if __name__ == "__main__":
    fetch_spi_data()
