import requests
import json
import os

# API 기본 정보
BASE_URL = "https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 데이터 저장 경로
DATA_DIR = "../wild_fire_project/data/fetch/legal_codes"
os.makedirs(DATA_DIR, exist_ok=True)
FILE_NAME = "gangwon_legal_codes.json"

# 요청 파라미터
params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 1000,        # 한번에 많이 받아오기 (최대 허용 범위에 맞게 조절 가능)
    "type": "json",
    "locatadd_nm": "강원"     # '강원'이라는 지역주소명으로 필터링 요청
}

def fetch_gangwon_legal_codes():
    response = requests.get(BASE_URL, params=params)

    if response.status_code != 200:
        print(f"API 호출 실패: 상태코드 {response.status_code}")
        return

    data = response.json()

    # 데이터 구조 출력 (필요시 주석 처리 가능)
    print(json.dumps(data, indent=2, ensure_ascii=False))

    # 강원도 법정동 코드 데이터 추출
    # data가 리스트인 경우 대비하여 처리
    if isinstance(data, list):
        main_data = data[0]
    else:
        main_data = data

    # "StanReginCd" 아래 "row" 리스트가 법정동 코드 데이터
    items = main_data.get("StanReginCd", {}).get("row", [])

    if not items:
        print("강원도 법정동 코드 데이터가 없습니다.")
        return

    # 강원도만 다시 한번 필터링 (만약 API가 제대로 필터링 안하면 대비)
    gangwon_codes = []
    for item in items:
        loc_name = item.get("locatadd_nm", "")
        if "강원" in loc_name:
            gangwon_codes.append(item)

    if not gangwon_codes:
        print("강원도 데이터가 없습니다.")
        return

    # JSON 파일로 저장
    save_path = os.path.join(DATA_DIR, FILE_NAME)
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(gangwon_codes, f, ensure_ascii=False, indent=2)

    print(f"강원도 법정동 코드 JSON 저장 완료: {save_path}")

if __name__ == "__main__":
    fetch_gangwon_legal_codes()
