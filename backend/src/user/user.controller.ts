import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto } from './dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('adduser')
  @ApiOperation({ summary: 'Add a new user' })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: 201,
    description: 'The uses has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'The user has not been created.',
  })
  async addUser(@Body() dto: UserDto) {
    return this.userService.addUser(dto);
  }

  // TODO: SECURITY: limit this only to ADMINS
  @Get('fetchallusers')
  @ApiOperation({ summary: 'Fetch all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  fetchAllUsers() {
    return this.userService.fetchAllUsers();
  }
}
