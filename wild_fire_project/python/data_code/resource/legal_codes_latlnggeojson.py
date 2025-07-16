import json
import os
import requests
from tqdm import tqdm
#../wild_fire_project/python/data_code/resource/legal_codes_latlnggeojson.py

#변환 완료! 총 1000개 좌표 포함 GeoJSON 저장

# 입력 JSON 경로 (주소 정보만 있음)>>카카오api로 주소를 위경도 변환넣음
JSON_FILE_PATH = "../wild_fire_project/data/fetch/legal_codes/gangwon_legal_codes.json"
# 출력 GeoJSON 경로
GeoJSON_FILE_PATH = "../wild_fire_project/data/fetch/legal_codes/gangwon_legal_codes.geojson"

#  카카오 REST API 키 설정 (반드시 본인의 키로 교체)
KAKAO_REST_API_KEY = "239faa0b2540f6547070ca7acef93934"
headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}

# 주소 → 위경도 변환 함수
def get_lat_lng_kakao(address):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    params = {"query": address}
    try:
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if result['documents']:
            lat = float(result['documents'][0]['y'])
            lng = float(result['documents'][0]['x'])
            return lat, lng
    except:
        pass
    return None, None

# 메인 처리 함수
def create_geojson():
    with open(JSON_FILE_PATH, encoding="utf-8") as f:
        data = json.load(f)

    features = []

    for row in tqdm(data):
        region_cd = row.get("region_cd")
        name = row.get("locatadd_nm")

        lat, lng = get_lat_lng_kakao(name)

        feature = {
            "type": "Feature",
            "properties": {
                "region_cd": region_cd,
                "name": name
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat] if lat and lng else None
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    os.makedirs(os.path.dirname(GeoJSON_FILE_PATH), exist_ok=True)
    with open(GeoJSON_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

    print(f"\n 변환 완료! 총 {len(features)}개 좌표 포함 GeoJSON 저장 → {GeoJSON_FILE_PATH}")

if __name__ == "__main__":
    create_geojson()
