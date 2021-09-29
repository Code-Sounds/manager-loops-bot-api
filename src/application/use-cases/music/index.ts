import dotenv from "dotenv";
dotenv.config();

import { CreateMusicInputType } from "../../../domain/music/types";
import { IMusicUseCases } from "../../../domain/music/use-cases";
import { generateUUID } from "../../../helpers";
import { left, right } from "../../../_shared/either";
import { isValidUrl } from "../../../_shared/validations";
import { IMusicRepository } from "../../repositories/music";
import { IMusicServices } from "../../services/music";
import { InvalidUrlError } from "./errors/invalid-url-error";
import { AddMusicResponse } from "./ports";

const saveYTMusicFrom = process.env.FILES_YOUTUBE_PATH as string;
const saveFirebaseMusicFrom = process.env.FILES_FIREBASE_PATH as string;

export class MusicUseCases implements IMusicUseCases {
  private readonly musicRepository: IMusicRepository;
  private readonly musicServices: IMusicServices;

  constructor(musicRepository: IMusicRepository, musicServices: IMusicServices) {
    this.musicRepository = musicRepository;
    this.musicServices = musicServices;
  }

  async addMusic(music: CreateMusicInputType): Promise<AddMusicResponse> {
    const urlValidation = isValidUrl(music.url);

    if (!urlValidation) {
      return left(new InvalidUrlError(music.url));
    }

    const infos = await this.musicServices.getMusicInfosByUrl(music.url);
    const id = generateUUID();

    await this.musicRepository.addMusic({
      artist: music.artist,
      url: music.url,
      name: infos.name,
      id,
    });

    const musicPath = `${saveYTMusicFrom}/${id}.mp3`;

    await this.musicServices.downloadUrlMusic({
      saveName: id,
      saveToPath: musicPath,
      url: music.url,
      fn: async () => {
        await this.musicServices.uploadMusic({
          filePath: musicPath,
          saveName: `${id}.mp3`,
        });
      },
    });

    return right(infos);
  }
}
