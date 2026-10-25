import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';

export const mongoConnectionProvider: Provider = {
  provide: 'MONGO_CONNECTION',

  inject: [ConfigService],

  useFactory: async (configService: ConfigService): Promise<Connection> => {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

    const connection = createConnection(databaseUrl);

    return connection.asPromise();
  },
};
