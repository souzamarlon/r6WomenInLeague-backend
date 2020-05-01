import apiR6 from '../../config/apiR6';

class R6PlayerInfoController {
  async index(req, res) {
    const { username, platform, type } = req.query;

    const playerInfo = await apiR6.get(`stats/${username}/${platform}/${type}`);

    return res.json(playerInfo.data);
  }
}

export default new R6PlayerInfoController();
