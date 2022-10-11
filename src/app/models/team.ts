import { PermissionData } from './permission';
import { Deserializable } from './deserializable';
import { Base } from './base';
import { ProjectRole } from './service';

// tslint:disable: variable-name

export class TeamMember implements Base, Deserializable {
  user_uuid?: string;
  user_role?: string;
  user_role_id?: string;
  first_name?: string;
  role?: ProjectRole;
  last_name?: string;
  /** Boolean value which shows if we've sent reminder email in the last 24 hours */
  flag_remind: boolean;
  name?: string;
  role_id?: string;
  user_payout?: any;
  flag_exists_in_contract: boolean;
  flag_accepted?: boolean;
  user_auth_email?: string;
  contract_status?: string;
  permission?: PermissionData;
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
  };
  is_owner?: boolean;

  deserialize(input: any) {
    Object.assign(this, input);
    if(this.role) {
      this.role = new ProjectRole(input.role);
    }
    return this;
  }
}

export class Contract implements Base, Deserializable {
  contract_uuid?: string;
  flag_status?: any;
  project_uuid?: any;
  account_uuid?: any;
  ledger_uuid?: any;
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
  };
  contract_users?: TeamMember[];
  contract_invites?: {
    invite_email: string;
    invite_name: string;
    invite_payout: number;
    invite_role: string;
    invite_uuid: string;
    /** Boolean value which shows if we've sent reminder email in the last 24 hours */
    flag_remind: boolean;
  }[];
  contract_permission_users?: {
    name: string;
    is_owner: boolean;
    user_uuid: string;
    primary_email: {
      flag_primary: 1 | 0;
      flag_verified: 1 | 0;
      user_auth_email: string;
    }
  }[];

  constructor() {
    this.contract_users = new Array<TeamMember>(0);
    this.contract_invites = new Array(0);
  }

  deserialize(input: any) {
    Object.assign(this, input);

    if (input.contract_users !== undefined) {
      this.contract_users = input.contract_users.map(user => new TeamMember().deserialize(user));
    }

    return this;
  }
}

export class ContractMember {
  name: string;
  email: string;
  payout: number;
  role: string | ProjectRole;
  uuid?: string;
  isOwner?: boolean;

  static serialize(input: any) {
    const req = {
      name: input.name,
      email: input.email,
      payout: input.payout,
      role_id: input.role.dataUUID,
      role: input.role.dataRole,
      uuid: input.uuid
  };
  Object.keys(req).forEach(key => req[key] === undefined && delete req[key]);

  return req;
  }
}

export class Team implements Base, Deserializable {
  team_uuid?: string;
  project_uuid?: string;
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
  };
  users?: TeamMember[];
  invite?: {
    invite_email: string;
    invite_name: string;
    invite_payout: number;
    invite_role: string;
    invite_uuid: string;
    flag_remind: boolean;
    flag_remind_in: string;
    stamp_created: number;
    project_role_uuid?: string;
    stamp_created_by: number;
    stamp_updated: number;
    stamp_updated_by: number;
    stamp_remind?: number;
  }[];

  constructor() {
    this.users = new Array<TeamMember>(0);
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.users = input.users.map(user => new TeamMember().deserialize(user));
    return this;
  }
}
