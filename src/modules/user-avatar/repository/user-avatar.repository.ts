import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { AbstractRepository } from '../../../configurations/database';
import { UserAvatar, UserAvatarDocument } from '../entities/user-avatar.entity';

@Injectable()
export class UserAvatarRepository extends AbstractRepository<UserAvatar> {
  protected readonly logger = new Logger(UserAvatarRepository.name);
  constructor(
    @InjectModel(UserAvatar.name)
    UserAvatarModel: Model<UserAvatar>,
  ) {
    super(UserAvatarModel);
  }

  async findOneBy(
    filterQuery: FilterQuery<UserAvatarDocument>,
  ): Promise<UserAvatarDocument> {
    return await this.model.findOne(filterQuery);
  }

  async findById(id: string): Promise<UserAvatarDocument> {
    return await this.model.findById(id);
  }
}
