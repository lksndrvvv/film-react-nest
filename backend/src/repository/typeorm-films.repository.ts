import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { Film } from './film.entity';
import { Schedule } from './schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class TypeOrmFilmsRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly films: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly schedules: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.films.find();

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

  private toSessionDto(session: Schedule): SessionDto {
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

  async findSchedule(filmId: string): Promise<SessionDto[] | undefined> {
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(filmId)) {
      return undefined;
    }

    const film = await this.films.findOneBy({ id: filmId });

    if (!film) {
      return undefined;
    }

    const sessions = await this.schedules.find({
      where: { film: { id: filmId } },
    });

    return sessions.map((session) => this.toSessionDto(session));
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<SessionDto | undefined> {
    if (
      !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(filmId) ||
      !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(sessionId)
    ) {
      return undefined;
    }
    const session = await this.schedules.findOne({
      where: {
        id: sessionId,
        film: { id: filmId },
      },
    });

    return session ? this.toSessionDto(session) : undefined;
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const session = await manager.findOne(Schedule, {
        where: {
          id: sessionId,
          film: { id: filmId },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!session) {
        return false;
      }

      if (seats.some((seat) => session.taken.includes(seat))) {
        return false;
      }

      session.taken = [...session.taken, ...seats];

      await manager.save(session);

      return true;
    });
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const session = await manager.findOne(Schedule, {
        where: {
          id: sessionId,
          film: { id: filmId },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!session) {
        return;
      }

      session.taken = session.taken.filter((seat) => !seats.includes(seat));

      await manager.save(session);
    });
  }
}
