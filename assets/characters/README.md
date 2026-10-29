# 공식 자봉이 이미지

공식 PNG/WebP 파일을 이 폴더에 넣고 `src/config.js`의 `CHARACTER_PATH`를 파일명으로 지정합니다.
예: `export const CHARACTER_PATH = 'jabongi.png';`

원본은 편집하지 않으며 CSS `object-fit: contain`과 원본 종횡비로 표시합니다.
현재 공식 이미지가 없는 경우에만 임시 기본 도형을 표시합니다. 임시 도형은 자봉이의 공식 디자인이 아닙니다.
투명 배경 PNG/WebP를 권장합니다. 이미지 저작권 및 사용 권한은 원 권리자에게 있습니다.

## 업로드된 파일

GitHub main 커밋 `22a877f`에서 받은 PNG 원본 12개를 `jabongi-01.png`~`jabongi-12.png`로 복사했습니다. 파일 바이트는 변경하지 않았습니다. `sources.json`에서 원본 파일명 대응을 확인할 수 있습니다. 현재 게임에는 `jabongi-10.png`의 점프 포즈를 사용합니다. 흰 배경을 포함한 원본 전체를 잘림 없이 표시합니다.
