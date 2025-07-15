import requests
import json
#풍력 수자원
# API 기본 정보 https://www.data.go.kr/iim/api/selectAPIAcountView.do
BASE_URL = "https://apis.data.go.kr/B551184/openapi/service/WindPwService/getWindPwHrInfo"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="


# 호출 파라미터 설정 (소수점 셋째 자리까지)
params = {
    "serviceKey": SERVICE_KEY,
    "pageNo": "1",
    "numOfRows": "10",
    "lat": "37.750",    # 소수점 셋째 자리까지 맞춤
    "lon": "128.900",   # 소수점 셋째 자리까지 맞춤
    "alti": "100",      # 고도(m)
    "azi": "90",        # 방위각(도)
    "type": "json"      # JSON 응답 요청
}

def fetch_wind_data():
    response = requests.get(BASE_URL, params=params, verify=False)
    if response.status_code == 200:
        data = response.json()
        print("전체 JSON 응답 구조:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"API 호출 실패, 상태 코드: {response.status_code}")

if __name__ == "__main__":
    fetch_wind_data()

