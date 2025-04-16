import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SearchDto } from './dto/search.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Search users',
  })
  async search(@Query() dto: SearchDto) {
    const users = await this.usersService.searchUsers(dto);
    return { users };
  }
}
