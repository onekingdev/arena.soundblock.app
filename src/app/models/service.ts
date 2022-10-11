import { Base } from './base';
import { Permission } from './permission';
import { Project } from './project';
import { Deserializable } from './deserializable';

export interface Service {
  accounting_version: number;
  flag_status: 'active' | 'canceled';
  account_holder: string;
  account_name: string;
  account_uuid: string;
  user_uuid: string;
  projects?: Project[];
}

export interface ServiceUser extends Base {
  avatar: string;
  name: string;
  user_uuid: string;
}

export interface ServiceWithProjects extends Base {
  account_name: string;
  account_uuid: string;
  flag_status?: string;
  account_holder?: string;
  user: {
    avatar: string;
    user_name: string;
    user_uuid: string;
  };
  projects?: Project[];
}

export interface ServiceData {
  permissions: Permission[];
  account: Service;
}

export interface DeleteArtistRequest {
  account: string;
  artist: string;
}
export interface DeleteArtistPublisherRequest {
  account: string;
  publisher: string;
}

export interface AddArtistRequest {
  project_uuid?: string;
  artist_name: string;
  account?: string;
  url_spotify?: string;
  avatar?: File;
  url_apple?: string;
  url_soundcloud?: string;
}

export interface AddArtistPublisherRequest {
  account?: string;
  artist: string;
  publisher_name: string;
}
export interface EditArtistRequest {
  account: string;
  artist_name: string;
  artist: string;
  url_spotify?: string;
  avatar?: File;
  url_apple?: string;
  url_soundcloud?: string;
}

export interface EditArtistPublisher {
  account: string;
  publisher_name: string;
  publisher: string;
}

export class Language {
dataUUID: string;
dataCode: string;
dataLanguage: string;
stampCreated: number;
stampCreatedBy: {
  name: string,
  uuid: string
};
stampUpdated: number;
stampUpdatedBy: {
  name: string;
  uuid: string;
}

constructor(input: any) {
if(!input)
return;

this.dataUUID = input.data_uuid;
this.dataCode = input.data_code;
this.dataLanguage = input.data_language;
this.stampCreated = input.stamp_created;
this.stampCreatedBy = input.stamp_created_by;
this.stampUpdated = input.stamp_updated;
this.stampUpdatedBy = input.stamp_updated_by;
}
}

export class ContributorType {
  dataUUID: string;
  dataContributor: string;
  stampCreated: string;
  stampUpdated: string;
  stampCreatedBy: {
    name: string,
    uuid: string
  };
  stampUpdatedBy: {
    name: string;
    uuid: string;
  }

  constructor(input: any) {
    if(!input)
    return;

    this.dataContributor = input.data_contributor;
    this.dataUUID = input.data_uuid;
    this.stampCreated = input.stamp_created;
    this.stampUpdated = input.stamp_updated;
    this.stampCreatedBy = input.stamp_created_by;
    this.stampUpdatedBy = input.stamp_updated_by;
  }
}

export class Genre {
  dataUUID: string;
  dataCode: string;
  dataGenre: string;
  flagPrimary: number;
  flagSecondary: number;
  stampCreated: string;
  stampUpdated: string;
  stampCreatedBy: {
    name: string,
    uuid: string
  };
  stampUpdatedBy: {
    name: string;
    uuid: string;
  }

  constructor(input: any) {
    if(!input)
    return;

    this.dataCode = input.data_code;
    this.dataGenre = input.data_genre;
    this.dataUUID = input.data_uuid;
    this.flagPrimary = input.flag_primary;
    this.flagSecondary = input.flag_secondary;
    this.stampCreated = input.stamp_created;
    this.stampUpdated = input.stamp_updated;
    this.stampCreatedBy = input.stamp_created_by;
    this.stampUpdatedBy = input.stamp_updated_by;
  }
}

export class ProjectFormat {
  dataUUID: string;
  dataFormat: string;
  stampCreated: string;
  stampUpdated: string;
  stampCreatedBy: {
    name: string,
    uuid: string
  };
  stampUpdatedBy: {
    name: string;
    uuid: string;
  }

  constructor(input: any) {
    if(!input)
    return;

    this.dataFormat = input.data_format;
    this.dataUUID = input.data_uuid;
    this.stampCreated = input.stamp_created;
    this.stampUpdated = input.stamp_updated;
    this.stampCreatedBy = input.stamp_created_by;
    this.stampUpdatedBy = input.stamp_updated_by;
  }

}

export class PlanTypes {
  dataUUID: string;
  planName: string;
  planRate: number;
  planDiskspace: any;
  planBandwidth: any;
  planAdditionalBandwidth: number;
  planAdditionalDiskspace: number;
  planUsers: number;
  planAdditionalUser: number;
  stampCreated: number;
  stampCreatedBy: {
    uuid: string;
    name: string;
  }
  stampUpdated: number;
  stampUpdatedBy: {
    uuid: string;
    name: string
  }

  constructor(input: any) {
    if(input) {
      this.dataUUID = input.data_uuid;
      this.planAdditionalBandwidth = input.plan_bandwidth_additional;
      this.planAdditionalDiskspace = input.plan_diskspace_additional;
      this.planAdditionalUser = input.plan_user_additional;
      this.planBandwidth = input.plan_bandwidth;
      this.planDiskspace = input.plan_diskspace;
      this.planName = input.plan_name;
      this.planRate = input.plan_rate;
      this.planUsers = input.plan_users;
      this.stampCreated = input.stamp_created;
      this.stampCreatedBy = input.stamp_created_by;
      this.stampUpdated = input.stamp_updated;
      this.stampUpdatedBy = input.stamp_updated_by;
    }
  }

}

export class ProjectRole {
  dataUUID: string;
  dataRole: string;
  stampCreated: string;
  stampUpdated: string;
  stampCreatedBy: {
    name: string,
    uuid: string
  };
  stampUpdatedBy: {
    name: string;
    uuid: string;
  }

  constructor(input: any) {
    this.dataRole = input.data_role;
    this.dataUUID = input.data_uuid;
    this.stampCreated = input.stamp_created;
    this.stampUpdated = input.stamp_updated;
    this.stampCreatedBy = input.stamp_created_by;
    this.stampUpdatedBy = input.stamp_updated_by;
  }
}