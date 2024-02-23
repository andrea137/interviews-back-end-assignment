import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async addUser(dto: UserDto) {

    try {
        const category = await this.prisma.user.create({
          data: {
            ...dto,
          },
        });
  
        return category;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('User already present.');
          } else if (error.code === 'P2003') {
            throw new ForbiddenException('Foreign key violation.');
          }
        }
        throw error;
      }
    }
  
    fetchAllUsers() {
      return this.prisma.user.findMany();
    }
}
