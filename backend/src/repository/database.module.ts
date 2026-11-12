import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Film } from './film.entity';
import { Schedule } from './schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const driver = configService.getOrThrow<string>('DATABASE_DRIVER');

        if (driver !== 'postgres') {
          throw new Error('DATABASE_DRIVER должен быть postgres');
        }

        const url = new URL(configService.getOrThrow<string>('DATABASE_URL'));
        return {
          type: driver,
          host: url.hostname,
          port: Number(url.port || 5432),
          database: url.pathname.slice(1),
          username: configService.getOrThrow<string>('DATABASE_USERNAME'),
          password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
