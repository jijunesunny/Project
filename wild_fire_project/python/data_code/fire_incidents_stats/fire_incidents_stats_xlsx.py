import json
import pandas as pd

# 1) JSON 불러오기
with open('data/fetch/fire_incidents_stats/gangwon_sanbul_combined_2023_2024.json', 'r', encoding='utf-8') as f:
    js = json.load(f)
df = pd.DataFrame(js['data'])

# 2) 엑셀로 저장 (인코딩 걱정 불필요)
output_path = 'data/processed/fire_incidents_stats/sanbul_raw.xlsx'
df.to_excel(output_path, index=False)

print("✅ 엑셀로 저장 완료:", output_path)
