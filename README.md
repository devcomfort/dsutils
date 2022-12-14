# DSUtils

동서대학교에서 사용할 수 있는 응용 프로그램을 제작하는 프로젝트

## Contents

- [강의 다운로더](#downloader)
- [계정 관리 API](#dsu-auth)
- [캐시 DB](#cache-db)
- [시간표 편성 도우미](#timetable-manager)
- [강의 교환 프로그램](#class-trader)
- [강의 신청 프로그램](#class-applier)
- [뉴스레터 서비스](#postman)
  - [뉴스레터 DB](#postman-db)
  - [뉴스레터 미들웨어](#postman-middleware)
- [라이브러리 목록](#libraries)

## Downloader [바로가기](./downloader/README.md)

교내 LearningX에서 강의를 수월하게 다운로드 할 수 있도록 하는 서비스입니다.

## DSU-Auth

교내 LearningX, 학사 행정 서비스 등의 DSUtils 서비스 이용을 위해 필요한 계정 정보를 안전하게 보관하기 위한 서비스 입니다.

## Profile DB

사용자가 저장한 시간표 정보, 강의 영상 다운로드 기록, 강의 신청 시나리오 등을 저장하기 위해 필요한 DB 서비스 입니다.

## Cache DB

강의 영상 파일 등 자주 사용되는 큰 파일을 캐싱하고 백업하는 DB 서비스 입니다.

## TimeTable Manager

## Class Trader

원하는 강의, 보유하고 있는 강의 중 필요 없는 강의를 선택하면 다른 사람과 강의를 교환해주는 서비스 입니다.

<details>
  <summary>부가 기능 명세</summary>
  <ul>
    <li>선택된 기간까지 강의가 교환되지 않으면, 강의를 버리는 옵션이 필요합니다.</li>
  </ul>
</details>

## Class Applier

강의 신청 서비스입니다.

<details>
  <summary>부가 기능 명세</summary>
  <ul>
    <li>시간표 편성 도우미와 연동하여, 원하는 강의 신청 프로필을 보다 편하게 만들 수 있도록 하는 기능이 필요합니다.</li>
    <li>시간표 편성 도우미에 멀티 프로필 기능이 추가된다면, 멀티 프로필 정보에 맞추어 우선순위를 형성, 우선순위에 따라 강의를 신청하는 기능이 필요합니다.</li>
    <li>학사 행정 시스템을 조회하여 부족한 교양 중 신청 가능한 강의를 자동으로 신청할 수 있도록 하는 기능이 필요합니다.</li>
  </ul>
</details>

## Postman

각 학과, 각 사업단에서 진행되는 이벤트 공지를 가져오고, 뉴스레터 신청자에게 알려주는 서비스

### Postman DB

서비스 성격상 [Postman](#postman)과 다른 모든 서비스는 DB를 분리하여 사용해야 합니다.

사용자 메일 정보, 학과 정보를 포함한 프로필 정보, 각 학과와 사업단에서 나오는 이벤트 정보를 각각 저장해야 하는데, 이를 위한 DB 서비스 입니다.

### Postman Middleware

학과, 사업단에서 나오는 정보를 가져오기 위해 필요합니다. Worker 서비스입니다.

## Libraries

서비스 제작을 위해 만들어야 할 라이브러리 모음입니다.

- **시간표 해석기**
  [강의 신청 프로그램](#class-applier), [강의 교환 프로그램](#class-trader), [시간표 편성 도우미](#timetable-manager)를 위해 필요합니다.
- **과목 정보 해석기**
  [강의 신청 프로그램](#class-applier), [강의 교환 프로그램](#class-trader), [시간표 편성 도우미](#timetable-manager)를 위해 필요합니다.
- **학사 행정 시스템 조회기**
  [강의 신청 프로그램](#class-applier), [강의 교환 프로그램](#class-trader), [시간표 편성 도우미](#timetable-manager)를 위해 필요합니다.
- **학과 공지 해석기**
  [뉴스레터 서비스](#postman), [뉴스레터 DB](#postman-db), [뉴스레터 미들웨어](#postman-middleware)를 위해 필요합니다.
- **사업단 공지 해석기**
  [뉴스레터 서비스](#postman), [뉴스레터 DB](#postman-db), [뉴스레터 미들웨어](#postman-middleware)를 위해 필요합니다.

# 참조

- [Naver D2 - 모던 프론트엔드 프로젝트 구성 기법 - 모노레포 도구 편](https://d2.naver.com/helloworld/7553804)
- [Naver D2 - 웹 폰트 사용과 최적화의 최근 동향](https://d2.naver.com/helloworld/4969726)
