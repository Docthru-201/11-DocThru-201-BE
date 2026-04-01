# 11-DocThru-201-BE

개발 문서 번역 챌린지 서비스 '독스루(Docthru)'의 백엔드 서버 레포지토리

실행하기

```bash
git clone https://github.com/Docthru-201/11-DocThru-201-BE.git

cd 11-DocThru-201-BE

pnpm install

# 로컬 개발 서버 실행
pnpm dev
```

<br>

# **독스루 - 3팀**

<img width="2208" height="1104" alt="img_thumbnail_docthru@3x" src="https://github.com/user-attachments/assets/bc854a30-4ad7-4f27-9032-88c065b0a254" />

## 📆 프로젝트 정보

- **팀**: Codeit FS 11기, Part3, 3팀
- **기간**: 2026.03.13 ~ 2026.04.06
- **팀 노션**:[https://www.notion.so/ab334e1d895e839ab11c012516cb704f?v=abf34e1d895e83a79e3888978d4c2025](https://www.notion.so/ab334e1d895e839ab11c012516cb704f?pvs=21)

<div align="center">
<table width="100%" style="table-layout: fixed;">
<tbody>
<tr>
<td align="center" valign="middle">
<a href="https://github.com/lareina7486">
<img src="https://avatars.githubusercontent.com/u/33364524?s=400&v=4" width="100" />
<br />
<b>강에스더</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/ranflir">
<img src="https://avatars.githubusercontent.com/u/243709414?v=4" width="100" />
<br />
<b>김현제</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/yyejin00">
<img src="https://avatars.githubusercontent.com/u/79955539?v=4" width="100" />
<br />
<b>안예진</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/seorinjung">
<img src="https://avatars.githubusercontent.com/u/244867022?v=4" width="100" />
<br />
<b>정서린</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/040l28">
<img src="https://avatars.githubusercontent.com/u/243091301?v=4" width="100" />
<br />
<b>정미주</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/DevWoojin97">
<img src="https://avatars.githubusercontent.com/u/237198099?v=4" width="100" />
<br />
<b>최우진</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/hkr0104">
<img src="https://avatars.githubusercontent.com/u/216478061?v=4" width="100" />
<br />
<b>홍규량</b>
</a>
</td>
<td align="center" valign="middle">
<a href="https://github.com/dolby527">
<img src="https://avatars.githubusercontent.com/u/243248161?v=4" width="100" />
<br />
<b>이석우</b>
</a>
</td>
</tr>
<tr>
<td align="center">팀장</td>
<td align="center">챌린지 목록<br> · 나의 챌린지<br> · AI 자동번역</td>
<td align="center">번역 에디터<br> · 게시글 피드백</td>
<td align="center">PM<br> · 공통 UI<br> · 랜딩페이지</td>
<td align="center">챌린지 상세<br> · 라이브 챌린지</td>
<td align="center">회원가입<br> · 로그인<br> · 권한/등급 관리</td>
<td align="center">신청한 챌린지<br> · 알림 기능</td>
<td align="center">어드민<br> · 챌린지 관리</td>
</tr>
</tbody>
</table>
</div>

## 🔗 배포 주소

- **Frontend**: [ 배포 준비중... ]
- **Backend**: [ 배포 준비중... ]

<br>

---

## ✨ 프로젝트 소개

대다수의 개발 시장 콘텐츠가 영어로 작성되어 있어, 영어를 잘하지 못하는 한국인들이 해당 기술을 습득하는데 어려움을 겪고 있습니다. <br>
따라서 개발 관련 영어 문서를 함께 번역하는 챌린지를 진행하고, 번역 작업 에디터에서 번역을 진행하며 번역문에 대한 피드백을 주고받을 수 있는 <br>서비스를 제작합니다. <br>

## 🛠 기술 스택 ( 추가중... )

<div align=center>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black">
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black">
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white">
<img src="https://img.shields.io/badge/React Router-CA4245?style=for-the-badge&logo=ReactRouter&logoColor=black">
<img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=CSS&logoColor=white">

<img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=Node.js&logoColor=white">
<img src="https://img.shields.io/badge/Express-black?style=for-the-badge&logo=Express&logoColor=white">
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=Prisma&logoColor=white">

<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white">
</div>

<div align=center>
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=Github&logoColor=white">
<img src="https://img.shields.io/badge/Notion-black?style=for-the-badge&logo=Notion&logoColor=white">
<img src="https://img.shields.io/badge/Vercel-00C7B7?style=for-the-badge&logo=Vercel&logoColor=white">
<img src="https://img.shields.io/badge/figma-e05a32?style=for-the-badge&logo=Figma&logoColor=white">
</div>

<br>

## 📝 커밋 메시지 컨벤션

**메세지는 영어가 아닌 한글로 적어주세요!**

- **feat** : 새로운 기능 추가
- **fix** : 개발 단계 버그 수정
- **hotfix** : 배포 후 수정
- **docs** : 문서 추가, 수정, 삭제
- **test** : 테스트 코드 추가, 수정, 삭제
- **refactor** : 코드 리팩토링
- **style** : 코드 형식 변경 (세미콜론 등, 기능 변화 X)
- **chore** : 빌드 설정, 패키지 매니저 수정

<br>

## 🌿 브랜치 전략

- **main**: 최종 배포용 최상위 브랜치
- **develop**: 개발의 중심이 되는 브랜치
- **feature**: 새로운 기능을 개발하는 브랜치
  - `<타입>/<이슈번호>-<기능(또는 버그명)>-<담당자명>`
  - develop에 merge 한 이후, 브랜치 삭제하기
  - ex) feature/23-login-esther
- **fix**: 배포된 버전에서 발생한 긴급 버그 수정용 브랜치

---

## **팀원별 구현 기능 상세**

### 🙆🏻‍♀️ 강에스더

- 팀장

### 🙆🏻‍♀️ 안예진

- 번역 에디터
- 게시글 피드백

### 🙆🏻‍♂️ 김현제

- 챌린지 목록
  - 나의 챌린지
- AI 자동 번역

### 🙆🏻‍♂️ 정서린

- PM
- 공통 UI
- 랜딩 페이지

### 🙆🏻‍♂️ 최우진

- 회원가입
  - 로그인
  - 권한/등급 관리

### 🙆🏻‍♂️ 홍규량

- 신청한 챌린지
- 알림 기능

### 🙆🏻‍♂️ 이석우

- 어드민
- 챌린지 관리
