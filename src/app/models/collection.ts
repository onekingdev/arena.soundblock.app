import { Deserializable } from './deserializable';
import { Base } from './base';
import { Artist, ArtistPublisher } from './project';
import { Genre, Language, ContributorType } from './service';

// tslint:disable: variable-name
export class CollectionFile implements Base, Deserializable {
  file_uuid?: string;
  file_name?: string;
  file_path?: string;
  file_title?: string;
  isChecked?: boolean;
  file_category?: string;
  title_valid?: any;
  name_valid?: any;
  file_sortby?: string;
  is_collapsed?: boolean;
  file_size?: number;
  file_sku?: string;
  file_isrc?: string;
  revertable?: boolean;
  restorable?: boolean;
  file_history?: any;
  file_track: string;
  directory_path?: string;
  trackName?: string;
  ledger_uuid?: string;
  meta: {
    file_duration: number;
    file_isrc: string;
    file_track: number;
    track_uuid?: string;
    type: string;
    file_sku: string;
    track: {
      file_title: string;
    },
    cover?: string;
    preview_start?: string;
    preview_stop?: string;
  };
  org_file_sortby?: string;
  stamp_created: number;
  stamp_created_by: {
    uuid: string;
    name: string;
    avatar?: string;
  };
  stamp_updated: number;
  stamp_updated_by: {
    uuid: string;
    name: string;
    avatar?: string;
  };
  track?: {
  preview_start?: string;
  preview_stop?: string;
  track_uuid?: string;
  track_artist?: string;
  track_duration?: number;
  language?: Language;
  lyrics?: Lyrics[];
  notes?: Note[];
  file_uuid?: string;
  ledger_uuid?: string;
  publisher?: ArtistPublisher[];
  track_language_uuid?: string;
  track_language_vocals_uuid?: string;
  track_version?: string;
  copyright_name?: string;
  copyright_year?: string;
  recording_location?: string;
  recording_year?: string;
  track_language?: string;
  track_language_vocals?: string;
  track_volume_number?: number;
  track_number?: number;
  track_release_date?: Date;
  track_isrc?: string;
  country_recording?: string;
  country_commissioning?: string;
  rights_holder?: string;
  rights_owner?: string;
  rights_contract?: string;
  flag_track_explicit?: boolean;
  flag_track_instrumental?: boolean;
  flag_allow_preorder?: boolean;
  flag_allow_preorder_preview?: boolean;
  artists?: Artist[];
  contributors?: Contributor[];
  track_contributror?: string;
  track_publisher?: string;
  primary_genre?: Genre;
  secondary_genre?: Genre;
  }

  preview_start?: string;
  preview_stop?: string;
  track_artist?: string;
  track_version?: string;
  copyright_name?: string;
  copyright_year?: string;
  recording_location?: string;
  recording_year?: string;
  track_language?: string;
  track_language_vocals?: string;
  track_volume_number?: number;
  track_release_date?: Date;
  country_recording?: string;
  country_comissioning?: string;
  rights_holder?: string;
  rights_owner?: string;
  rights_contract?: string;
  flag_track_explicit?: boolean;
  flag_track_instrumental?: boolean;
  flag_allow_preorder?: boolean;
  flag_allow_preorder_preview?: boolean;
  artists?: Artist[];
  track_contributror?: string;
  track_publisher?: string;
  genre_primary?: string;
  genre_secondary?: string;
  constructor() {
  }

  deserialize(input: any) {
    Object.assign(this, input);
    if(input.track) {
      this.track.primary_genre = new Genre(input?.track?.primary_genre);
      this.track.secondary_genre = new Genre(input?.track?.secondary_genre);
    }
    return this;
  }
}

export class Contributor {
  contributor_name: string;
  data_contributor: string;
  data_uuid: string;
}

export class Note {
  note_uuid: string;
  track_note: string;
  language_uuid: string;
}

export class Lyrics {
  lyrics_uuid: string;
  language_uuid: string;
  track_lyrics: string
}

export class OrganizeTracksRequest {
  collection: string;
  track: string;
  replace_track: string;
}
export interface AddNotesRequest {
  file: string;
  language: string;
  note: string;
}

export interface AddNotesResponse {
  data: Note;
}

export interface LyricsResponse {
  data: Lyrics;
}

export interface ArtistPublisherResponse {
  data: ArtistPublisher[];
}

