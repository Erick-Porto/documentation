import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Progress } from './schemas/progress.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Progress.name) private progressModel: Model<Progress>,
    ){}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        const savedUser = await createdUser.save();
        const userObj = savedUser.toObject();
        delete (userObj as any).password;
        return userObj as User;
    }

    async findAll(): Promise<any[]> {
    const users = await this.userModel
      .find()
      .populate('sector corpRoles')
      .select('-password')
      .lean()
      .exec();

    const allProgress = await this.progressModel.find().lean().exec();
    return users.map(user => ({
      ...user,
      progress: allProgress.filter(p => p.userId.toString() === user._id.toString())
    }));
  }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel
        .findById(id)
        .populate('sector corpRoles')
        .select('-password')
        .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userModel
        .findOne({ email })
        .populate('sector corpRoles')
        .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { returnDocument: 'after' })
            .select('-password')
            .exec();

        if (!updatedUser) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        return updatedUser;
    }

    async remove(id: string): Promise<void> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
    }

    async completeDocument(userId: string, docId: string): Promise<Progress> {
    return this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), docId: new Types.ObjectId(docId) },
      { isCompleted: true },
      { returnDocument: 'after', upsert: true }
    ).exec();
  }

    async updateProgress(userId: string, docId: string, percentage: number): Promise<Progress> {
        const isCompleted = percentage >= 1;

        const updateData: any = {
            $max: { highestPercentage: percentage }
        };

        if (isCompleted) {
            updateData.$set = { isCompleted: true };
        }

        return this.progressModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), docId: new Types.ObjectId(docId) },
            updateData,
            { returnDocument: 'after', upsert: true }
        ).exec();
    }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate('sector corpRoles')
      .select('-password')
      .lean()
      .exec();
      
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const progressHistory = await this.progressModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'docId',
        select: 'title badgeIcon badgeName targetSector',
      })
      .lean()
      .exec();

    return { ...user, progress: progressHistory };
  }
}
