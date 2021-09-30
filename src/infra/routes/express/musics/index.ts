import { Router } from "express";

import { adaptRoute, adaptRouteWithSendFileStream } from "../../../adapters/express-adapter";
import {
  makeAddMusicController,
  makeDownloadMusicFileController,
  makeGetMusicsController,
} from "../../../adapters/makers/musics";
import { authMiddleware } from "../middlewares/auth";

export const musicRouter: Router = Router();

musicRouter.post("/add", authMiddleware, adaptRoute(makeAddMusicController()));
musicRouter.get("/list", adaptRoute(makeGetMusicsController()));
musicRouter.get("/download/:id", adaptRouteWithSendFileStream(makeDownloadMusicFileController()));
