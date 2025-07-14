import os
import json
import xml.etree.ElementTree as ET
#locatadd_nm지역 주소명 (법정동명)/region_cd 행정구역 통합코드
#행정동별 위치 기반 분석, 데이터 매핑 등에 활용
XML_FILE_PATH = "../wild_fire_project/data/fetch/legal_codes/gangwon_legal_codes.xml"
JSON_FILE_PATH = "../wild_fire_project/data/fetch/legal_codes/gangwon_legal_codes.json"

def xml_to_json(xml_path, json_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    data = []
    # row 태그 찾아서 각 요소를 딕셔너리로 변환
    for row in root.findall(".//row"):
        item = {child.tag: child.text for child in row}
        data.append(item)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"XML 데이터를 JSON으로 변환 완료: {json_path}, 총 {len(data)}건")

if __name__ == "__main__":
    if not os.path.exists(XML_FILE_PATH):
        print(f"XML 파일이 존재하지 않습니다: {XML_FILE_PATH}")
    else:
        xml_to_json(XML_FILE_PATH, JSON_FILE_PATH)
