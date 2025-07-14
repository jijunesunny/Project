import requests
import os
import xml.etree.ElementTree as ET
#locatadd_nm지역 주소명 (법정동명)/region_cd 행정구역 통합코드
#행정동별 위치 기반 분석, 데이터 매핑 등에 활용
BASE_URL = "http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

DATA_DIR = "../wild_fire_project/data/raw/legal_codes"
os.makedirs(DATA_DIR, exist_ok=True)
FILE_NAME = "all_legal_codes_raw.xml"

params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 1000,
    "type": "xml"
}

response = requests.get(BASE_URL, params=params)

if response.status_code == 200:
    xml_content = response.text

    # 원본 XML 파일로 저장
    save_path = os.path.join(DATA_DIR, FILE_NAME)
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(xml_content)

    print(f"원본 XML 데이터 '{FILE_NAME}' 파일로 저장 완료")

    # XML 파싱 예시 (필요 시)
    root = ET.fromstring(xml_content)
    # 예: 첫 3개 row 데이터 출력
    rows = root.findall(".//row")
    for i, row in enumerate(rows[:3]):
        print(f"row {i+1}:")
        for child in row:
            print(f"  {child.tag}: {child.text}")

else:
    print(f"API 요청 실패, 상태코드: {response.status_code}")
    print(response.text)
