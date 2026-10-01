# my-project

Claude Code 에이전트 팀으로 자원봉사 홍보 업무를 진행하는 작업 공간입니다.

## 포함된 설정

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | Claude Code 작업 규칙 (파일 삭제 금지, 수정 전 구조 확인, 한국어 보고) |
| `.claude/settings.json` | 에이전트 팀 기능 활성화 (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |
| `.claude/agents/` | 홍보팀 에이전트 4종 (`promo-strategist`, `promo-copywriter`, `promo-visual`, `promo-reviewer`) |

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

## 홍보팀 부르기

Claude Code 입력창에 다음과 같이 입력합니다.

```text
promo-strategist, promo-copywriter, promo-visual, promo-reviewer 에이전트 유형으로 홍보 에이전트 팀을 만들어줘.
캠페인 주제: [주제]
타깃: [타깃]
기간: [기간]
모두 끝나면 00_최종안.md로 요약해줘.
```
