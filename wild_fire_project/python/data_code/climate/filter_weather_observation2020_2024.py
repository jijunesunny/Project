#\data_code\climate\fetch_weather_observation202001_202412.py 엑셀파일내용을
#python\data_code\climate\filter_weather_observation2020_2024.py 에서 불러서 json,geojson

import pandas as pd
import json
import os

#  엑셀 파일 경로 (강원도만 정제된 2020~2024 관측 데이터)
input_path = r'C:/Users/user/Desktop/wildfire_data/weather_observation202001_202412_gangwon_only.xlsx'

#  출력 경로 설정
json_path = r'data/fetch/geo/filter_weather_observation2020_2024.json'
geojson_path = r'data/fetch/geo/filter_weather_observation2020_2024.geojson'

# 엑셀 로드
df = pd.read_excel(input_path)

# 컬럼명 맞춰서 추출
df = df[['obs_nm', 'lon', 'lat', 'addr', 'anc_dt', 'avg_tmr', 'avg_hmd', 'avg_wv']]
df.columns = ['name', 'lon', 'lat', 'addr', 'date', 'avg_tmr', 'avg_hmd', 'avg_wv']
df = df.dropna(subset=['lat', 'lon'])

# 디렉토리 만들기
os.makedirs(os.path.dirname(json_path), exist_ok=True)

#  일반 JSON 저장
# JSON 저장
json_data = df.to_dict(orient="records")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

#  GeoJSON 저장
features = []
for row in json_data:
    features.append({
        "type": "Feature",
        "properties": {
            "name": row["name"],
            "addr": row["addr"],
            "date": row["date"],
            "avg_tmr": row["avg_tmr"],
            "avg_hmd": row["avg_hmd"],
            "avg_wv": row["avg_wv"]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [row["lon"], row["lat"]]
        }
    })

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open(geojson_path, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f" JSON 저장 완료 → {json_path}")
print(f" GEOJSON 저장 완료 → {geojson_path}")
print(f"총 마커 수: {len(df)}") #9224개
print("샘플 마커:", df.head(1).to_dict(orient='records')[0])
# {'name': '관측소명', 'lon': '위도', 'lat': '경도', 'addr': '주소', 
# 'date': '관측일자', 'avg_tmr': '평균온도', 'avg_hmd': '평균습도', 'avg_wv': '평균풍속'}