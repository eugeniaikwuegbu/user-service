import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../../../configurations/database';
import { User, UserDocument } from '../entities/user.entity';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(User.name)
    UsersModel: Model<User>,
  ) {
    super(UsersModel);
  }

  async findById(id: string): Promise<UserDocument> {
    return await this.model.findById(id);
  }
}
