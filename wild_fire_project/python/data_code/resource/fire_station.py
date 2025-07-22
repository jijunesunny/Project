import pandas as pd
import os
import json
#강원소방서 동적데이터
#엑셀은 깨져서 가질수가 없음...csv온전함
# null값인 부분 제외 필요한 것만 추출함

# ─── ① 우리가 실제로 사용할 컬럼명 리스트 ─────────────────────────────────
keep_cols = [
    '격자ID',
    '격자X축좌표',
    '격자Y축좌표',
    '시간',
    '생성일자',
    '법정동명',
    '법정동코드',
    '유동인구지수',
    '노인유동인구지수'
]

# ─── ② 원본 CSV 경로 ─────────────────────────────────────────────────────────
csv_path = r'data/resource/gangwon_fire_station_20211231.csv'

# ─── ③ CSV 읽기 (깨진 헤더 건너뛰고, 컬럼명 지정) ─────────────────────────────
df = pd.read_csv(
    csv_path,
    sep=',',              # 실제 구분자에 맞게 조정 (',' 또는 '\t' 등)
    encoding='latin1',     # 필요 시 'cp949', 'utf-8-sig' 등으로 변경
    engine='python',
    skiprows=1,           # 첫 줄(깨진 헤더) 건너뛰기
    header=None,          # 파일에 올바른 헤더가 없으므로 None
    names=keep_cols       # 우리가 지정한 컬럼명
)

# ─── ④ 필요한 컬럼만 남기기 ───────────────────────────────────────────────────
df = df[keep_cols]

# ─── ⑤ JSON 으로 내보낼 경로 준비 ───────────────────────────────────────────
out_dir   = r'data/processed/fire_incidents_stats'
os.makedirs(out_dir, exist_ok=True)
json_path = os.path.join(out_dir, 'fire_station.json')

# ─── ⑥ DataFrame → JSON 저장 ────────────────────────────────────────────────
records = df.to_dict(orient='records')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

# ─── ⑦ 완료 메시지 ───────────────────────────────────────────────────────────
print(" 전처리 완료, JSON 저장:", json_path)