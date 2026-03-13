import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
export class AdminController extends BaseController {
  #challengesService;
  constructor({ challengesService }) {
    super();
    this.#challengesService = challengesService;
  }

 routes() {
    this.router.get('/challenges', (req, res, next) => this.getChallenges(req, res, next));
    this.router.get('/challenges/:challengeId', (req, res, next) => this.getChallengeDetailById(req, res, next));
    this.router.patch('/challenges/:challengeId', (req, res, next) => this.updateChallengeStatus(req, res, next));
    
    return this.router;
  }

  async getChallenges(req, res, next) {
    try {
      const { page, pageSize, sort, keyword } = req.query;
      const userId = req.user?.userId; // 내 신청 내역만 볼 경우 필요

      const result = await this.#challengesService.getAllChallenges({
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        sort,
        keyword,
        userId,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  async getChallengeDetailById(req, res, next) {
    try {
      const { challengeId } = req.params;
      const result = await this.#challengesService.getChallengeDetailById(challengeId);

      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: '해당 챌린지를 찾을 수 없습니다.' });
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  async updateChallengeStatus(req, res, next) {
    try {
      const userRole = req.user?.role;    
      if (userRole !== "ADMIN") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "관리자만 접근할 수 있습니다." });
      }
      console.log("controller userRole:", userRole) ; 
      
      const challengeId = req.params.challengeId;
      const data = req.body;
      // 인증미들웨어 확인
      // const userId = req.user.userId;

      const userId = "01KKGAP404XG67S71QNTDEA27D";
      
      console.log("controller userId:", userId) ; 
      const result = await this.#challengesService.updateChallengeStatus(
        challengeId,
        data,
        userId
      );

      res.status(HTTP_STATUS.OK).json({ result });
    } catch (e) {
      next(e);
    }
  }

}
