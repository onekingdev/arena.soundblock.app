import { Deserializable } from './deserializable';
import { CollectionFile, Contributor } from './collection';
import { Base } from './base';
import { Service, ProjectFormat, Language, Genre } from './service';

export enum ProjectTab {
  'INFO' = 'info',
  'MUSIC' = 'tracks',
  'TRACK_PREVIEWS' = 'Track Previews',
  'VIDEO' = 'video',
  'MERCH' = 'merch',
  'FILES' = 'files',
}
export enum DatabaseTab {
  'ARTIST' = 'Artists',
  'ARTIST_PUBLISHER' = 'Publishers'
}

export class EditableTrackItemsFlag {
recodingYear?: boolean;
recordngLocation?: boolean;
copyrightName?: boolean;
copyrightLocation?: boolean;
rightsOwner?: boolean;
rightsHolder?: boolean;
rightsDate?: boolean;
countryRecording?: boolean;
countryComissioning?: boolean;
}

export interface InviteInfo {
  invite_email: string;
  invite_hash: string;
  invite_name: string;
  invite_role: string;
  invite_uuid: string;
  payout: number;
  project: {
    project_artwork: string;
    project_date: string;
    project_title: string;
    project_type: string;
    project_uuid: string;
  };
  account: Service; // TODO
}

export interface ProjectTrack extends Base, CollectionFile {
  track_duration: number;
  file_category: string;
  file_md5: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_sortby: string;
  file_title: string;
  file_uuid: string;
  ledger_id: any;
  ledger_uuid: string;
}

export interface EditProjectRequest {
title?: string;
label?: string;
date?: Date | string;
genre_primary?: string;
genre_secondary?: string;
project_language?: string;
flag_project_compilation?: boolean;
flag_project_explicit?: boolean;
project_recording_location?: string;
project_recording_year?: string;
project_copyright_name?: string;
artists?: any;
project_copyright_year?: string;
upc?: string;
}

// tslint:disable: variable-name
export class Project implements Base, Deserializable {
  project_uuid?: string;
  project_title?: string;
  artwork?: string;
  ledger_uuid?: string;
  project_type?: any;
  genre_primary_uuid?: string;
  genre_secondary_uuid?: string;
  project_date?: string;
  project_recording_location?: string;
  project_recording_year?: string;
  project_language_uuid?: string;
  project_copyright_name?: string;
  project_copyright_year?: string;
  project_label?: string;
  project_upc?: string;
  project_subgenres?: any[];
  project_genre?: any;
  project_artist?: string;
  project_title_release?: string;
  project_volumes?: number;
  primary_genre?: Genre;
  secondary_genre?: Genre;
  flag_project_compilation?: boolean;
  flag_project_explicit?: boolean;
  language?: Language;
  artist?: any;
  format?: ProjectFormat;
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
  status?: {
    contract: any,
    deployment: any,
    exists_collection: boolean,
    flag_team: boolean,
    team_uuid: string;
  };
  account?: {
    accounting_version: number;
    flag_status: string;
    account_holder: string;
    account_name: string;
    account_uuid: string;
    user_uuid: string;
  };
  account_uuid: string;
  tracks?: ProjectTrack[];
  collections?: any;
  deployments?: any;
  platforms?: any;
  artists?: Artist[];
  team_role: string;
  flag_contract?: boolean;

  constructor() { }

  deserialize(input: any) {
    Object.assign(this, input);
    this.format = new ProjectFormat(input.format);
    this.language = new Language(input.language);
    this.primary_genre = new Genre(input.primary_genre);
    this.secondary_genre = new Genre(input.secondary_genre);
    return this;
  }

  get serviceName() {
    if (!this.account) { return ''; }
    return this.account.account_name;
  }
}


export class Projects implements Deserializable {
  data: Project[];
  meta?: {
    current_page: number,
    from: number,
    last_page: number,
    path: string,
    per_page: number,
    to: number,
    total: number
  };
  links?: {
    first: string,
    last: string,
    next: string,
    prev: string
  };
  status?: {
    app: string,
    code: number,
    message: string,
  };

  constructor() {
    this.data = new Array<Project>(0);
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.data = input?.data?.data?.map(project => new Project().deserialize(project));
    this.meta = input.data;
    return this;
  }

}

// tslint:disable: variable-name
export class Announcement implements Base, Deserializable {
  announcement_message: string;
  announcement_title: string;
  announcement_uuid: string;
  flag_email: number;
  flag_homepage: number;
  flag_projectspage: number;
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
  }
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
  }

  constructor() { }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class AddArtistFlags {
  spotify: string;
  soundcloud: string;
  apple: string;
}
export class Artist implements Deserializable {
  artist_uuid?: string;
  account_uuid?: string;
  artist_name: string;
  stamp_created?: number;
  url_spotify?: string;
  url_soundcloud?: string;
  url_apple?: string;
  avatar_url?: string;
  stamp_created_by?: {
    uuid: string,
    name: string,
  };
  stamp_updated?: number;
  stamp_updated_by?: {
    uuid: string,
    name: string,
  }
  editable?: boolean;
  selected?: boolean;
  artist_type?: string;

  constructor() { }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  } 
}

export class ArtistPublisher implements Deserializable {
  publisher_uuid: string;
  account_uuid: string;
  artist_uuid: string;
  publisher_name: string;
  stamp_created: number;
  stamp_created_by: {
    uuid: string,
    name: string,
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string,
    name: string,
  }
  editable?: boolean;

  constructor() { }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  } 
}
export interface ProjectArtist {
  artist: string;
  artist_name?:string;
  avatar_url?: string;
  type:string;
  url?:string;
}

export interface ProjectSelectedArtist{
  artist_uuid: string;
  artist_type: string;
  artist_name: string;
}

export class ServiceArtistResponse implements Deserializable {
  data: Artist[];
    deserialize(input: any) {
    Object.assign(this, input);
    this.data = input.data.map(artist => new Artist().deserialize(artist));
    return this;
  }
}
export class AccountArtistPublishersResponse implements Deserializable {
  data: ArtistPublisher[];
    deserialize(input: any) {
    Object.assign(this, input);
    this.data = input.data.map(artistPublisher => new ArtistPublisher().deserialize(artistPublisher));
    return this;
  }
}


export class ArtistPublisherResponse implements Deserializable {
  data: ArtistPublisher[];
    deserialize(input: any) {
    Object.assign(this, input);
    this.data = input.data.map(artist => new ArtistPublisher().deserialize(artist));
    return this;
  }
}


export class TrackContributorResponse implements Deserializable {
  data: Contributor[];
    deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class AddTrackArtistResponse {
  data: Artist[];
}
export class Announcements implements Deserializable {
  current_page: number;
  data: Announcement[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: [
    {
      active: boolean;
      label: string;
      url: string;
    }
  ];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
  total: number;

  constructor() {
    this.data = new Array<Announcement>(0);
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.data = input.data.map(announcement => new Announcement().deserialize(announcement));
    return this;
  }
}