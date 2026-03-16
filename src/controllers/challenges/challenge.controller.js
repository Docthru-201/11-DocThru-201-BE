import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  createChallengeSchema,
  idParamSchema,
  updateChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    this.router.get('/me', needsLogin, (req, res) =>
      this.getMyChallenges(req, res),
    );

    this.router.get('/', (req, res) => this.findAll(req, res));

    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.findById(req, res),
    );

    this.router.post(
      '/',
      needsLogin,
      validate('body', createChallengeSchema),
      (req, res) => this.create(req, res),
    );

    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      validate('body', updateChallengeSchema),
      (req, res) => this.update(req, res),
    );

    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      (req, res) => this.delete(req, res),
    );

    return this.router;
  }

  // GET	/challenges	전체 챌린지 목록 조회(필터링, 페이징 적용 가능)
  // GET	/challenges/:id	특정 챌린지 상세 조회(ULID사용)
  // POST	/challenges	새로운 챌린지 생성
  // PATCH	/challenges/:id	특정 챌린지 정보 수정(제목, 설명, 상태 등 부분 수정)
  // DELETE	/challenges/:id	특정 챌린지 삭제
  // GET	/challenges/me	내가 만든 챌린지 조회

  // res <- controller req <-> service <-> repository <-> DB

  async findAll(req, res) {
    const challenges = await this.#challengesService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(challenges);
  }

  async findById(req, res) {
    const { id } = req.params;
    const challenge = await this.#challengesService.getChallengeDetail(id);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  async create(req, res) {
    const challengeData = req.body;
    const userId = req.user.id;

    const newChallenge = await this.#challengesService.createChallenge({
      ...challengeData,
      authorId: userId,
    });
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  async update(req, res) {
    const { id } = req.params;
    const updataData = req.body;
    const userId = req.user.id;

    const updateChallenge = await this.#challengesService.updateChallenge(
      id,
      userId,
      updataData,
    );
    res.status(HTTP_STATUS.OK).json(updateChallenge);
  }

  async delete(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    await this.#challengesService.deleteChallenge(id, userId);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async getMyChallenges(req, res) {
    const userId = req.user.id;

    const myChallenges =
      await this.#challengesService.getChallengesByUser(userId); //challenge.service.js에 없는데, 일단 넣어둠
    res.status(HTTP_STATUS.OK).json(myChallenges);
  }
}

//
