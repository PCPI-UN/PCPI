import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { GetUsersDto } from '../dto/get-users.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(getUsersDto: GetUsersDto) {
    const { page = 1, limit = 10, includeInactive = false } = getUsersDto;
    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
      includeInactive,
    });

    return {
      data: users,
      meta: {
        totalItems: total,
        itemsOnPage: users.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
