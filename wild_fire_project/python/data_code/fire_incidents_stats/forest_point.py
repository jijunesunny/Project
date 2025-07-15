import requests
import xml.etree.ElementTree as ET
# 산불위험지수(시도) 조회 API URL >>쓸모없는듯
# 공공데이터포털에서 받은 URL 인코딩된 인증키
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD%2BrKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA%3D%3D"

# 산불위험지수(시도) 조회 API URL
url = "http://apis.data.go.kr/1400377/forestPoint/forestPointListSidoSearch"

# 요청 파라미터 설정
params = {
    "ServiceKey": SERVICE_KEY,
    "numOfRows": "10",        # 한 페이지 결과 수
    "pageNo": "1",            # 페이지 번호
    "_type": "xml",           # 응답 타입 (xml or json)
    "localAreas": "11,26",    # 시도 코드 (서울=11, 부산=26 등)
    "excludeForecast": "0"    # 예보정보 포함 여부 (0: 포함, 1: 제외)
}

# API 요청
response = requests.get(url, params=params)

if response.status_code == 200:
    xml_data = response.text
    # 받은 XML 전체 출력 (필요시 주석 처리 가능)
    # print(xml_data)

    # XML 파싱
    root = ET.fromstring(xml_data)

    # header 부분 확인
    header = root.find('header')
    if header is not None:
        result_code = header.findtext('resultCode')
        result_msg = header.findtext('resultMsg')
        print(f"응답코드: {result_code}, 메시지: {result_msg}")
    else:
        print("header 태그가 없습니다.")
        exit()

    if result_code != "00":
        print(f"API 호출 실패: {result_msg}")
        exit()

    # body > items > item 리스트 접근
    body = root.find('body')
    if body is None:
        print("body 태그가 없습니다.")
        exit()

    items = body.find('items')
    if items is None:
        print("items 태그가 없습니다.")
        exit()

    # 데이터 출력
    for item in items.findall('item'):
        analdate = item.findtext('analdate', default='-')
        doname = item.findtext('doname', default='-')
        maxi = item.findtext('maxi', default='-')
        meanavg = item.findtext('meanavg', default='-')
        mini = item.findtext('mini', default='-')

        print(f"기준일자: {analdate}, 지역명: {doname}, 최대: {maxi}, 평균: {meanavg}, 최소: {mini}")

else:
    print(f"API 요청 실패, 상태코드: {response.status_code}")