export interface EditNoteRequest {
  note: string;
  note_text: string;
}

export class Track {
  preview_start?: string;
  preview_stop?: string;
  track_artist?: string;
  track_version?: string;
  copyright_name?: string;
  copyright_year?: string;
  recording_location?: string;
  recording_year?: string;
  track_language?: string;
  track_language_vocals?: string;
  track_volume_number?: number;
  track_release_date?: Date;
  country_recording?: string;
  country_comissioning?: string;
  rights_holder?: string;
  rights_owner?: string;
  rights_contract?: string;
  flag_track_explicit?: boolean;
  flag_track_instrumental?: boolean;
  flag_allow_preorder?: boolean;
  flag_allow_preorder_preview?: boolean;
  genre_primary?: string;
  genre_secondary?: string;
}

export class UpdateTrackRequest extends Track {
 project: string;
 file_uuid: string;
 
  
}

export interface AddLyricsRequest {
  file: string;
  language: string;
  lyrics: string;
}


export interface AddTrackPublisherRequest {
  file: string;
  publisher: string;
}

export interface AddTrackContributorRequest {
  file: string;
  contributor: string;
  type: string;
}


export interface AddTrackArtistRequest {
  file: string;
  type: string;
  artist: string;
}
export interface AddTrackArtistRequest {
  file: string;
  artist: string;
  type: string;
}

export interface EditLyricsRequest {
  lyrics: string;
  lyrics_text: string;
}
export interface CollectionDirectory extends Base {
  category_id: string;
  directory_name: string;
  directory_path: string;
  directory_sortby: string;
  directory_uuid: string;
  directory_parent_uuid?: string;
  size?: number;
  directory_size?: number;
  pivot: {
    collection_id: number;
    directory_id: number;
    stamp_created_at: string;
    stamp_updated_at: string;
  };
  stamp_deleted: any;
  stamp_deleted_at: any;
  stamp_deleted_by: any;
}

interface CollectionHistory extends Base {
  history_uuid: string;
  collection_uuid: string;
  history_category: string;
  history_size: number;
  file_action: string;
  history_comment: string;
}

export class Collection implements Base, Deserializable {
  collection_uuid?: string;
  project_uuid?: string;
  collection_comment?: string;
  collection_files_history_count?: number;
  ledger_uuid?: string;
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
  files?: CollectionFile[];
  directories?: CollectionDirectory[];
  history?: CollectionHistory;
  is_old?: boolean;
  filehistory?: any;
  flag_changed_merchandising?: 1 | 0;
  flag_changed_music?: 1 | 0;
  flag_changed_other?: 1 | 0;
  flag_changed_video?: 1 | 0;

  constructor() {
    this.files = new Array<CollectionFile>(0);
  }

  deserialize(input: any) {
    Object.assign(this, input);
    this.files = input.files.map(file => new CollectionFile().deserialize(file));
    return this;
  }
}

export interface CollectionsResponse {
  data: {
    data: Collection[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };

}

export interface DownloadInfo {
  estimate_time: number;
  job: {
    flag_remove_file: number;
    flag_silentalert: number;
    flag_status: string;
    job_detail: any[];
    job_json: any;
    job_type: string;
    job_uuid: string;
    stamp_start: number;
    stamp_stop: number;
  };
  position: number;
  queue_size: number;
  unit: string;
}

export class ConfirmRequest {
  project: string;
  collection_comment: string;
  files: ConfirmFile[];

}

export class ConfirmFile {
  is_zip: number;
  file_title: string;
  file_name: string;
  file_path: string;
  file_category: string;
  org_file_sortby?: string;
  zip_content?: ConfirmFile[];
  preview_start?: string;
  preview_stop?: string;
  track_artist?: string;
  track_version?: string;
  copyright_name?: string;
  copyright_year?: string;
  recording_location?: string;
  recording_year?: string;
  track_language?: string;
  track_language_vocals?: string;
  track_volume_number?: number;
  track_release_date?: Date;
  country_recording?: string;
  country_comissioning?: string;
  rights_holder?: string;
  rights_owner?: string;
  rights_contract?: string;
  flag_track_explicit?: boolean;
  flag_track_instrumental?: boolean;
  flag_allow_preorder?: boolean;
  flag_allow_preorder_preview?: boolean;
  artists?: Artist[];
  track_contributror?: string;
  track_publisher?: string;
  genre_primary?: string;
  genre_secondary?: string;

}
