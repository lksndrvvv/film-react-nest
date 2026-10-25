import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { configProvider } from './app.config.provider';

import { FilmsController } from './films/films.controller';
import { FilmsService } from './films/films.service';

import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

import { mongoConnectionProvider } from './repository/mongo-connection.provider';

import { MongoFilmsRepository } from './repository/mongo-films.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],

  controllers: [FilmsController, OrderController],

  providers: [
    configProvider,
    mongoConnectionProvider,
    FilmsService,
    OrderService,
    MongoFilmsRepository,
  ],
})
export class AppModule {}
