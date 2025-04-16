import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(private db: DatabaseService) {}

  async onModuleInit() {
    const pool = this.db.getPool();
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            age INTEGER,
            email VARCHAR(150) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS friends (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sender_id UUID REFERENCES users(id),
            receiver_id UUID REFERENCES users(id),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('✅ Tables created (if not exist)');
  }
}
