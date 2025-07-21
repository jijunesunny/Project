#이전산불+위경도 geojson만들기
#발생시각 (발생일시 + 발생일시_시간)
#진화 완료 시각 (진화종료시간 + 진화종료시간_시간)
#소요 시간(분 단위)
#피해 면적 (피해면적_합계)
#해당 행정구역의 중심점 위경도
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime

# 1. 파일 경로 설정
legal_geojson_path = "data/fetch/legal_codes/gangwon_legal_codes.geojson"
fire_json_path      = "data/fetch/fire_incidents_stats/gangwon_sanbul_combined_2023_2024.json"
output_geojson_path = "data/processed/fire_incidents_stats/sanbul_legal.geojson"

# 2. 산불 JSON 로드 → DataFrame
with open(fire_json_path, "r", encoding="utf-8") as f:
    js = json.load(f)
df_fire = pd.DataFrame(js["data"])

# 3. (디버깅용) 컬럼명 출력 — 이 줄을 보고 location_field에 정확히 입력하세요.
print("🔥 JSON 컬럼명:", df_fire.columns.tolist())

# 4. JSON 에 실제 “시·군·구” 필드명을 아래에 입력하세요.
# 예를 들어 컬럼명 리스트 중 '발생장소_시군구'라면:
location_field = "발생장소_시군구"  

if location_field not in df_fire.columns:
    raise KeyError(f"'{location_field}' 컬럼이 JSON에 없습니다. 위 출력된 컬럼명을 확인하세요.")

# 5. datetime 컬럼 생성 및 소요시간 계산
def parse_dt(row, prefix):
    date_str = f"{row[f'{prefix}_년']:04d}-{row[f'{prefix}_월']:02d}-{row[f'{prefix}_일']:02d}"
    time_str = row[f"{prefix}_시간"]
    return datetime.fromisoformat(f"{date_str}T{time_str}")

df_fire["dt_start"] = df_fire.apply(lambda r: parse_dt(r, "발생일시"), axis=1)
df_fire["dt_end"]   = df_fire.apply(lambda r: parse_dt(r, "진화종료시간"), axis=1)
df_fire["duration_min"] = (df_fire["dt_end"] - df_fire["dt_start"]).dt.total_seconds() / 60.0
df_fire["area_ha"] = pd.to_numeric(df_fire["피해면적_합계"], errors="coerce")

# 6. 법정 경계 로드 및 중심점 계산
gdf_region = gpd.read_file(legal_geojson_path)
# 실제 “시·군·구” 필드명을 확인하고 아래 name_field 변수에 반영하세요.
name_field = "SIGUNGU_NM"  # 또는 'ADM_NM' 등
if name_field not in gdf_region.columns:
    raise KeyError(f"'{name_field}' 컬럼이 경계 GeoJSON에 없습니다. 컬럼명을 확인하세요.")

gdf_region["centroid"] = gdf_region.geometry.centroid
gdf_region["centroid_lon"] = gdf_region.centroid.x
gdf_region["centroid_lat"] = gdf_region.centroid.y

# 7. 산불 기록과 경계 매핑
df_fire = df_fire.rename(columns={location_field: name_field})
df_merged = pd.merge(
    df_fire,
    gdf_region[[name_field, "centroid_lon", "centroid_lat"]],
    on=name_field,
    how="left"
)

# 8. GeoDataFrame 생성
geometry = [Point(xy) for xy in zip(df_merged.centroid_lon, df_merged.centroid_lat)]
gdf_fire = gpd.GeoDataFrame(df_merged, geometry=geometry, crs=gdf_region.crs)

# 9. 필요한 컬럼만 선택 후 저장
keep_cols = [
    name_field,
    "dt_start", "dt_end", "duration_min",
    "area_ha",
    "centroid_lon", "centroid_lat",
    "geometry"
]
gdf_fire[keep_cols].to_file(output_geojson_path, driver="GeoJSON", encoding="utf-8")

print(f"✅ 산불발생 GeoJSON 저장 완료: {output_geojson_path}")
