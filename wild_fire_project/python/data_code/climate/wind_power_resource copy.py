import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context
import ssl
import json

BASE_URL = "https://apis.data.go.kr/B551184/openapi/service/WindPwService/getWindPwHrInfo"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

params = {
    "serviceKey": SERVICE_KEY,
    "pageNo": "1",
    "numOfRows": "10",
    "lat": "37.750",
    "lon": "128.900",
    "alti": "100",
    "azi": "90",
    "type": "json"
}

class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False, **pool_kwargs):
        # TLSv1.2 프로토콜 강제 적용
        ctx = create_urllib3_context(ssl.PROTOCOL_TLSv1_2)
        pool_kwargs['ssl_context'] = ctx
        return super().init_poolmanager(connections, maxsize, block, **pool_kwargs)

def fetch_wind_data():
    session = requests.Session()
    session.mount('https://', TLSAdapter())
    response = session.get(BASE_URL, params=params, verify=True)
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"API 호출 실패, 상태 코드: {response.status_code}")

if __name__ == "__main__":
    fetch_wind_data()
