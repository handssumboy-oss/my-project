# cards.html에 쓰인 글자만 담은 서체 서브셋을 Google Fonts에서 받아 fonts/와 fonts.css를 만든다.
# 문구를 바꾼 뒤에는 이 스크립트를 다시 실행하고 render.js로 이미지를 다시 뽑는다.
import re, urllib.parse, subprocess, html
src = open('cards.html', encoding='utf-8').read()
txt = re.sub(r'<[^>]+>', '', src.split('<body>')[1])
chars = ''.join(sorted(set(html.unescape(txt)) - set('\n\r\t'))) + '0123456789,.·?!()「」×※ABCDEFGHIJKLMNOPQRSTUVWXYZ'
q = urllib.parse.quote(chars)
ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
out = []
for fam, wts in [('Noto+Sans+KR', [400, 500, 700, 900])]:
    for w in wts:
        spec = f'{fam}:wght@{w}' if fam != 'Black+Han+Sans' else fam
        css = subprocess.run(['curl', '-sS', '-A', ua, f'https://fonts.googleapis.com/css2?family={spec}&text={q}'],
                             capture_output=True, text=True, check=True).stdout
        url = re.search(r'url\((https://[^)]+)\)', css).group(1)
        fn = f"fonts/{fam.replace('+', '')}-{w}.woff2"
        subprocess.run(['curl', '-sS', '-A', ua, '-o', fn, url], check=True)
        out.append(f"@font-face{{font-family:'{fam.replace('+', ' ')}';font-weight:{w};font-style:normal;"
                   f"font-display:block;src:url({fn}) format('woff2');}}")
open('fonts.css', 'w').write('\n'.join(out) + '\n')
print(f'{len(chars)} chars subset')
