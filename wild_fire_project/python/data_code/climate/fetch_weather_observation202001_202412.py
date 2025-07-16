import pandas as pd
#위도,경도,관측일자,일평균자료,습도,기온,풍속,이슬점온도,최고,최저기온,일조시간등)
# CSV 파일>>xlsx파일로 전체합치기(강원도만 202001-202412까지 38개 파일)
#\data_code\climate\fetch_weather_observation202001_202412.py
#엑셀로 저장
# 업로드된 파일 경로
input_path = r'D:/prepareforproject/datacollection/weather_observation/weather_observation202001_202412.xlsx'

# 강원 지역 필터링 기준 컬럼명 - 
addr_column = 'addr'  #  주소 컬럼명

# 결과 저장 경로
excel_output_path = r'D:/prepareforproject/datacollection/weather_observation/weather_observation202001_202412_gangwon_only.xlsx'
# 엑셀 파일 내 모든 시트 읽기
xls = pd.ExcelFile(input_path)
sheet_names = xls.sheet_names

# 강원 데이터 모을 리스트
df_gangwon_list = []

for sheet in sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet)
    if addr_column not in df.columns:
        print(f"시트 '{sheet}'에 '{addr_column}' 컬럼이 없습니다. 다음 시트로 넘어갑니다.")
        continue
 
    # 강원 지역 필터링 (예: '강원'이라는 문자열 포함)
    df_gangwon = df[df[addr_column].str.contains('강원', na=False)]
    if not df_gangwon.empty:
        # 시트명 같이 기록해두기 (선택 사항)
        df_gangwon['원본시트'] = sheet
        df_gangwon_list.append(df_gangwon)
        print(f"{sheet} 시트에서 강원 데이터 {len(df_gangwon)}건 추출됨.")
    else:
        print(f"{sheet} 시트에 강원 데이터 없음.")

# 강원 데이터 모두 합치기
if df_gangwon_list:
    df_gangwon_all = pd.concat(df_gangwon_list, ignore_index=True)
    # 새 엑셀로 저장
    df_gangwon_all.to_excel(excel_output_path, index=False)
    print(f"강원 지역 데이터만 '{excel_output_path}' 파일로 저장 완료")
else:
    print("강원 지역 데이터가 한 건도 없습니다.")
