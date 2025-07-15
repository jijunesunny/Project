import pandas as pd
import re
import os
#기상청예보 
#위도,경도,관측일자,일평균자료,습도,기온,풍속,이슬점온도,최고,최저기온,일조시간등)
# CSV 파일>>xlsx파일로 전체합치기(202001-202412까지 38개 파일)

# 년도별 존재하는 월 리스트 딕셔너리로 정의
valid_months = {
    2020: list(range(1, 12)),     # 1~11월
    2021: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12],
    2022: [1, 4, 5, 6, 7, 8, 10, 11, 12],
    2023: [1, 2],
    2024: [5, 6, 10, 11, 12]
}

# 자동으로 csv 파일 경로 리스트 생성 (/mnt/data/ 경로 기준)
csv_files = []
for year, months in valid_months.items():
    for month in months:
        month_str = f"{month:02d}"
        file_name = f'D:/prepareforproject/datacollection/weather_observation/관측소별기상관측정보_{year}년_{month_str}월.csv'
        csv_files.append(file_name)
# 엑셀 저장 경로
excel_output_path = r'D:/prepareforproject/datacollection/weather_observation/weather_observation202001_202412.xlsx'

# 저장 폴더가 없으면 생성
output_dir = os.path.dirname(excel_output_path)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with pd.ExcelWriter(excel_output_path, engine='xlsxwriter') as writer:
    for file_path in csv_files:
        match = re.search(r'(\d{4}년_\d{2}월)', file_path)
        sheet_name = match.group(1) if match else 'sheet1'

        try:
            df = pd.read_csv(file_path, encoding='utf-8')  # 필요 시 euc-kr 등으로 변경
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f'{sheet_name} 저장 완료')
        except FileNotFoundError:
            print(f'파일 없음: {file_path} - 건너뜀')
        except Exception as e:
            print(f'파일 처리 중 오류: {file_path}, 오류: {e}')

print(f'엑셀 파일 저장 완료: {excel_output_path}')
