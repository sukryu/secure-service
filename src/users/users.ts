import { CreateUserDto } from "./dtos/user/create-user.dto";
import { UpdateUserDto } from "./dtos/user/update-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { AddAddressDto } from "./dtos/address/add-address.dto";
import { AddressResponseDto } from "./dtos/address-response.dto";
import { UpdateAddressDto } from "./dtos/address/update-address.dto";
import { User } from "@prisma/client";

export interface IUsersService {
  create(createProfile: CreateUserDto): Promise<UserResponseDto>;
  update(userId: number, updatedProfile: UpdateUserDto): Promise<UserResponseDto>;
  delete(userId: number): Promise<void>;

  getUserByEmail(email: string): Promise<User>;
  getUserById(userId: number): Promise<UserResponseDto>;
  getAllUsers(page: number, limit: number): Promise<UserResponseDto[]>;

  AddAddress(userId: number, addAddressProfile: AddAddressDto): Promise<AddressResponseDto>;
  updateAddress(userId: number, addressId: number, updateProfile: UpdateAddressDto): Promise<AddressResponseDto>;
  deleteAddress(userId: number, addressId: number): Promise<void>;

  getAddressById(addressId: number): Promise<AddressResponseDto>;
  // getAllAddressToUser
}