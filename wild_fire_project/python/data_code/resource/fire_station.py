import pandas as pd
import json
import os
import sys
#18개 소방서 동적데이터

# 1) 원본 CSV 파일 경로 (실제 위치로 조정)
csv_path = r'D:\prepareforproject\datacollection\gangwon_fire_station_20211231.csv'  
# 2) 결과 JSON 파일 경로
out_dir  = os.path.join(os.pardir, os.pardir, os.pardir, 'processed', 'fire_incidents_stats')
out_path = os.path.join(out_dir, 'fire_station.json')
# 2) CSV 파일 존재 확인
if not os.path.exists(csv_path):
    print(f"❌ CSV 파일을 찾을 수 없습니다: {csv_path}")
    sys.exit(1)
print("✅ CSV 파일 존재 확인")

# 3) DataFrame 변수 미리 선언 (lint 에러 방지)
df = None

# 4) 읽기 시도할 인코딩 리스트
encodings_to_try = ['utf-8-sig', 'utf-16', 'cp949', 'latin1']
for enc in encodings_to_try:
    try:
        df = pd.read_csv(csv_path, encoding=enc)
        print(f"✅ '{enc}' 인코딩으로 CSV 로드 성공. 컬럼:", df.columns.tolist())
        break
    except Exception as e:
        print(f"⚠️ '{enc}' 인코딩 실패:", e)
else:
    print("❌ 모든 인코딩 시도 실패")
    sys.exit(1)

# 5) 필요한 컬럼만 선택 & 결측(null) 제거
keep_cols = [
    '생성일자',        # 날짜
    '법정동명',        # 이름
    '법정동코드',      # 코드
    '유동인구지수',    # 유동인구지수
    '격자ID',         # 격자 ID
    '격자X축좌',      # X 좌표
    '격자Y축좌',      # Y 좌표
    '노인유동인구지수',  # 노인유동인구지수
    '시간'                #시간
]
missing = [c for c in keep_cols if c not in df.columns]
if missing:
    print(" 다음 컬럼이 없습니다:", missing)
    sys.exit(1)
df = df[keep_cols].dropna(how='any')
print(f" 필터링 후 데이터프레임 크기: {df.shape}") 

# 3) 법정동코드 → 중심 위·경도 매핑 (18개 전역)
center_map = {
    '4211000000': {'lat': 37.8813, 'lng': 127.7290},  # 춘천시
    '4213000000': {'lat': 37.3410, 'lng': 127.9209},  # 원주시
    '4215000000': {'lat': 37.7519, 'lng': 128.8768},  # 강릉시
    '4216000000': {'lat': 37.5229, 'lng': 129.1140},  # 동해시
    '4217000000': {'lat': 37.1695, 'lng': 128.9861},  # 태백시
    '4218000000': {'lat': 38.2079, 'lng': 128.5911},  # 속초시
    '4219000000': {'lat': 37.4544, 'lng': 129.1664},  # 삼척시
    '4272000000': {'lat': 37.7012, 'lng': 127.8880},  # 홍천군
    '4273000000': {'lat': 37.5240, 'lng': 127.9874},  # 횡성군
    '4274000000': {'lat': 37.1740, 'lng': 128.4771},  # 영월군
    '4275000000': {'lat': 37.3704, 'lng': 128.3884},  # 평창군
    '4276000000': {'lat': 37.3608, 'lng': 128.6597},  # 정선군
    '4282000000': {'lat': 38.1675, 'lng': 127.3047},  # 철원군
    '4283000000': {'lat': 38.0667, 'lng': 127.7294},  # 화천군
    '4284000000': {'lat': 38.0670, 'lng': 127.9845},  # 양구군
    '4285000000': {'lat': 38.0667, 'lng': 128.2123},  # 인제군
    '4290000000': {'lat': 38.4305, 'lng': 128.4678},  # 고성군
    '4292000000': {'lat': 38.1170, 'lng': 128.6247},  # 양양군
}
def lookup_latlng(code):
    return center_map.get(code, (None, None))

df['lat'] = df['법정동코드'].map(lambda c: lookup_latlng(c)[0])
df['lng'] = df['법정동코드'].map(lambda c: lookup_latlng(c)[1])

# 6) 날짜별 time series 구조로 변환 (예: dict of lists)
grouped = df.groupby('생성일자').apply(lambda d: d.to_dict(orient='records'))
# 결과는 pandas Series이니 dict로 바꿔줍니다.
result = grouped.to_dict()
 
# 6) 날짜별 시계열 구조로 변환
result = {}
for _, row in df.iterrows():
    code = str(int(row['법정동코드']))
    if code not in center_map:
        continue
    if code not in result:
        result[code] = {
            'code': code,
            'name': row['법정동명'],
            'lat':  center_map[code]['lat'],
            'lng':  center_map[code]['lng'],
            'time_series': []
        }
#시계열에 추가
    result[code]['time_series'].append({
        'date':      row['생성일자'],
        'grid_id':   row['격자ID'],
        'x':         row['격자X축좌'],
        'y':         row['격자Y축좌'],
        'pop_index': row['유동인구지수'],
        'elder_pop': row['노인유동인구지수'],
        'time':      row['시간'],
    })
print(f" 시계열로 묶은 법정동 개수: {len(result)}")

# 7) 결과 디렉터리 없으면 생성
os.makedirs(out_dir, exist_ok=True)
# 8) JSON 저장
with open(out_path, 'w', encoding='utf-8') as f:
  json.dump(result, f, ensure_ascii=False, indent=2)
print(f" 저장 완료: {out_path}")
