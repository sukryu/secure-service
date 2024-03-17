import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { IUsersService } from "./users";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto } from "./dtos/user/create-user.dto";
import { Address, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dtos/user/update-user.dto";
import { RedisService } from "src/redis/redis.service";
import { ConfigService } from "@nestjs/config";
import { UserResponseDto } from "./dtos/user-response.dto";
import { AddressResponseDto } from "./dtos/address-response.dto";
import { AddAddressDto } from "./dtos/address/add-address.dto";
import { UpdateAddressDto } from "./dtos/address/update-address.dto";

@Injectable()
export class UsersService implements IUsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly bcryptSaltRounds: number;
  private readonly redisExpiresTime: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configSerivce: ConfigService,
  ) {
    this.bcryptSaltRounds = this.configSerivce.get<number>('BCRYPT_SALT_ROUNDS', 10);
    this.redisExpiresTime = this.configSerivce.get<number>('REDIS_EXPIRE_TIME', 3600);
  }

  async create(createProfile: CreateUserDto): Promise<UserResponseDto> {
    const { email, username, password, phone } = createProfile;
    const isExists = await this.prisma.user.findUnique({ where: { email }});

    if (isExists) {
      throw new BadRequestException(`User email already signed in`);
    }

    const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        phone,
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
      }
    });

    await this.redis.set(`user:${user.id}`, JSON.stringify(user), this.redisExpiresTime);
    await this.logger.debug(`[SUCCESS] => User created : ${user.id}`);
    return new UserResponseDto(user);
  }

  async update(userId: number, updatedProfile: UpdateUserDto): Promise<UserResponseDto> {
    const { email, username, password, phone } = updatedProfile;
    let updatedData: any = {};
    
    await this.verifyUser(userId);

    if (email) updatedData.email = email;
    if (username) updatedData.username = username;
    if (password) {
      updatedData.hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);
    }
    if (phone) updatedData.phone = phone;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updatedData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
      }
    });

    await this.redis.set(`user:${updatedUser.id}`, JSON.stringify(updatedUser), this.redisExpiresTime);
    await this.logger.debug(`[SUCCESS] => User updated: ${updatedUser.id}`);
    return new UserResponseDto(updatedUser);
  }

  async delete(userId: number): Promise<void> {

    await this.verifyUser(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    await this.redis.del(`user:${userId}`);
    this.logger.debug(`[SUCCESS] => Delete User : ${userId}`);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.is_deleted === true) {
      this.logger.error(`Invalid credentials`);
      throw new BadRequestException(`Invalid credentials`);
    }

    const getCacheUser = await this.redis.get(`user:${user.id}`);
    if (!getCacheUser) {
      await this.redis.set(`user:${user.id}`, JSON.stringify(user), this.redisExpiresTime);
    }

    return user;
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    let cacheUser = await this.redis.get(`user:${userId}`);
    
    if (!cacheUser) {
      const user = await this.prisma.user.findUnique({ 
        where: { id: userId }, 
        select: {
          id: true,
          email: true,
          username: true,
          phone: true,
          is_deleted: true
        }});
      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      if (user.is_deleted) {
        throw new BadRequestException(`User has already been deleted : ${userId}`);
      }
      cacheUser = JSON.stringify(user);
    }

    const user = JSON.parse(cacheUser);

    this.logger.debug(`[SUCCESS] => User found By Id : ${userId}`);
    return new UserResponseDto(user);
  }

  async getAllUsers(page: number, limit: number): Promise<UserResponseDto[]> {
    const skip = (page - 1) * limit;
    
    const users = await this.prisma.user.findMany({
      where: { is_deleted: false },
      skip: skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
      },
    });

    return users.map(user => new UserResponseDto(user));
  }
  async AddAddress(userId: number, addAddressProfile: AddAddressDto): Promise<AddressResponseDto> {
    
    const { houseNumber, street, city, district, pincode, landmark } = addAddressProfile;

    await this.verifyUser(userId);

    const address = await this.prisma.address.create({
      data : {
        userId,
        houseNumber,
        street,
        city,
        district,
        pincode,
        landmark,
        is_deleted: false,
      },
    });

    await this.redis.set(`address:${address.id}`, JSON.stringify(address), this.redisExpiresTime);
    this.logger.debug(`[SUCCESS] => Address created : ${userId}`);
    return new AddressResponseDto(address);
  }

  async updateAddress(userId: number, addressId: number, updateProfile: UpdateAddressDto): Promise<AddressResponseDto> {
    await this.verifyUser(userId);
    await this.verifyAndCacheAddress(addressId);
    const { houseNumber, street, city, district, pincode, landmark } = updateProfile;

    let UpdateData: any = {};

    if (houseNumber) UpdateData.houseNumber = houseNumber;
    if (street) UpdateData.street = street;
    if (city) UpdateData.city = city;
    if (district) UpdateData.district = district;
    if (pincode) UpdateData.pincode = pincode;
    if (landmark) UpdateData.landmark = landmark;

    const update = await this.prisma.address.update({
      where: { id: addressId },
      data: UpdateData,
    });
    
    await this.redis.del(`address:${addressId}`);
    await this.redis.set(`address:${addressId}`, JSON.stringify(update), this.redisExpiresTime);
    this.logger.debug(`[SUCCESS] => User address updated: ${userId}`);
    return new AddressResponseDto(update);
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    await this.verifyUser(userId);
    await this.verifyAndCacheAddress(addressId);

    const deleteAd = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    await this.redis.del(`address:${addressId}`);
    await this.redis.set(`address:${addressId}`, JSON.stringify(deleteAd), this.redisExpiresTime);
    this.logger.debug(`[SUCCESS] => Address deleted: ${addressId}`);
  }

  async getAddressById(addressId: number): Promise<AddressResponseDto> {
    const address = await this.verifyAndCacheAddress(addressId);

    this.logger.debug(`[SUCCESS] => Address found`);
    return new AddressResponseDto(address);
  }

  async verifyUser(userId: number): Promise<User> {
    const cacheUser = await this.redis.get(`user:${userId}`);
    let user: User | null = null;

    if (!cacheUser) {
      user = await this.prisma.user.findUnique({ where: { id: userId }});
      if (!user) {
        this.logger.error(`User not found : ${userId}`);
        throw new NotFoundException(`User not found : ${userId}`);
      }
      if (user.is_deleted) {
        this.logger.error(`User has already been deleted : ${userId}`);
        throw new BadRequestException(`User has already been deleted : ${userId}`);
      }

      await this.redis.set(`user:${userId}`, JSON.stringify(user), this.redisExpiresTime);
    } else {
      user = JSON.parse(cacheUser);
    }

    return user;
  }

  private async verifyAndCacheAddress(addressId: number): Promise<Address> {
    let cacheAddress = await this.redis.get(`address:${addressId}`);
    let address: Address;
  
    if (!cacheAddress) {
      address = await this.prisma.address.findUnique({ where: { id: addressId } });
      if (!address) {
        this.logger.error(`Address not found : ${addressId}`);
        throw new NotFoundException(`Address not found: ${addressId}`);
      }
      if (address.is_deleted) {
        this.logger.error(`Address has already been deleted : ${addressId}`);
        throw new BadRequestException(`This address has already been deleted: ${addressId}`);
      }
      await this.redis.set(`address:${addressId}`, JSON.stringify(address), this.redisExpiresTime);
    } else {
      address = JSON.parse(cacheAddress);
    }
  
    return address;
  }
}