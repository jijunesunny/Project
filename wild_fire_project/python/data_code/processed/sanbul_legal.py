#이전산불+위경도 geojson만들기
#발생시각 (발생일시 + 발생일시_시간)
#진화 완료 시각 (진화종료시간 + 진화종료시간_시간)
#소요 시간(분 단위)
#피해 면적 (피해면적_합계)
#해당 행정구역의 중심점 위경도

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json, os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime

# 파일 경로
boundary_path      = "data/fetch/legal_codes/gangwon_legal_codes.geojson"
fire_json_path     = "data/fetch/fire_incidents_stats/gangwon_sanbul_combined_2023_2024.json"
output_geojson_dir = "data/processed/fire_incidents_stats"
output_geojson     = os.path.join(output_geojson_dir, "sanbul_legal.geojson")

# 1) 경계 GeoJSON 로드
gdf_region = gpd.read_file(boundary_path)

# 2) CRS 재투영 → centroid 계산 → WGS84로 복귀
gdf_region = gdf_region.to_crs(epsg=5179)
gdf_region["centroid"] = gdf_region.geometry.centroid
gdf_region = gdf_region.to_crs(epsg=4326)  # EPSG:4326 = WGS84
gdf_region["centroid_lon"] = gdf_region.centroid.x
gdf_region["centroid_lat"] = gdf_region.centroid.y

# 3) 시·군·구명 추출 및 접미사 제거
#    ex: "강원특별자치도 삼척시 하장면" → split()[1] = "삼척시" → strip("시군") → "삼척"
gdf_region["SIGUNGU_NM"] = (
    gdf_region["name"]
      .str.split()
      .str[1]
      .str.rstrip("시군")
)

# 4) 산불 JSON 로드
with open(fire_json_path, "r", encoding="utf-8") as f:
    js = json.load(f)
df = pd.DataFrame(js["data"])

# 5) datetime 및 소요시간 계산
def mk_dt(r, pfx):
    date = f"{r[f'{pfx}_년']:04d}-{r[f'{pfx}_월']:02d}-{r[f'{pfx}_일']:02d}"
    return datetime.fromisoformat(f"{date}T{r[f'{pfx}_시간']}")
df["dt_start"]     = df.apply(lambda r: mk_dt(r, "발생일시"), axis=1)
df["dt_end"]       = df.apply(lambda r: mk_dt(r, "진화종료시간"), axis=1)
df["duration_min"] = (df["dt_end"] - df["dt_start"]).dt.total_seconds() / 60.0
df["area_ha"]      = pd.to_numeric(df["피해면적_합계"], errors="coerce")

# 6) JSON의 시군구명도 접미사 제거
df["SIGUNGU_NM"] = df["발생장소_시군구"].str.rstrip("시군")

# 7) 병합
df_merged = pd.merge(
    df,
    gdf_region[["SIGUNGU_NM","centroid_lon","centroid_lat"]],
    on="SIGUNGU_NM",
    how="left"
)

# 8) Point GeoDataFrame 생성
geometry = [Point(xy) for xy in zip(df_merged.centroid_lon, df_merged.centroid_lat)]
gdf_fire = gpd.GeoDataFrame(df_merged, geometry=geometry, crs="EPSG:4326")

# 9) 저장
os.makedirs(output_geojson_dir, exist_ok=True)
keep = [
    "SIGUNGU_NM","dt_start","dt_end","duration_min",
    "area_ha","centroid_lon","centroid_lat","geometry"
]
gdf_fire[keep].to_file(output_geojson, driver="GeoJSON", encoding="utf-8")

print("✅ 최종 산불 GeoJSON 저장 완료:", output_geojson)


