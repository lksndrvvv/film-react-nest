import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { MongoFilmsRepository } from '../repository/mongo-films.repository';
import { SessionDto } from '../films/dto/films.dto';

import {
  BookedTicketDto,
  CreateOrderDto,
  OrderResponseDto,
  OrderTicketDto,
} from './dto/order.dto';

interface ReservationGroup {
  film: string;
  session: string;
  seats: string[];
  details: SessionDto;
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: MongoFilmsRepository) {}

  async createOrder(order: CreateOrderDto): Promise<OrderResponseDto> {
    if (
      !order ||
      typeof order.email !== 'string' ||
      !order.email.trim() ||
      typeof order.phone !== 'string' ||
      !order.phone.trim() ||
      !Array.isArray(order.tickets) ||
      order.tickets.length === 0
    ) {
      throw new BadRequestException('Некорректные данные заказа');
    }

    const groups = new Map<string, ReservationGroup>();
    const selectedSeats = new Set<string>();

    for (const ticket of order.tickets) {
      if (
        !ticket ||
        typeof ticket.film !== 'string' ||
        !ticket.film ||
        typeof ticket.session !== 'string' ||
        !ticket.session ||
        !Number.isInteger(ticket.row) ||
        !Number.isInteger(ticket.seat)
      ) {
        throw new BadRequestException('Некорректные данные билета');
      }

      const seatKey = `${ticket.row}:${ticket.seat}`;
      const groupKey = `${ticket.film}:${ticket.session}`;
      const uniqueKey = `${groupKey}:${seatKey}`;

      if (selectedSeats.has(uniqueKey)) {
        throw new BadRequestException(
          'В заказе повторяется одно и то же место',
        );
      }

      selectedSeats.add(uniqueKey);

      let group = groups.get(groupKey);

      if (!group) {
        const session = await this.filmsRepository.findSession(
          ticket.film,
          ticket.session,
        );

        if (!session) {
          throw new BadRequestException('Фильм или сеанс не найден');
        }

        group = {
          film: ticket.film,
          session: ticket.session,
          seats: [],
          details: session,
        };

        groups.set(groupKey, group);
      }

      if (
        ticket.row < 1 ||
        ticket.row > group.details.rows ||
        ticket.seat < 1 ||
        ticket.seat > group.details.seats
      ) {
        throw new BadRequestException('Указано несуществующее место');
      }

      if (group.details.taken.includes(seatKey)) {
        throw new BadRequestException('Это место уже забронировано');
      }

      group.seats.push(seatKey);
    }

    const completedReservations: ReservationGroup[] = [];

    try {
      for (const group of groups.values()) {
        const reserved = await this.filmsRepository.reserveSeats(
          group.film,
          group.session,
          group.seats,
        );

        if (!reserved) {
          throw new BadRequestException(
            'Одно или несколько мест уже забронированы',
          );
        }

        completedReservations.push(group);
      }
    } catch (error) {
      for (const group of completedReservations.reverse()) {
        await this.filmsRepository.releaseSeats(
          group.film,
          group.session,
          group.seats,
        );
      }

      throw error;
    }

    const items: BookedTicketDto[] = order.tickets.map(
      (ticket: OrderTicketDto) => {
        const groupKey = `${ticket.film}:${ticket.session}`;
        const group = groups.get(groupKey);

        if (!group) {
          throw new BadRequestException('Не удалось подтвердить билет');
        }

        return {
          id: randomUUID(),
          film: ticket.film,
          session: ticket.session,
          daytime: group.details.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: group.details.price,
        };
      },
    );

    return {
      total: items.length,
      items,
    };
  }
}
