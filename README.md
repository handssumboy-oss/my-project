# my-project

Claude Code 에이전트 팀으로 자원봉사 홍보 업무를 진행하는 작업 공간입니다.

## 포함된 설정

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | Claude Code 작업 규칙 (파일 삭제 금지, 수정 전 구조 확인, 한국어 보고) |
| `.claude/settings.json` | 에이전트 팀 기능 활성화 (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |
| `.claude/agents/` | 홍보팀 에이전트 10종 (아래 표 참고) |
| `strategy/` | 기관 리서치와 홍보 전략 문서 |

## 새 PC에서 사용하기

1. Claude Code 설치
   - Windows (PowerShell): `winget install Anthropic.ClaudeCode`
   - macOS: `curl -fsSL https://claude.ai/install.sh | bash`
2. 이 저장소 내려받기 (`git clone` 또는 GitHub에서 ZIP 다운로드)
3. 저장소 폴더에서 Claude Code 실행 후 로그인
   ```
   cd my-project
   claude
   ```
4. 처음 실행할 때 나오는 폴더 신뢰(trust) 질문을 승인

## 홍보팀 구성 (10명)

| 영역 | 에이전트 | 담당 | 결과물 |
|---|---|---|---|
| 기획 | `promo-strategist` | 캠페인 전략, 일정, 팀 조율 | `01_전략.md` |
| 기획 | `promo-analyst` | 통계 가공, KPI, 성과 보고 | `02_데이터.md` |
| 언론 | `promo-press` | 보도자료, Q&A, 기사 모니터링 | `03_보도.md` |
| 제작 | `promo-copywriter` | 슬로건, 헤드라인, 캡션 본문 | `04_카피.md` |
| 제작 | `promo-designer` | 카드뉴스, 인포그래픽, 디자인 가이드 | `05_디자인.md` |
| 제작 | `promo-photo` | 촬영 컷 리스트, 촬영 가이드, 사진 캡션 | `06_사진.md` |
| 제작 | `promo-video` | 릴스·쇼츠 기획, 대본, 콘티 | `07_영상.md` |
| 채널 | `promo-sns` | 채널별 게시물 최적화, 게시 캘린더, 댓글 응대 | `08_SNS.md` |
| 채널 | `promo-web` | 홈페이지 구성, 배너 문안, SEO, 웹 접근성 | `09_웹.md` |
| 품질 | `promo-reviewer` | 사실·표현·초상권·저작권 검수, 리스크 점검 | `10_검수.md` |

결과물은 캠페인별 폴더(`campaigns/<연월>_<캠페인명>/`)에 저장하고, 리더가 `00_최종안.md`로 종합한다.

## 작업별 편성 예시

한 번에 3~5명만 편성하는 것을 권장한다. 검수·리스크 담당은 항상 포함한다.

| 작업 | 편성 |
|---|---|
| 공모전·이벤트 참여 독려 | strategist, sns, designer, copywriter, reviewer |
| 기념일 보도 | press, analyst, photo, reviewer |
| 결산·홍보 영상 | video, photo, copywriter, reviewer |
| 홈페이지 캠페인 페이지 | web, designer, copywriter, reviewer |

## 홍보팀 부르기

Claude Code 입력창에 다음과 같이 입력합니다.

```text
promo-strategist, promo-sns, promo-designer, promo-copywriter, promo-reviewer 에이전트 유형으로 홍보 에이전트 팀을 만들어줘.
캠페인 폴더: campaigns/[연월]_[캠페인명]/
캠페인 주제: [주제]
타깃: [타깃]
기간: [기간]
strategy/00_리서치_및_홍보전략.md를 기준 자료로 쓰고, 모두 끝나면 00_최종안.md로 요약해줘.
```
