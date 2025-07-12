import json
import os
import pandas as pd

#최종 강원이전산불데이터
#2023-2024 전국산불데이터에서 강원지역만 추출
# 원시 JSON 파일 경로 (data/raw 폴더 기준)
raw_files = [
    '.wild_fire_project/data/raw/sanbul_stats_20231020.json',
    '.wild_fire_project/data/raw/sanbul_stats_20241016.json'
]

# 전처리 데이터 저장 폴더 및 파일명
output_dir = '.wild_fire_project/data/processed'
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, 'gangwon_sanbul_combined_2023_2024.json')

def load_and_filter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    records = data.get('data')
    if records is None:
        print(f" 'data' 키가 없어 {file_path} 처리 불가")
        return pd.DataFrame()
    df = pd.DataFrame(records)
    return df[df['발생장소_관서'] == '강원']

# 파일별로 불러와서 필터링한 데이터프레임 리스트
filtered_dfs = [load_and_filter(f) for f in raw_files]

# 빈 데이터프레임 제거 후 합치기
filtered_dfs = [df for df in filtered_dfs if not df.empty]
combined_df = pd.concat(filtered_dfs, ignore_index=True)

# 합친 데이터 JSON으로 저장
combined_records = combined_df.to_dict(orient='records')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump({'data': combined_records}, f, ensure_ascii=False, indent=2)

print(f" 강원도 산불 데이터 병합 저장 완료: {output_file}")
print(f"총 강원도 데이터 개수: {len(combined_df)}")
