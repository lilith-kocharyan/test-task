import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SearchDto } from './dto/search.dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async searchUsers(dto: SearchDto): Promise<IUser[]> {
    const { firstName, lastName, age } = dto;

    let query =
      'SELECT id, first_name, last_name, age, email, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (firstName) {
      //params.length + 1 dynamically calculates the position of the placeholder
      query += ` AND first_name ILIKE $${params.length + 1}`;
      params.push(`%${firstName}%`);
    }

    if (lastName) {
      query += ` AND last_name ILIKE $${params.length + 1}`;
      params.push(`%${lastName}%`);
    }

    if (age) {
      query += ` AND age = $${params.length + 1}`;
      params.push(age);
    }

    const result = await this.db.getPool().query(query, params);

    return result.rows; // Return matching users
  }
}
