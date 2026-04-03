export const DAY_IN_MS = 24 * 60 * 60 * 1000;

// 시드 생성 개수
export const SEED_PASSWORD = 'Test1234!'; // 시드용 공통 비밀번호 (개발 환경 전용)

export const USERS_COUNT = 50;
export const NICKNAME_MAX_LENGTH = 20;

export const CHALLENGES_COUNT = 500;
export const CHALLENGE_DEADLINE = 30;
export const CHALLENGE_MIN_PARTICIPANTS = 5;
export const CHALLENGE_MAX_PARTICIPANTS = 15;

export const APPLICANTS_MIN = 5;
export const APPLICANTS_MAX = 20;

export const COMMENTERS_TAKE = 15;
export const LIKERS_TAKE = 10;

export const NOTIFICATIONS_PER_USER_MIN = 3;
export const NOTIFICATIONS_PER_USER_MAX = 10;

export const NOTIFICATION_RECENT_DAYS = 14;

// ENUMS
export const ROLES = ['USER', 'ADMIN'];
export const DEFAULT_ROLE = ROLES[0];

export const GRADES = ['NORMAL', 'EXPERT'];
export const DEFAULT_GRADE = GRADES[0];

export const AUTH_PROVIDERS = ['GOOGLE'];

export const NOTIFICATION_TYPES = [
  'NEW_WORK',
  'NEW_COMMENT',
  'NEW_REPLY',
  'CHALLENGE_APPROVAL_RESULT',
  'CLOSED',
  'ADMIN_ACTION',
];

export const CHALLENGE_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'DELETED',
];

export const CHALLENGE_CATEGORIES = ['DOCUMENT', 'BLOG'];

export const CHALLENGE_TYPES = ['NEXT_JS', 'API', 'CAREER', 'MODERN_JS', 'WEB'];

export const APPLICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
export const APPLICATION_STATUS_APPROVED = APPLICATION_STATUSES[1];

// 템플릿
export const PROFILE_INTRO_TEMPLATES = [
  '프론트엔드 개발자로, 영어로 된 최신 웹 기술 문서를 번역하며 공부하고 있습니다.',
  '백엔드/인프라 문서를 번역해 팀에 공유하는 것을 좋아합니다.',
  '실무에서 자주 쓰는 라이브러리의 공식 문서를 한글로 옮기는 것에 관심이 많아요.',
  '주니어 개발자들을 위해 어려운 개념을 쉽게 풀어 번역하는 것이 목표입니다.',
];

export const CHALLENGE_TITLE_TEMPLATES = [
  '개발자로써 자신만의 브랜드를 구축하는 방법(daily dev)',
  'TanStack Query - Optimistic Updates',
  'Web 개발자의 필수 요건',
  'Next.js - App Router:Routing Fundamentals',
  'Fetch API, 너는 에러를 제대로 핸들링 하고 있는가?(daily dev)',
  '[{topic}] 공식 문서 번역 챌린지',
  '{topic} 가이드 한글 번역하기',
  '{topic} 입문서를 한국어로 옮겨보세요',
  '실전 {topic} 문서 번역 스프린트',
];

export const CHALLENGE_TOPIC_TEMPLATES = [
  'Next.js',
  'React',
  'Node.js',
  'PostgreSQL',
  'Prisma',
  'TypeScript',
  'Tailwind CSS',
  'Docker',
  'Kubernetes',
  'AWS',
  'Nest.js',
  'MongoDB',
];

export const CHALLENGE_DESCRIPTION_TEMPLATES = [
  'Next.js App Router 공식 문서 중 Routing Fundamentals 내용입니다! 라우팅에 따른 폴더와 파일이 구성되는 법칙과 컨벤션 등에 대해 공부할 수 있을 것 같아요~! 다들 챌린지 많이 참여해 주세요 :)',
  'TanStack Query 공식 문서 중 Optimistic Updates 내용입니다! 데이터 업데이트 시 화면에 바로 반영되는 기능을 공부할 수 있을 것 같아요~! 많은 참여 부탁드려요!',
  'Web 개발자의 필수 요건 공식 문서 중 Modern Web Development 내용입니다! 최신 웹 기술과 트렌드에 대해 공부할 수 있을 것 같아요~! 다들 챌린지 많이 참여해 주세요 :)',
  'Fetch API 공식 문서 중 Error Handling 내용입니다! 에러 처리 방법과 에러 코드에 대해 공부할 수 있을 것 같아요~! 많은 참여 부탁드려요!',
  '원문에서 중요한 개념과 예제 코드를 빠뜨리지 말고 한국어로 옮겨 주세요. 번역 중 헷갈리는 부분이 있다면 주석으로 보충 설명을 달아주셔도 좋습니다.',
  '실제 실무 환경에서 바로 참고할 수 있는 수준의 번역을 목표로 합니다. 용어 통일과 문맥을 특히 신경 써주세요.',
  '기존에 이미 많이 번역된 주제라도, 더 읽기 쉽고 자연스러운 표현을 찾아보는 것이 이 챌린지의 목표입니다.',
  '아래 원문 링크의 문서를 자연스러운 한국어로 번역해 주세요. 단순 직역보다는, 한국 개발자들이 이해하기 쉬운 표현을 사용해 주시면 좋습니다.',
  '원문에서 중요한 개념과 예제 코드를 빠뜨리지 말고 한국어로 옮겨 주세요. 번역 중 헷갈리는 부분이 있다면 주석으로 보충 설명을 달아주셔도 좋습니다.',
  '실제 실무 환경에서 바로 참고할 수 있는 수준의 번역을 목표로 합니다. 용어 통일과 문맥을 특히 신경 써주세요.',
  '기존에 이미 많이 번역된 주제라도, 더 읽기 쉽고 자연스러운 표현을 찾아보는 것이 이 챌린지의 목표입니다.',
];

