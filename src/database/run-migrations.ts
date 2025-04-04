import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

// Create a new DataSource
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ehealthsuite',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});

// Run migrations
AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    
    try {
      await AppDataSource.runMigrations();
      console.log('Migrations have been executed successfully!');
    } catch (error) {
      console.error('Error during migration:', error);
    } finally {
      await AppDataSource.destroy();
      console.log('Data Source has been destroyed!');
    }
  })
  .catch((error) => console.log('Error during Data Source initialization:', error)); 