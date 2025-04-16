import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const emailCheck = await this.db
      .getPool()
      .query('SELECT id FROM users WHERE email = $1', [dto.email]);

    if (emailCheck.rowCount > 0) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const result = await this.db.getPool().query(
      `INSERT INTO users (first_name, last_name, age, email, password)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, age, email`,
      [dto.firstName, dto.lastName, dto.age, dto.email, hashedPassword],
    );
    const user = result.rows[0];
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const result = await this.db
      .getPool()
      .query(`SELECT * FROM users WHERE email = $1`, [dto.email]);
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id });
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, access_token: token };
  }
}
