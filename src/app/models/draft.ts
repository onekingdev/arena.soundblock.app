import { Base } from './base';
import { Deserializable } from './deserializable';
import { Service } from './service';
import { ProjectArtist } from './project';

// tslint:disable: variable-name

export class Payout {
  name: any;
  email: any;
  role: any;
  payout: number;
}

export class CustomContract implements Deserializable {
  payment_message?: string;
  name?: string;
  email?: string;
  phone?: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class Payment implements Deserializable {
  members?: Payout[];
  custom_contract_rules?: CustomContract;

  constructor() {
    this.members = new Array<Payout>(0);
    this.custom_contract_rules = new CustomContract();
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.custom_contract_rules = new CustomContract().deserialize(input.custom_contract_rules);
    return this;
  }
}

export class ProjectInfo implements Deserializable {
  project_title?: string;
  artwork?: string;
  project_date?: Date;
  genre_primary?: any[];
  project_subgenrs?: any[];
  project_label?: string;
  project_artist?: string;
  project_upc?: string;
  format_id?: string;
  project_title_release?: string;
  project_recording_location?: string;
  project_recording_year?: string;
  project_copyright_name?: string;
  project_copyright_year?: string;
  flag_project_compilation?: boolean;
  flag_project_explicit?: boolean;
  artists: ProjectArtist[];
  project_language?: string;
  project_volumes?: number;
  genre_secondary?: any[];

  constructor() {
  }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class Draft implements Deserializable {
  account: Service;
  draft?: string;
  service?: Service;
  project?: ProjectInfo;

  constructor() {
    this.account = '' as any;
    this.project = new ProjectInfo();
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.project = new ProjectInfo().deserialize(input.project);
    return this;
  }
}

export interface DraftData extends Base {
  draft_json: {
    project: {
      project_avatar: string;
      project_date: string;
      project_title: string;
      project_type: string;
    };
    step: number;
  };
  draft_uuid: string;
  account: {
    data: {
      payment: any[];
      account_name: string;
      account_uuid: string;
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
    };
  };
}
