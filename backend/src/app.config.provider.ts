import { ConfigService } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: 'CONFIG',

  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER', 'mongodb'),

      url: configService.get<string>(
        'DATABASE_URL',
        'mongodb://127.0.0.1:27017/prac',
      ),
    },
  }),

  inject: [ConfigService],
};
