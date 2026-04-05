# 11-DocThru-201-BE

개발 문서 번역 챌린지 서비스 '독스루(Docthru)'의 백엔드 레포지토리

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
<a href="https://github.com/seorinjung">
<img src="https://avatars.githubusercontent.com/u/244867022?v=4" width="100" />
<br />
<b>정서린</b>
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
<td align="center">· 챌린지 목록<br> · 나의 챌린지</td>
<td align="center">· PM<br>· 공통 UI<br> · 랜딩페이지</td>
<td align="center">· 번역 에디터<br> · 게시글 피드백<br>· 회원가입<br> · 로그인<br> · 권한/등급 관리 </td>
<td align="center">· 신청한 챌린지<br> · 알림 기능</td>
<td align="center">· 어드민<br> · 챌린지 관리<br> · 챌린지 상세<br> · 라이브 챌린지</td>
</tr>
</tbody>
</table>
</div>

## 🔗 배포 주소

- **Frontend**: [https://11-doc-thru-201-fe-sigma.vercel.app/]
- **Backend**: [https://one1-docthru-201-be.onrender.com/]

<br>

---

## ✨ 프로젝트 소개

대다수의 개발 시장 콘텐츠가 영어로 작성되어 있어, 영어를 잘하지 못하는 한국인들이 해당 기술을 습득하는데 어려움을 겪고 있습니다. <br>
따라서 개발 관련 영어 문서를 함께 번역하는 챌린지를 진행하고, 번역 작업 에디터에서 번역을 진행하며 번역문에 대한 피드백을 주고받을 수 있는 서비스를 제작합니다. <br>

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

### 🙆🏻‍♂️ 김현제

- 요구사항 분석
- 챌린지 목록
  - 나의 챌린지

### 🙆🏻‍♂️ 정서린

- PM
- 공통 UI
- 랜딩 페이지

### 🙆🏻‍♂️ 최우진

- BE 기술 스택 선정 및 폴더 구조 정의
- 회원가입
  - 로그인
  - 권한/등급 관리
- 번역 에디터
- 게시글 피드백

### 🙆🏻‍♂️ 홍규량

- 신청한 챌린지
- 알림 기능

### 🙆🏻‍♂️ 이석우

- 어드민 신청 관리
- 챌린지 관리
- 번역 챌린지 상세 페이지 전반
- 챌린지 상태에 따른 UX 분기
- 최다 추천 번역 표시 기능
- 공동 순위 기반 참여 현황 목록 구현

---

## **프로젝트 회고**
### 👩🏻‍💻 강에스더

[작성중...]

### 🧑🏻‍💻 김현제

프로젝트를 시작할 때는 잘하고 싶은 마음만큼이나 부족한 실력에 대한 불안도 컸습니다. 그럼에도 불구하고 한 걸음 내딛을 수 있었던 건, 각자의 자리에서 최선을 다해주고 때로는 그 이상을 해내준 팀원들 덕분이었습니다.<br>

이번 프로젝트는 단순히 결과물을 만들어내는 과정을 넘어, 서로의 생각을 나누고 끊임없이 피드백을 주고받으며 완성도를 높여가는 시간이었습니다. 마치 망치와 정으로 하나의 조각을 다듬어가듯, 리뷰와 조언 하나하나가 더 나은 결과를 만들어주었다고 느낍니다.<br>

프로젝트를 진행하는 동안 자연스럽게 더 많은 공부를 하게 되었고, 그 과정 속에서 스스로의 성장도 분명히 체감할 수 있었습니다. 그 점이 무엇보다 값진 경험이었습니다.<br>

그리고 무엇보다도, 방향을 잡아주고 끝까지 이끌어주신 팀장님께 깊은 감사의 말씀을 전하고 싶습니다. 덕분에 이번 프로젝트를 잘 마무리할 수 있었습니다.<br>


### 👩🏻‍💻 정서린

프로젝트 진행 중 팀원 이탈과 같은 어려움이 있었고, 개발 과정 또한 쉽지 않았지만
팀장님의 지속적인 리딩과 지원 덕분에 끝까지 안정적으로 마무리할 수 있었습니다.<br>

구현 과정에서 어려움을 느끼는 부분이 많았지만,
팀원분들께 도움을 받으며 문제를 하나씩 해결해 나갈 수 있었습니다.<br>

그 과정에서 협업의 중요성과 개발 흐름을 이해할 수 있었고,
이전 프로젝트보다 성장할 수 있는 계기가 되었습니다.<br>

### 🧑🏻‍💻 최우진

[작성중...]

### 🧑🏻‍💻 홍규량

이전 프로젝트 에서는 프론트 작업만 해봤는데 중급 프로젝트에서 백엔드와 프론트엔드 모두 작업하게 되었다.<br>
“내가 신청한 챌린지 목록”과 전역 알림 기능을 중심으로 백엔드 설계부터 프론트엔드 UI구현까지 내가맡은 부분의 처음부터 끝까지 해보며 어떻게 작동시키고 구현을 할 수 있는 좋은 경험이었다. 잘 모르던 백엔드부분 진행할 때 어려웠던 부분을 소통하며 배울때 협업의 중요성을 느꼈다.<br>

### 🧑🏻‍💻 이석우

프로젝트 초반 고생하신 팀원분들에게 감사하고 도움을 못드린것 같아 죄송합니다. 하면 할 수록 배우고 내재화 할 게 무한하다는 생각이 듭니다. 모두들 고생하셨습니다.<br>
