import requests
import json
import os
#"rn": "-","-">실제 측정값이 없거나, 결측값(missing data)을 의미NAN,결측치 보간(interpolation), 삭제, 또는 별도 표시
#산림청 국립산림과학원_산악기상정보//서비스 유형: REST API, GET 방식
# API 기본 정보
BASE_URL = "http://apis.data.go.kr/1400377/mtweather/mountListSearch"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

save_dir = "../wild_fire_project/data/raw/climate"
os.makedirs(save_dir, exist_ok=True)

num_per_page = 100  # 한 페이지에 100개 데이터 요청
page_no = 1
all_items = []

while True:
    params = {
        "ServiceKey": SERVICE_KEY,
        "pageNo": page_no,
        "numOfRows": num_per_page,
        "_type": "json",
        "localArea": "10",
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code != 200:
        print(f"API 호출 실패: 상태코드 {response.status_code}")
        break

    data = response.json()
    body = data.get('response', {}).get('body', {})
    items = body.get('items', {}).get('item')

    if items:
        # items가 리스트가 아닐 경우 리스트로 변환
        if isinstance(items, dict):
            items = [items]

        all_items.extend(items)

    total_count = body.get('totalCount', 0)
    print(f"페이지 {page_no} / 총 {total_count}건 중 {len(all_items)}건 수집 완료")

    if len(all_items) >= total_count:
        break

    page_no += 1

# 전체 데이터를 JSON 파일로 저장
file_path = os.path.join(save_dir, "mountain_weather_all.json")
with open(file_path, "w", encoding="utf-8") as f:
    json.dump({"data": all_items}, f, ensure_ascii=False, indent=2)

print(f" 전체 데이터 저장 완료: {file_path}")
