import { BaseController } from '#controllers/base.controller.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    return this.router;
  }

  // GET	/challenges	전체 챌린지 목록 조회(필터링, 페이징 적용 가능)
  // GET	/challenges/:id	특정 챌린지 상세 조회(ULID사용)
  // POST	/challenges	새로운 챌린지 생성
  // PATCH	/challenges/:id	특정 챌린지 정보 수정(제목, 설명, 상태 등 부분 수정)
  // DELETE	/challenges/:id	특정 챌린지 삭제
  // GET	/challenges/me	내가 만든 챌린지 조회

  // res <- controller req <-> service <-> repository <-> DB

  async findAll(req, res) {}

  async findById(req, res) {}

  async create(req, res) {}

  async update(req, res) {}

  async delete(req, res) {}

  async getMyChallenges(req, res) {}
}

//
