import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { FilmsController } from './films/films.controller';
import { FilmsService } from './films/films.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

import { DatabaseModule } from './repository/database.module';
import { TypeOrmFilmsRepository } from './repository/typeorm-films.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [
    FilmsService,
    OrderService,
    TypeOrmFilmsRepository,
    {
      provide: 'AppRepository',
      useExisting: TypeOrmFilmsRepository,
    },
  ],
})
export class AppModule {}
