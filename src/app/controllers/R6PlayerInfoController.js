import apiR6 from '../../config/apiR6';
import Cache from '../../config/Cache';

class R6PlayerInfoController {
  async index(req, res) {
    const { username, platform, type } = req.query;

    const cacheKey = `username:${username}`;
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const playerInfo = await apiR6.get(`stats/${username}/${platform}/${type}`);

    await Cache.set(cacheKey, playerInfo.data);

    return res.json(playerInfo.data);
  }
}

export default new R6PlayerInfoController();
