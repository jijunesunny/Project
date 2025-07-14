import geopandas as gpd

#공간 해상도: 1:5,000 (상세한 공간정보 제공)
#파일 형태: Shapefile(.shp)
#용도: 산림 분포 현황 파악, 산림자원량 측정, 산불 위험 지역 분석, 산림 복원력 예측
#속성 정보: 임종, 임상, 수종, 경급, 영급, 수관밀도 등 산림 관련 다양한 필드 포함
#공간 해상도: 1:5,000 (상세한 공간정보 제공)
# 다운로드한 shp 파일 경로
shp_path = "path/to/임상도.shp"

# 데이터 읽기
gdf = gpd.read_file(shp_path)

# 데이터 정보 확인
print(gdf.columns)      # 컬럼(속성명) 확인
print(gdf.head())       # 상위 데이터 미리보기

# 예: 임종별 면적 통계
print(gdf['임종컬럼명'].value_counts())

# 시각화 예
gdf.plot(column='임종컬럼명', legend=True)
