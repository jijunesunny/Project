import requests
import os
import xml.etree.ElementTree as ET
#강원시군구음면리단위의 행정구역 다 있지만 위경도가 없음 
#locatadd_nm지역 주소명 (법정동명)/region_cd 행정구역 통합코드
#행정동별 위치 기반 분석, 데이터 매핑 등에 활용
BASE_URL = "http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

DATA_DIR = "../wild_fire_project/data/fetch/legal_codes"
os.makedirs(DATA_DIR, exist_ok=True)
FILE_NAME = "gangwon_legal_codes.xml"

params = {
    "ServiceKey": SERVICE_KEY,
    "pageNo": 1,
    "numOfRows": 1000,
    "type": "xml",
    "locatadd_nm": "강원"  # 강원 지역 필터링
}

response = requests.get(BASE_URL, params=params)

if response.status_code == 200:
    xml_content = response.text

    # 원본 XML 파일로 저장
    save_path = os.path.join(DATA_DIR, FILE_NAME)
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(xml_content)

    print(f"강원도 법정동 XML 데이터 '{FILE_NAME}' 파일로 저장 완료")

    # XML 파싱 예시 (필요 시)
    root = ET.fromstring(xml_content)
    rows = root.findall(".//fetch")
    print(f"총 {len(rows)}개 강원도 법정동 데이터 수신")

    # 첫 5개 행 출력
    for i, row in enumerate(rows[:5]):
        print(f"\nrow {i+1}:")
        for child in row:
            print(f"  {child.tag}: {child.text}")

else:
    print(f"API 요청 실패, 상태코드: {response.status_code}")
    print(response.text)
