import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { OrderService } from './order.service';

import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(200)
  createOrder(@Body() order: CreateOrderDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(order);
  }
}
