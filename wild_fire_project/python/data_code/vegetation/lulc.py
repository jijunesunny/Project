#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract and merge 25K LULC tiles for all 18 시·군·구 in Gangwon Province.
Adjust `region_tiles` with the actual 도엽번호 lists per 시·군·구 from your reference table.
"""

import os
import glob
import pandas as pd
import geopandas as gpd

# ─── ① 시·군·구별 25K 도엽번호 매핑 ────────────────────────────────────────────
region_tiles = {
    '춘천시': ['346021','346022','346023','346024'],
    '원주시': ['346025','346026','346027','346028'],
    '강릉시': ['346029','346030','346031','346032'],
    '동해시': ['346033','346034'],
    '태백시': ['346035','346036'],
    '속초시': ['346037','346038'],
    '삼척시': ['346039','346040','346041'],
    '홍천군': ['346042','346043','346044','346045'],
    '횡성군': ['346046','346047','346048'],
    '영월군': ['346049','346050'],
    '평창군': ['346051','346052','346053','346054'],
    '정선군': ['346055','346056','346057'],
    '철원군': ['346058','346059'],
    '화천군': ['346060','346061'],
    '양구군': ['346062','346063'],
    '인제군': ['346064','346065','346066'],
    '고성군': ['346067','346068'],
    '양양군': ['346069','346070']
}

# ─── ② LULC 타일이 저장된 폴더 경로 ───────────────────────────────────────────
shp_dir = r'C:\workspace\project\wild_fire_project\data\raw\vegetation\lulc'

# ─── ③ 실제 폴더 내 .shp 코드(파일명) 집합 생성 ─────────────────────────────────
available_codes = {
    os.path.splitext(os.path.basename(p))[0]
    for p in glob.glob(os.path.join(shp_dir, '*.shp'))
}

print(f"폴더에 있는 SHP 파일 수: {len(available_codes)}")

# ─── ④ region_tiles 중 실제 존재하는 도엽번호만 필터링 ─────────────────────────
filtered_tiles = {}
for city, codes in region_tiles.items():
    present = [c for c in codes if c in available_codes]
    filtered_tiles[city] = present
    missing = set(codes) - set(present)
    if missing:
        print(f"❗️ {city} 누락된 도엽번호:", sorted(missing))

# ─── ⑤ 추출 대상 SHP 파일 경로 리스트 만들기 ──────────────────────────────────
shp_paths = []
for codes in filtered_tiles.values():
    for code in codes:
        shp_paths.append(os.path.join(shp_dir, f"{code}.shp"))

print(f"▶ 최종 읽어들일 SHP 파일 수: {len(shp_paths)}")
if not shp_paths:
    raise RuntimeError("추출 대상 SHP 파일이 하나도 없습니다. region_tiles를 확인하세요.")

# ─── ⑥ 개별 파일 로드 후 하나의 GeoDataFrame으로 병합 ───────────────────────────
gdfs = []
for path in shp_paths:
    print("Loading:", os.path.basename(path))
    gdfs.append(gpd.read_file(path))

merged = gpd.GeoDataFrame(pd.concat(gdfs, ignore_index=True),
                          crs=gdfs[0].crs if hasattr(gdfs[0], 'crs') else None)
print("병합 후 전체 레코드 수:", len(merged))

# ─── ⑦ 결과 저장 ────────────────────────────────────────────────────────────
out_dir = r'C:\workspace\project\wild_fire_project\data\processed\vegetation'
os.makedirs(out_dir, exist_ok=True)

out_shp = os.path.join(out_dir, 'lulc_gangwon18.shp')
out_geojson = os.path.join(out_dir, 'lulc_gangwon18.geojson')

merged.to_file(out_shp, driver='ESRI Shapefile')
print("✅ Shapefile 저장 완료:", out_shp)

merged.to_file(out_geojson, driver='GeoJSON')
print("✅ GeoJSON 저장 완료:", out_geojson)
