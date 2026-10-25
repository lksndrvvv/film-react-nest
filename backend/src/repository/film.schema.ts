import { Schema } from 'mongoose';

import { FilmDto, SessionDto } from '../films/dto/films.dto';

export interface FilmEntity extends FilmDto {
  schedule: SessionDto[];
}

export const SessionSchema = new Schema<SessionDto>(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: Number, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  {
    _id: false,
    id: false,
  },
);

export const FilmSchema = new Schema<FilmEntity>(
  {
    id: { type: String, required: true, unique: true },
    rating: { type: Number, required: true },
    director: { type: String, required: true },
    tags: { type: [String], required: true },
    title: { type: String, required: true },
    about: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    cover: { type: String, required: true },
    schedule: {
      type: [SessionSchema],
      default: [],
    },
  },
  {
    collection: 'films',
    versionKey: false,
    id: false,
  },
);
