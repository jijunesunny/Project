import requests
import urllib.parse
import json
import os

BASE_URL = "https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

DATA_DIR = "../wild_fire_project/data/raw/legal_codes"
os.makedirs(DATA_DIR, exist_ok=True)
FILE_NAME = "all_legal_codes.json"

encoded_key = urllib.parse.quote_plus(SERVICE_KEY)

params = {
    "ServiceKey": encoded_key,
    "pageNo": 1,
    "numOfRows": 1000,
    "type": "json"
}

def fetch_legal_codes():
    response = requests.get(BASE_URL, params=params, verify=False)
    if response.status_code != 200:
        print(f"API 호출 실패: 상태코드 {response.status_code}")
        return

    data = response.json()
    print(json.dumps(data, indent=2, ensure_ascii=False))

    items = data.get("StanReginCd", {}).get("row", [])

    if not items:
        print("법정동 코드 데이터가 없습니다.")
        return

    path = os.path.join(DATA_DIR, FILE_NAME)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"법정동 코드 전체 저장 완료: {path}")

if __name__ == "__main__":
    fetch_legal_codes()
