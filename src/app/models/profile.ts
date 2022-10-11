import { Base } from './base';

export interface AliasInfo extends Base {
  alias_uuid: string;
  flag_primary: 0 | 1;
  user_alias: string;
  user_uuid: string;
}

export interface BankingInfo extends Base {
  account_number: string;
  account_type: string;
  bank_name: string;
  bank_uuid: string;
  flag_primary: 0 | 1;
  routing_number: string;
  user_uuid: string;
}

export interface PaypalInfo extends Base {
  flag_primary: 0 | 1;
  paypal: string;
  paypal_uuid: string;
  user_uuid: string;
}

export interface PhoneInfo extends Base {
  flag_primary: 0 | 1;
  phone_number: string;
  phone_type: string;
  row_uuid: string;
  user_uuid: string;
}

export class PhoneInfoResponse {
  data: {
    data: PhoneInfo[];
  }
}

export interface AddressInfo extends Base {
  flag_primary: 0 | 1;
  postal_city: string;
  postal_country: string;
  postal_street: string;
  postal_type: string;
  postal_uuid: string;
  postal_zipcode: string;
  row_uuid: string;
  user_uuid: string;
}

export class AddressInfoResponse {
  data: {
    data: AddressInfo[];
  }
}

export interface EmailInfo {
  flag_primary: 0 | 1;
  flag_verified: 0 | 1;
  row_uuid: string;
  user_auth_email: string;
}

export class EmailInfoResponse {
  data: {
    data: EmailInfo[];
  }
}

export interface Profile extends Base {
  aliases: AliasInfo[];
  avatar: string;
  flag_avatar: 0 | 1;
  bankings: BankingInfo[];
  emails: EmailInfo[];
  name: string;
  name_first: string;
  name_last: string;
  name_middle: string;
  paypals: PaypalInfo[];
  phones: PhoneInfo[];
  postals: AddressInfo[];
  user_uuid: string;
}
