import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

import { FilmDto, SessionDto } from '../films/dto/films.dto';

import { FilmEntity, FilmSchema } from './film.schema';

@Injectable()
export class MongoFilmsRepository {
  private readonly filmModel: Model<FilmEntity>;

  constructor(
    @Inject('MONGO_CONNECTION')
    connection: Connection,
  ) {
    this.filmModel = connection.model<FilmEntity>('Film', FilmSchema, 'films');
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().exec();

    return films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
  }

  async findSchedule(filmId: string): Promise<SessionDto[] | undefined> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();

    if (!film) {
      return undefined;
    }

    return film.schedule.map((session) => ({
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken,
    }));
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<SessionDto | undefined> {
    const film = await this.filmModel
      .findOne({
        id: filmId,
        'schedule.id': sessionId,
      })
      .exec();

    if (!film) {
      return undefined;
    }

    const session = film.schedule.find((item) => item.id === sessionId);

    if (!session) {
      return undefined;
    }

    return {
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken,
    };
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $nin: seats },
            },
          },
        },
        {
          $addToSet: {
            'schedule.$.taken': {
              $each: seats,
            },
          },
        },
      )
      .exec();

    return result.modifiedCount === 1;
  }
  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.filmModel
      .updateOne(
        {
          id: filmId,
          'schedule.id': sessionId,
        },
        {
          $pull: {
            'schedule.$.taken': {
              $in: seats,
            },
          },
        },
      )
      .exec();
  }
}
