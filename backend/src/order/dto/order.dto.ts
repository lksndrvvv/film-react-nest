export class OrderTicketDto {
  film: string;
  session: string;
  row: number;
  seat: number;
}

export class CreateOrderDto {
  email: string;
  phone: string;
  tickets: OrderTicketDto[];
}

export class BookedTicketDto {
  id: string;
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

export class OrderResponseDto {
  total: number;
  items: BookedTicketDto[];
}