export const ORIGINAL_URL_TEMPLATES = [
  'https://nextjs.org/docs/app/building-your-application/routing/fundamentals',
  'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
  'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/What_should_your_web_site_be_like',
  'https://nextjs.org/docs/app/building-your-application/data-fetching/fetching',
  'https://react.dev/learn/start-a-new-react-project',
  'https://nodejs.org/api/stream.html',
  'https://www.prisma.io/docs/orm/prisma-schema/data-model',
  'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA',
  'https://www.postgresql.org/docs/current/tutorial-transactions.html',
  'https://auth0.com/docs/secure/tokens/json-web-tokens',
];

export const APPLICATION_MESSAGE_TEMPLATES = [
  '번역 스타일은 공식 문서의 톤을 유지하면서 한국어 표현만 자연스럽게 다듬겠습니다.',
  '해당 주제에 대해 기존에 정리해둔 개인 노트가 있어 빠르게 번역 가능합니다.',
  '용어집을 먼저 정리한 뒤, 일관된 용어를 사용해 번역하겠습니다.',
  '번역 후에도 오타/문맥 검수까지 함께 진행하겠습니다.',
];

export const WORK_CONTENT_TEMPLATES = [
  `일반적으로 개발자는 일련의 하드 스킬을 가지고 있어야 커리어에서 경력과 전문성을 쌓을 수 있습니다. 하지만 이에 못지 않게 개인 브랜드 구축도 만족스럽고 성취감 있는 경력을 쌓기 위해 중요하며 이를 쌓기는 더 어려울 수 있습니다.

다른 사람들과의 차별화, 신뢰감을 줄 수 있음, 인맥을 쌓을 수 있는 기회, 이름을 알릴 수 있음—이렇게 개인 브랜드는 경력을 결정짓는 수많은 중요한 방법으로 여러분을 도울 수 있습니다. 본인의 실력을 뽐내는 데 익숙하지 않거나 마케팅 개념에 한 번도 접해보지 않은 사람은 브랜드 구축을 부담스럽거나 어렵게 느낄 수 있습니다. 이 가이드에서는 브랜드 구축을 위한 몇 가지 실용적인 전략을 소개합니다.

자신의 야망과 편안한 수준을 고려하기, 10년 후 내가 꿈꾸는 직책은 무엇일까 생각해 보기, 자신의 구체적인 목표에 맞게 계획을 세워보기, 관리자나 커리어 카운슬러와 상담하기. 나만의 열정과 지식을 담아내기, 자신의 직업에서 실제로 가장 좋아하는 점을 생각해 보고 그것을 브랜드의 주제로 삼기. 온라인에서 존재감 만들기—LinkedIn 페이지가 최신 상태인지 확인하기, GitHub 프로필을 활성 상태로 유지하고 오픈 소스 기여와 개인 프로젝트 소개하기, 나만의 웹사이트 구축하기. 측정 및 적응—Google 애널리틱스 같은 도구로 웹사이트와 콘텐츠의 성과를 확인하기, 오프라인 인맥 구축 노력에 대한 데이터를 수집해 보기.`,

  `기술 블로그나 문서를 쓸 때는 독자가 누구인지, 어떤 배경 지식을 가지고 있는지 먼저 정하는 것이 좋습니다. 같은 주제라도 입문자용과 실무자용은 구성과 깊이가 달라져야 합니다.

제목과 목차로 핵심 메시지를 드러내기, 서론에서 다룰 내용과 기대 효과를 한두 문단으로 요약하기, 본문은 소제목으로 나누어 한 번에 하나의 개념만 다루기. 코드 예제는 복사해서 바로 쓸 수 있도록 최소한으로 완결되게 넣고, 필요한 경우 “왜 이렇게 쓰는지” 한두 줄로 보충하기. 마지막에 “다음에 읽으면 좋은 문서”나 “관련 공식 문서 링크”를 두면 독자가 이어서 학습하기 쉽습니다. 피드백을 받을 채널(댓글, SNS, 이메일)을 열어두고, 반복해서 읽힌 부분과 이탈 구간을 확인하면 다음 글을 더 낫게 만들 수 있습니다.`,

  `오픈소스에 기여하는 것은 실력 검증과 네트워크 확장 모두에 도움이 됩니다. 처음에는 “기여하기”를 반드시 코드로만 생각할 필요는 없습니다.

Good First Issue나 “documentation”, “typo” 라벨이 붙은 이슈를 찾아보기, 프로젝트의 CONTRIBUTING.md와 코드 스타일 가이드를 먼저 읽기, 이슈에 “이 부분 작업해 보겠습니다”라고 코멘트한 뒤 담당자와 짧게 논의하기. 패치를 보낼 때는 PR 제목과 본문에 “무엇을 왜 바꿨는지”를 명확히 쓰고, 리뷰어가 제안한 수정 사항은 가능한 한 반영해서 대화를 이어가기. 한 번에 큰 기능보다는 작은 수정을 여러 번 하는 편이 리뷰도 빠르고 관계도 쌓기 쉽습니다. 본인만의 사이드 프로젝트를 오픈소스로 공개해 두면, 기여 경험과 함께 “무엇을 만들 수 있는지”를 보여줄 수 있습니다.`,

  `이력서와 포트폴리오는 “내가 한 일”이 아니라 “그 일로 어떤 결과와 배운 점이 있었는지”가 보이도록 정리하는 것이 중요합니다.

프로젝트마다 한두 문장으로 맥락(기간, 역할, 목표)을 쓰고, 그다음에 구체적인 성과(지표 개선, 배포 규모, 기술 선택 이유)를 나열하기. 기술 스택은 나열만 하지 말고, “어디에 어떻게 썼는지” 한 줄이라도 붙이면 설득력이 커집니다. 오픈소스 기여, 사이드 프로젝트, 번역·블로그 글은 별도 섹션으로 두어 “지속적으로 학습하고 공유하는 사람”임을 보여주기. 포트폴리오 사이트가 있다면 이력서와 같은 톤으로 “프로젝트 소개 → 내가 한 일 → 사용 기술 & 회고” 구조를 유지하면 일관된 인상이 납니다. 지원하는 포지션의 JD에 나오는 키워드를 자연스럽게 녹여 넣되, 과장하지 않는 선에서 작성하는 것이 좋습니다.`,

  `개발자 커뮤니티에 참여하면 최신 트렌드와 실무 사례를 접할 수 있고, 비슷한 고민을 가진 사람들과 관계를 쌓을 수 있습니다.

온라인에서는 특정 기술이나 직군별 디스코드·슬랙·텔레그램 모임에 가입해 보기, 질문할 때는 “무엇을 시도했고, 어떤 결과가 나왔는지”를 함께 적어 답을 받기 쉽게 하기, 다른 사람의 질문에 아는 범위에서 답변해 보기. 오프라인에서는 지역 밋업, 컨퍼런스, 스터디에 참석해 이름과 얼굴을 알리기, 대화 후 “오늘 이야기한 내용 정리해 두었습니다”처럼 블로그나 SNS로 후기를 남기면 기억에 남습니다. 커뮤니티는 “얻기”만 하지 말고 “나누기”를 조금씩 해 보는 것이 중요합니다. 꼭 전문가가 아니어도, 본인이 겪은 실패나 시행착오를 공유하는 것만으로도 다른 사람에게 큰 도움이 될 수 있습니다.`,
];

