import requests
import os
import json

SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="
BASE_URL = "http://apis.data.go.kr/B500001/drought/drghtFcltyCode/fcltyList"

DATA_DIR = "../wild_fire_project/data/raw/legal_codes"
os.makedirs(DATA_DIR, exist_ok=True)
NUM_OF_ROWS = 1000

facility_types = {
    "01": "용수댐",
    "02": "다목적댐",
    "03": "수위관측소",
    "04": "강우관측소",
    "05": "취수장",
    "06": "정수장",
    "07": "지하수관측소",
    "08": "행정동",
    "09": "공업단지",
    "10": "북한GTS관측소",
    "11": "국외GTS관측소",
    "12": "기상관측소"
}

def fetch_fclty_codes(fclty_code, fclty_name):
    print(f"'{fclty_name}'({fclty_code}) 데이터 조회 시작...")

    all_items = []
    page_no = 1

    while True:
        params = {
            "ServiceKey": SERVICE_KEY,
            "pageNo": page_no,
            "numOfRows": NUM_OF_ROWS,
            "type": "json",
            "fcltyTyCode": fclty_code
        }

        response = requests.get(BASE_URL, params=params)
        if response.status_code != 200:
            print(f"API 요청 실패 (상태코드 {response.status_code}), 중단")
            break

        try:
            data = response.json()
        except json.JSONDecodeError:
            print("JSON 파싱 실패, 응답 출력:")
            print(response.text)
            break

        items = data.get("response", {}).get("body", {}).get("items", {}).get("item")
        if not items:
            print("더 이상 데이터가 없습니다.")
            break

        if isinstance(items, dict):
            items = [items]

        all_items.extend(items)
        total_count = int(data.get("response", {}).get("body", {}).get("totalCount", 0))

        print(f"페이지 {page_no} 완료, 누적 {len(all_items)} / 총 {total_count}")

        if len(all_items) >= total_count:
            break
        page_no += 1

    file_name = f"fcltycodes_{fclty_name}.json"
    file_path = os.path.join(DATA_DIR, file_name)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)

    print(f"'{fclty_name}' 데이터 저장 완료: {file_path}\n")

def main():
    for code, name in facility_types.items():
        fetch_fclty_codes(code, name)

if __name__ == "__main__":
    main()
