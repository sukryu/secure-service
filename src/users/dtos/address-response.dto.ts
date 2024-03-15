import { Address } from "@prisma/client";

export class AddressResponseDto {
  id: number;
  houseNumber: string;
  street: string;
  city: string;
  district: string;
  pincode: string;
  landmark: string;

  constructor(address: Partial<Address>) {
    this.id = address.id;
    this.houseNumber = address.houseNumber;
    this.street = address.street;
    this.city = address.city;
    this.district = address.district;
    this.pincode = address.pincode;
    this.landmark = address.landmark;
  }
}