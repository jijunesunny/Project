import requests
import xml.etree.ElementTree as ET
import os
#수자원 spi
BASE_URL = "http://apis.data.go.kr/B500001/drghtIdexSpiAnals/analsInfoList"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

GANGWON_CODES_FILE = "../wild_fire_project/data/fetch/legal_codes/gangwon_legal_codes.xml"

DATA_DIR = "../wild_fire_project/data/fetch/climate"
os.makedirs(DATA_DIR, exist_ok=True)

def parse_region_codes_from_xml(xml_file_path):
    tree = ET.parse(xml_file_path)
    root = tree.getroot()
    region_codes = []
    for row in root.findall(".//row"):
        region_cd = row.find("region_cd")
        if region_cd is not None and region_cd.text:
            region_codes.append(region_cd.text)
    return region_codes

def fetch_spi_data_for_region_xml(region_cd):
    params = {
        "ServiceKey": SERVICE_KEY,
        "pageNo": "1",
        "numOfRows": "10",
        "hjdCd": region_cd,
        "stDt": "20190501",
        "edDt": "20241231",
        "_type": "xml"
    }
    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        file_path = os.path.join(DATA_DIR, f"spi_drought_index_{region_cd}.xml")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"지역 코드 {region_cd} 데이터 XML 저장 완료: {file_path}")
    else:
        print(f"API 호출 실패 (지역 코드 {region_cd}), 상태 코드: {response.status_code}")
        print(response.text)

def main():
    if not os.path.exists(GANGWON_CODES_FILE):
        print(f"행정동 코드 파일이 없습니다: {GANGWON_CODES_FILE}")
        return
    region_codes = parse_region_codes_from_xml(GANGWON_CODES_FILE)
    if not region_codes:
        print("행정동 코드가 없습니다.")
        return
    print(f"총 {len(region_codes)}개 행정동 코드 중 첫 3개에 대해 XML 호출 및 저장합니다.")
    for region_cd in region_codes[:3]:
        fetch_spi_data_for_region_xml(region_cd)

if __name__ == "__main__":
    main()
