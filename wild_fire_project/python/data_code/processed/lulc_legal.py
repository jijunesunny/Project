#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
자동으로 공간 결합을 통해 강원 18개 시·군·구 LULC 타일을 추출·병합하는 스크립트
- 경계 GeoJSON: data/fetch/legal_codes/gangwon_legal_codes.geojson
- LULC 타일 폴더: data/raw/vegetation/lulc/*.shp
- 출력: data/processed/vegetation/lulc_gangwon18.shp, .geojson
"""

import os
import glob
import pandas as pd
import geopandas as gpd

# 1) 파일 경로 설정
boundary_path = r'C:\workspace\project\wild_fire_project\data\fetch\legal_codes\gangwon_legal_codes.geojson'
tiles_dir     = r'C:\workspace\project\wild_fire_project\data\raw\vegetation\lulc'
out_dir       = r'C:\workspace\project\wild_fire_project\data\processed\vegetation'

# 2) 강원 18개 시·군·구 명칭 리스트
gangwon18 = [
    '춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시',
    '홍천군','횡성군','영월군','평창군','정선군','철원군',
    '화천군','양구군','인제군','고성군','양양군'
]

# 3) 경계 GeoJSON 로드 및 필터
admin = gpd.read_file(boundary_path)
# 컬럼명은 실제 파일에 따라 바꿔주세요. 예: 'ADM_NM' 또는 'SIGUNGU_NM'
name_field = 'ADM_NM'
admin = admin[admin[name_field].isin(gangwon18)].to_crs(epsg=5179)

# 4) 모든 LULC 타일 읽어서 하나의 GeoDataFrame으로 결합
tile_files = glob.glob(os.path.join(tiles_dir, '*.shp'))
tile_gdfs = []
for shp in tile_files:
    df = gpd.read_file(shp)
    df['tile_code'] = os.path.splitext(os.path.basename(shp))[0]
    tile_gdfs.append(df)
tiles = gpd.GeoDataFrame(pd.concat(tile_gdfs, ignore_index=True),
                         crs=tiles[0].crs if tile_gdfs else None)

# 5) 공간 결합: 타일이 경계와 교차하는 피처만 남김
joined = gpd.sjoin(tiles, admin[[name_field,'geometry']],
                   how='inner', predicate='intersects')

# 6) 필터된 타일코드별로 다시 파일 읽어 병합
selected_codes = joined['tile_code'].unique().tolist()
print(f"추출할 타일코드 수: {len(selected_codes)}")

filtered_gdfs = []
for code in selected_codes:
    path = os.path.join(tiles_dir, f"{code}.shp")
    if os.path.exists(path):
        filtered_gdfs.append(gpd.read_file(path))
    else:
        print("⚠️ 파일 없음:", path)

if not filtered_gdfs:
    raise RuntimeError("추출 대상이 없습니다. 경로와 경계 컬럼명을 확인하세요.")

merged = gpd.GeoDataFrame(pd.concat(filtered_gdfs, ignore_index=True),
                          crs=filtered_gdfs[0].crs)

# 7) 결과 저장
os.makedirs(out_dir, exist_ok=True)
out_shp     = os.path.join(out_dir, 'lulc_gangwon18.shp')
out_geojson = os.path.join(out_dir, 'lulc_gangwon18.geojson')

merged.to_file(out_shp, driver='ESRI Shapefile')
print("✅ Shapefile 저장 완료:", out_shp)

merged.to_file(out_geojson, driver='GeoJSON')
print("✅ GeoJSON 저장 완료:", out_geojson)
