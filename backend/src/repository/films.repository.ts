import { FilmDto, SessionDto } from '../films/dto/films.dto';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findSchedule(filmId: string): Promise<SessionDto[] | undefined>;
  findSession(
    filmId: string,
    sessionId: string,
  ): Promise<SessionDto | undefined>;
  reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean>;
  releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void>;
}
