import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '../config';
// import logger from '../shared/utils/logger.util';

/** Warehouse Options */
const databaseOptions: DataSourceOptions = {
  type: (config.pkg.db.driver as 'mysql' | 'postgres') || 'mysql',
  host: config.pkg.db.warehouse.host,
  port: Number(config.pkg.db.warehouse.port),
  username: config.pkg.db.warehouse.user,
  password: config.pkg.db.warehouse.pass,
  database: config.pkg.db.warehouse.name,
  synchronize: config.pkg.db.synchronize ?? false,
  logging: config.pkg.db.logging ?? false,
  ssl: config.pkg.db.ssl ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/models/*{.entity,}{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/*{.ts,.js}'],
  connectTimeout: config.pkg.db.connectTimeout, // 10 detik: gagal cepat & jelas jika handshake macet
  extra: {
    connectionLimit: 20, // Maximum connections in pool
    queueLimit: 0,
    waitForConnections: true,
  },
};


// Inisialisasi Instance TypeORM DataSource
export const OpenDataSource = new DataSource(databaseOptions);
/** Initial all database connection*/
export const initializeDatabases = async (): Promise<void> => {
  try {
    if (!OpenDataSource.isInitialized) {
      await OpenDataSource.initialize();
      console.log(
        `[Database] Connected to Database (${config.pkg.db.name}) on port ${config.pkg.db.port}`
      );
    }

  } catch (error: any) {
    console.error(`[Database] Initialization failed: ${error.message}`, {
      stack: error.stack,
    });
    throw error;
  }
};

// Close connect all database
export const closeDatabases = async (): Promise<void> => {
  try {
    if (OpenDataSource.isInitialized) {
      await OpenDataSource.destroy();
      console.log(`[Database] ${config.pkg.db.name}  DB connection closed.`);
    }
  } catch (error: any) {
    console.error(
      `[Database] Error while closing connections: ${error.message}`
    );
  }
};

export default { OpenDataSource };
