import requests   # API 호출을 위한 라이브러리
import os        # 폴더 및 파일 관리를 위한 라이브러리
import json      # JSON 데이터 읽고 쓰기 위한 라이브러리

# 1. API 호출에 필요한 기본 변수 설정
BASE_URL = "https://api.odcloud.kr/api"
ENDPOINT = "/15121380/v1/uddi:4725e545-b4b6-4f85-b325-a281a4f8188c"  # 2023.10.20 데이터 API 주소 (테스트인증키라10건)
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 2. 데이터를 저장할 폴더와 파일명 지정
DATA_DIR = "./data/raw/fetch"                # 원시 데이터를 저장할 폴더 경로
FILE_NAME = "sanbul_stats_20231020.json"    # 저장할 JSON 파일명

# 3. 저장할 폴더가 없으면 새로 생성
os.makedirs(DATA_DIR, exist_ok=True)

# 4. API 요청 파라미터 설정
params = {
    "page": 1,          # 1페이지 데이터 요청
    "perPage": 1000,    # 최대 1000건 요청 (API 정책에 따라 변경 가능)
    "serviceKey": SERVICE_KEY,  # 발급받은 인증키
    "_type": "json"     # JSON 형식으로 결과 받기
}

def fetch_and_save_data():
    # 5. API 요청 URL 완성
    url = BASE_URL + ENDPOINT

    # 6. API GET 요청
    response = requests.get(url, params=params)

    # 7. 응답 상태 코드가 200(성공)인지 체크
    if response.status_code == 200:
        data = response.json()  # JSON 응답을 파이썬 딕셔너리로 변환

        # 8. 받은 데이터를 JSON 파일로 저장
        with open(os.path.join(DATA_DIR, FILE_NAME), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f" 데이터 저장 완료: {os.path.join(DATA_DIR, FILE_NAME)}")

        # 9. 저장된 데이터 일부를 출력해서 확인
        # API마다 실제 데이터 위치가 다르니, 구조 확인 후 수정 필요
        # 아래는 보통 'data'라는 키에 리스트가 담긴 경우 예시
        if "data" in data:
            print("데이터 일부 미리보기:")
            for i, item in enumerate(data["data"][:3]):
                print(f"{i+1}. {item}")
        else:
            print(" 'data' 키가 없어 데이터 미리보기가 어렵습니다.")
    else:
        print(f" API 호출 실패: 상태 코드 {response.status_code}")

# 10. 이 파일을 직접 실행할 때만 함수 실행
if __name__ == "__main__":
    fetch_and_save_data()