export const COMMENT_TEMPLATES = [
  '용어 선택이 자연스럽고 읽기 편했습니다. 특히 예제 설명이 이해에 큰 도움이 됐어요.',
  '예제 코드가 잘 작성되어 있어 이해하기 쉬웠습니다. 감사합니다!',
  '번역이 자연스럽고 흐름이 잘 이어지네요. 좋은 번역 감사합니다!',
  '원문보다 구조가 더 명확하게 정리된 느낌이에요. 좋은 번역 감사합니다.',
  '마지막 섹션에서 예제를 하나 더 추가해주시면 더 좋을 것 같아요.',
  '덕분에 더 잘 이해할 수 있었습니다. 감사합니다!',
  '잘 이해가 안되었던 부분인데, 이 번역 덕분에 이해할 수 있었습니다. 감사합니다!',
];

export const NOTIFICATION_TEMPLATES = [
  '새로운 번역 작업물이 등록되었습니다.',
  '참여한 챌린지에 새로운 댓글이 달렸습니다.',
  '내 번역에 새로운 좋아요가 추가되었습니다.',
  '참여 중인 챌린지의 상태가 변경되었습니다.',
  '신청하신 챌린지가 마감되었습니다.',
];

export const DECLINE_REASON_TEMPLATES = [
  '챌린지 주제와 관련이 없는 사이트입니다. 주제를 다시 검토해 신청해주세요.',
  '독스루는 개발 문서 번역 플랫폼으로, 다른 종류의 번역 챌린지를 개최할 수 없음을 알려드립니다. 감사합니다.',
  '저희 사이트의 목적과 맞지 않는 챌린지입니다.',
];
