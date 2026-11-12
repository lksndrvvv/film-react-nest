import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';

import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('AppRepository')
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async getFilms(): Promise<FilmsResponseDto> {
    const films = await this.filmsRepository.findAll();

    return {
      total: films.length,
      items: films,
    };
  }

  async getSchedule(filmId: string): Promise<ScheduleResponseDto> {
    const schedule = await this.filmsRepository.findSchedule(filmId);

    if (!schedule) {
      throw new NotFoundException('Фильм не найден');
    }

    return {
      total: schedule.length,
      items: schedule,
    };
  }
}
