import type { Locale } from '../i18n/ui';

/**
 * Registry of the component documentation pages, in display order. Drives the
 * "Component Documentation" list on `/components/` for both locales so the roster
 * lives in one place instead of being hand-maintained twice (en + ko) and kept
 * in sync with the 39 `components/*.mdx` pages by memory.
 *
 * `label` is the component's display name (identical across locales — they are
 * proper nouns like "AspectRatio"); only the one-line `summary` is localized.
 * The page URL is always `/components/{slug}/` (via `withBase`).
 */
export interface ComponentEntry {
  /** URL slug under `/components/`, matching the `components/{slug}.mdx` page. */
  readonly slug: string;
  /** Display name (same in every locale). */
  readonly label: string;
  /** Localized one-line description. */
  readonly summary: Record<Locale, string>;
}

export const COMPONENTS: readonly ComponentEntry[] = [
  {
    slug: 'accordion',
    label: 'Accordion',
    summary: {
      en: 'collapsible sections (single or multiple open)',
      ko: '접을 수 있는 섹션 (단일 또는 다중 열림)',
    },
  },
  {
    slug: 'alert',
    label: 'Alert',
    summary: {
      en: 'an inline status banner in four severities',
      ko: '4가지 심각도의 인라인 상태 배너',
    },
  },
  {
    slug: 'avatar',
    label: 'Avatar',
    summary: {
      en: 'a circular image with an initials fallback',
      ko: '이니셜 폴백이 있는 원형 이미지',
    },
  },
  {
    slug: 'badge',
    label: 'Badge',
    summary: {
      en: 'a small status/label pill in six semantic variants',
      ko: '6가지 시맨틱 변형의 작은 상태/라벨 핀',
    },
  },
  {
    slug: 'breadcrumb',
    label: 'Breadcrumb',
    summary: {
      en: 'a navigation trail to the current page',
      ko: '현재 페이지로의 탐색 경로',
    },
  },
  {
    slug: 'button',
    label: 'Button',
    summary: {
      en: 'variants, states, accessibility, and props',
      ko: '변형, 상태, 접근성, 및 props',
    },
  },
  {
    slug: 'card',
    label: 'Card',
    summary: {
      en: 'a generic hand-drawn surface container',
      ko: '범용 손그림 스타일 표면 컨테이너',
    },
  },
  {
    slug: 'input',
    label: 'Input',
    summary: {
      en: 'a labeled text field with an error state',
      ko: '에러 상태가 있는 라벨이 지정된 텍스트 필드',
    },
  },
  {
    slug: 'menu',
    label: 'Menu',
    summary: {
      en: 'a dropdown of actions triggered by a button',
      ko: '버튼으로 트리거되는 동작 드롭다운',
    },
  },
  {
    slug: 'modal',
    label: 'Modal',
    summary: {
      en: 'a focus-trapping dialog with a scrim',
      ko: '스크림이 있는 포커스 트랩 대화상자',
    },
  },
  {
    slug: 'pagination',
    label: 'Pagination',
    summary: {
      en: 'a pager for splitting long lists across numbered pages',
      ko: '긴 목록을 번호가 매겨진 페이지로 분할하는 페이저',
    },
  },
  {
    slug: 'progress',
    label: 'Progress',
    summary: {
      en: 'a determinate/indeterminate progress bar',
      ko: '결정형/비결정형 진행률 표시줄',
    },
  },
  {
    slug: 'textarea',
    label: 'Textarea',
    summary: {
      en: 'a multi-line text field with an opt-in auto-resize',
      ko: '옵션인 자동 크기 조정이 있는 여러 줄 텍스트 필드',
    },
  },
  {
    slug: 'toast',
    label: 'Toast',
    summary: {
      en: 'a transient, auto-dismissing notification',
      ko: '일시적이고 자동으로 사라지는 알림',
    },
  },
  {
    slug: 'tooltip',
    label: 'Tooltip',
    summary: {
      en: 'a short hint revealed on hover or focus',
      ko: '호버 또는 포커스 시 나타나는 짧은 힌트',
    },
  },
  {
    slug: 'checkbox',
    label: 'Checkbox',
    summary: {
      en: 'boolean input with an indeterminate state, plus CheckboxGroup',
      ko: '중간 상태가 있는 불린 입력, 및 CheckboxGroup',
    },
  },
  {
    slug: 'radio',
    label: 'Radio',
    summary: {
      en: 'single-selection input, used inside RadioGroup',
      ko: '단일 선택 입력, RadioGroup 내부에서 사용',
    },
  },
  {
    slug: 'switch',
    label: 'Switch',
    summary: {
      en: 'an immediate on/off toggle',
      ko: '즉시 켜기/끄기 토글',
    },
  },
  {
    slug: 'table',
    label: 'Table',
    summary: {
      en: 'a data table with sortable headers and row selection',
      ko: '정렬 가능한 헤더와 행 선택이 있는 데이터 테이블',
    },
  },
  {
    slug: 'tabs',
    label: 'Tabs',
    summary: {
      en: 'switch between related panels with keyboard-navigable tabs',
      ko: '키보드 탐색 가능한 탭으로 관련 패널 전환',
    },
  },
  {
    slug: 'select',
    label: 'Select',
    summary: {
      en: 'a single-select dropdown with a hand-implemented listbox',
      ko: '직접 구현된 리스트박스가 있는 단일 선택 드롭다운',
    },
  },
  {
    slug: 'skeleton',
    label: 'Skeleton',
    summary: {
      en: 'a loading placeholder that pulses while content loads',
      ko: '콘텐츠가 로드되는 동안 펄스하는 로딩 플레이스홀더',
    },
  },
  {
    slug: 'slider',
    label: 'Slider',
    summary: {
      en: 'a range input with a hand-drawn rail and thumb',
      ko: '손그림 스타일 레일과 썸이 있는 범위 입력',
    },
  },
  {
    slug: 'spinner',
    label: 'Spinner',
    summary: {
      en: 'an indeterminate loading indicator that respects reduced motion',
      ko: '동작 감소를 존중하는 비결정형 로딩 표시자',
    },
  },
  {
    slug: 'form-field',
    label: 'FormField',
    summary: {
      en: 'a Label + HelperText + ErrorText composition wrapper',
      ko: 'Label + HelperText + ErrorText 조합 래퍼',
    },
  },
  {
    slug: 'aspect-ratio',
    label: 'AspectRatio',
    summary: {
      en: 'a layout box that holds media at a fixed width-to-height ratio',
      ko: '고정된 가로세로 비율로 미디어를 담는 레이아웃 박스',
    },
  },
  {
    slug: 'direction',
    label: 'Direction',
    summary: {
      en: 'an LTR/RTL context provider and useDirection hook',
      ko: 'LTR/RTL 컨텍스트 프로바이더와 useDirection 훅',
    },
  },
  {
    slug: 'item',
    label: 'Item',
    summary: {
      en: 'a flexible list row with media, content, and actions slots',
      ko: '미디어, 콘텐츠, 액션 슬롯이 있는 유연한 목록 행',
    },
  },
  {
    slug: 'input-group',
    label: 'InputGroup',
    summary: {
      en: 'an input with leading/trailing addons in one sketchy box',
      ko: '하나의 손그림 박스 안에 선행/후행 애드온이 있는 입력',
    },
  },
  {
    slug: 'scroll-area',
    label: 'ScrollArea',
    summary: {
      en: 'a bounded scroll viewport with a sketchy border and themed scrollbar',
      ko: '손그림 테두리와 테마된 스크롤바를 갖춘 경계 스크롤 뷰포트',
    },
  },
  {
    slug: 'input-otp',
    label: 'InputOTP',
    summary: {
      en: 'a segmented one-time-code field with sequential entry and paste distribution',
      ko: '순차 입력과 붙여넣기 분배를 지원하는 분할형 일회용 코드 필드',
    },
  },
  {
    slug: 'native-select',
    label: 'NativeSelect',
    summary: {
      en: 'a hand-drawn box around a real native select, with a chevron and error state',
      ko: '셰브론과 오류 상태를 갖춘, 실제 네이티브 select를 감싼 손그림 박스',
    },
  },
  {
    slug: 'carousel',
    label: 'Carousel',
    summary: {
      en: 'a scroll-snap slideshow with prev/next controls',
      ko: '이전/다음 컨트롤을 갖춘 스크롤 스냅 슬라이드쇼',
    },
  },
  {
    slug: 'resizable',
    label: 'Resizable',
    summary: {
      en: 'a split view with drag- and keyboard-resizable panels',
      ko: '드래그와 키보드로 크기를 조정하는 패널의 분할 뷰',
    },
  },
  {
    slug: 'marker',
    label: 'Marker',
    summary: {
      en: 'a hand-drawn inline highlighter in four tones',
      ko: '네 가지 톤의 손그림 인라인 하이라이터',
    },
  },
  {
    slug: 'attachment',
    label: 'Attachment',
    summary: {
      en: 'a file chip with an icon, metadata, and remove button',
      ko: '아이콘, 메타데이터, 제거 버튼을 갖춘 파일 칩',
    },
  },
  {
    slug: 'bubble',
    label: 'Bubble',
    summary: {
      en: 'a chat bubble in a received or sent variant',
      ko: 'received 또는 sent 변형의 채팅 말풍선',
    },
  },
  {
    slug: 'message',
    label: 'Message',
    summary: {
      en: 'a chat row with avatar, author, timestamp, and bubble',
      ko: '아바타, 작성자, 타임스탬프, 말풍선이 있는 채팅 행',
    },
  },
  {
    slug: 'message-scroller',
    label: 'MessageScroller',
    summary: {
      en: 'an auto-sticking chat log bounded by maxHeight',
      ko: 'maxHeight로 제한된 자동 고정 채팅 로그',
    },
  },
];

/**
 * The trailing non-component link in the Component Documentation list. Kept
 * separate from {@link COMPONENTS} because it points at `/accessibility/` (not a
 * `/components/{slug}/` page) and its label is localized.
 */
export const ACCESSIBILITY_GUIDE_LINK: {
  readonly href: string;
  readonly label: Record<Locale, string>;
  readonly summary: Record<Locale, string>;
} = {
  href: '/accessibility/',
  label: { en: 'Accessibility Guide', ko: '접근성 가이드' },
  summary: {
    en: 'keyboard interaction, focus management, and ARIA patterns shared across all components',
    ko: '키보드 인터랙션, 포커스 관리 및 모든 컴포넌트에 공유되는 ARIA 패턴',
  },
};
