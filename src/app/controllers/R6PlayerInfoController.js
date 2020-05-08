import apiR6 from '../../config/apiR6';
import Cache from '../../config/Cache';

class R6PlayerInfoController {
  async index(req, res) {
    const { username, platform, type } = req.query;

    // const cached = await Cache.get('playerInfo');
    // if (cached) {
    //   return res.json(cached);
    // }

    const playerInfo = await apiR6.get(`stats/${username}/${platform}/${type}`);

    // await Cache.set('playerInfo', playerInfo);

    return res.json(playerInfo.data);
  }
}

export default new R6PlayerInfoController();
