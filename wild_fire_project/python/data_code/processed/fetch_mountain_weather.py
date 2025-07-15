import requests
import json
import os
from datetime import datetime, timedelta
#산악기상정보_지역코드_지점번호_관측시간_ 강원지역추출
#2011년부터 2024년까지 매년 6월 30일 18시, 
# API 기본 정보 (본인의 인증키 URL 인코딩 상태로 넣으세요)
BASE_URL = "http://apis.data.go.kr/1400377/mtweather/mountListSearch"
SERVICE_KEY = "VWe912NZGdkAUk7P2Z9DBQW7Ia3pRtHvdqOauFzx78YD+rKkBjstyoonaP4R9nb4esjHPSHrXVfRW4UQ9aFVhA=="

# 저장할 폴더 경로
SAVE_DIR = "../wild_fire_project/data/fetch/climate"
os.makedirs(SAVE_DIR, exist_ok=True)  # 폴더 없으면 생성

# 강원도 지역 코드 (워드문서 참고)
LOCAL_AREA_CODE = "10"

# 강원도 내  지점 번호 리스트 
OBS_IDS = [
    "2001",  # 춘천 연엽산
    "2009",  # 양구 봉화산
    "2011",  # 영월 두위봉
    "2013",  # 인제 대암산
    "2014",  # 인제 원대봉
    "2015",  # 정선 백석봉
    "2019",  # 평창 백석산
    "2020",  # 평창 중왕산
    "2021",  # 화천 두류산
    "2023",  # 영월 망경대산
    "2024",  # 영월 곰봉
]

# 2011년부터 2024년까지 매년 6월 30일 18시 (예시) 데이터 수집
# 필요하면 다른 날짜나 시간으로 수정 가능
START_YEAR = 2011
END_YEAR = 2024
OBS_TIME_FORMAT = "%Y%m%d%H%M"  # API 요청에 맞는 시간 포맷

def fetch_data(obsid: str, tm: str):
    """
특정지점(obsid)과 관측시간(tm)에 대해 API 호출 후 데이터를 반환합니다.
    """
    params = {
        "ServiceKey": SERVICE_KEY,
        "pageNo": 1,
        "numOfRows": 10,
        "_type": "json",
        "localArea": LOCAL_AREA_CODE,
        "obsid": obsid,
        "tm": tm
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data
    except Exception as e:
        print(f" API 호출 실패: 지점 {obsid}, 시간 {tm} / 에러: {e}")
        return None

def save_json(data, obsid: str, tm: str):
    """
    받은 데이터를 JSON 파일로 저장합니다.
    파일명은 산악기상_지역코드_지점번호_관측시간.json 형식입니다.
    """
    filename = f"mountain_weather_{LOCAL_AREA_CODE}_{obsid}_{tm}.json"
    filepath = os.path.join(SAVE_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f" 저장 완료: {filepath}")

def main():
    """
    2011년부터 2024년까지 매년 6월 30일 18시, 
    강원도 내 여러 지점의 산악기상정보를 수집하여 저장하는 메인 함수입니다.
    """
    for year in range(START_YEAR, END_YEAR + 1):
        # YYYYMMDDHHmm 형식으로 날짜 및 시간 생성
        tm = f"{year}06301800"

        for obsid in OBS_IDS:
            print(f" 데이터 수집 중: 지점 {obsid}, 시간 {tm}")            
#fetch_data() 함수>주어진 지점번호(obsid)와 시간(tm)으로 API 호출             
            data = fetch_data(obsid, tm)
            if data:
#save_json() 함수>  받은 JSON 데이터를 지정된 폴더에 파일로 저장             
                save_json(data, obsid, tm)
#main() 함수>2011~2024년 매년 6월 30일 18시 데이터를 반복 호출해 수집
#강원도 내 지정한 지점 리스트에 대해 모두 호출하고 저장
if __name__ == "__main__":
    main()
