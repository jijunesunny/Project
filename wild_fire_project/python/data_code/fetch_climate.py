import requests  # requests 모듈 임포트

#1904.04.01-2020.04.01 (96지점)
#분,시간,일,월,연자료
#종관기상관측 기온, 강수, 기압, 습도, 풍향, 풍속, 일사, 일조, 적설, 구름, 시정, 지면 · 초상온도
def download_file(file_url, save_path):
    with open(save_path, 'wb') as f: # 저장할 파일을 바이너리 쓰기 모드로 열기
        response = requests.get(file_url) # 파일 URL에 GET 요청 보내기
        f.write(response.content) # 응답의 내용을 파일에 쓰기

# URL과 저장 경로 변수를 지정합니다.
url = 'https://apihub.kma.go.kr/api/file?authKey=YOUR_AUTH_KEY'
save_file_path = 'output_file.zip'

# 파일 다운로드 함수를 호출합니다.
download_file(url, save_file_path)