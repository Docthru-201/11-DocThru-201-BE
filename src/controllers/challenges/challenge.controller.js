import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate } from '#middlewares';
import {
  challengeIdParamSchema,
  listChallengesQuerySchema,
  createChallengeSchema,
  updateChallengeSchema,
} from './dto/challenge.dto.js';

export class ChallengesController extends BaseController {
  #challengesService;

  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

  routes() {
    // 전체 챌린지 목록 조회
    this.router.get(
      '/',
      validate('query', listChallengesQuerySchema),
      (req, res) => this.findAll(req, res),
    );

    // 새 챌린지 생성
    this.router.post(
      '/',
      needsLogin,
      validate('body', createChallengeSchema),
      (req, res) => this.create(req, res),
    );

    // 내가 신청한 챌린지 목록 조회
    this.router.get('/me', needsLogin, (req, res) =>
      this.getMyChallenges(req, res),
    );

    // 특정 챌린지 상세 조회
    this.router.get(
      '/:challengeId',
      validate('params', challengeIdParamSchema),
      (req, res) => this.findById(req, res),
    );

    // 특정 챌린지 정보 수정
    this.router.patch(
      '/:challengeId',
      needsLogin,
      validate('params', challengeIdParamSchema),
      validate('body', updateChallengeSchema),
      (req, res) => this.update(req, res),
    );

    // 특정 챌린지 삭제
    this.router.delete(
      '/:challengeId',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res) => this.delete(req, res),
    );

    return this.router;
  }

  // 전체 챌린지 목록
  async findAll(req, res) {
    const challenges = await this.#challengesService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(challenges);
  }

  // 특정 챌린지 상세
  async findById(req, res) {
    const { challengeId } = req.params;
    const challenge =
      await this.#challengesService.getChallengeDetail(challengeId);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  // 챌린지 생성
  async create(req, res) {
    const newChallenge = await this.#challengesService.createChallenge({
      userId: req.user.id,
      ...req.body,
    });
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  // 챌린지 수정
  async update(req, res) {
    const { challengeId } = req.params;
    const updated = await this.#challengesService.updateChallenge({
      challengeId,
      userId: req.user.id,
      payload: req.body,
    });
    res.status(HTTP_STATUS.OK).json(updated);
  }

  // 챌린지 삭제
  async delete(req, res) {
    const { challengeId } = req.params;
    await this.#challengesService.deleteChallenge({
      challengeId,
      userId: req.user.id,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  // 내가 신청한 챌린지 목록
  async getMyChallenges(req, res) {
    const challenges = await this.#challengesService.listMyChallenges(
      req.user.id,
    );
    res.status(HTTP_STATUS.OK).json(challenges);
  }
}
