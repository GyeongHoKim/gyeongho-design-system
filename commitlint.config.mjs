/**
 * Commitlint 설정 — Conventional Commits 규칙을 강제한다.
 * 형식: <type>(<scope>): <subject>
 * 예) feat(tokens): add spacing scale tokens
 *     fix(react): correct button hover color
 *     chore: update turbo to v2.1
 *
 * 참고: AGENTS.md > Code Quality Gate > Conventional commits
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 허용 type 목록 (Conventional Commits 표준)
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새 기능
        'fix', // 버그 수정
        'docs', // 문서
        'style', // 포맷팅 (코드 동작 변화 없음)
        'refactor', // 리팩터링
        'perf', // 성능 개선
        'test', // 테스트 추가/수정
        'build', // 빌드 시스템/의존성
        'ci', // CI 설정
        'chore', // 기타 잡무
        'revert', // 커밋 되돌리기
      ],
    ],
    // 모노레포 패키지 스코프 가이드 (경고 수준 — 다른 스코프도 허용)
    'scope-enum': [
      1,
      'always',
      [
        'tokens',
        'react',
        'web-components',
        'react-native',
        'tsconfig',
        'deps',
        'release',
        'repo',
        'ci',
      ],
    ],
    // 한글 제목을 쓰므로 대소문자 규칙은 비활성화한다.
    'subject-case': [0],
    // 제목 길이 여유 (한글 가독성 고려)
    'header-max-length': [2, 'always', 100],
  },
};
