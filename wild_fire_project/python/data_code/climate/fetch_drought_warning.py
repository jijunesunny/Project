import json
import os
#수자원 가뭄예경보정보//이미지,표,그래프
# 검사할 JSON 파일 경로 (필요시 여러 파일 검사용으로 변경 가능)
FILE_PATH = "../wild_fire_project/data/fetch/climate/drought_forecast_201908.json"

# 강원도 주요 시군 리스트
GANGWON_PLACES = [
    "강원", "춘천", "원주", "홍천", "횡성", "평창", "철원", "화천",
    "영월", "정선", "양구", "인제", "고성", "양양", "속초",
    "강릉", "동해", "삼척"
]

def contains_gangwon_area(text):
    if not text or text == "-" or text.strip() == "":
        return False
    return any(place in text for place in GANGWON_PLACES)

def check_gangwon_in_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
    if isinstance(items, dict):
        items = [items]

    found_entries = []

    for idx, item in enumerate(items):
        for key, value in item.items():
            if contains_gangwon_area(value):
                found_entries.append((idx+1, key, value))

    if found_entries:
        print(f"총 {len(found_entries)}건의 강원도 관련 데이터 발견:")
        for entry in found_entries:
            print(f"  항목 #{entry[0]} 필드 '{entry[1]}': {entry[2]}")
    else:
        print("해당 파일에 강원도 관련 데이터가 없습니다.")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        check_gangwon_in_file(FILE_PATH)
    else:
        print(f"파일을 찾을 수 없습니다: {FILE_PATH}")
