import { Base } from './base';

export interface User extends Base {
  avatar: string;
  flag_avatar: 0 | 1;
  name: string;
  notification_setting: NotificationSettings;
  primary_email: {
    flag_primary: 0 | 1;
    flag_verified: 0 | 1;
    row_uuid: string;
    user_auth_email: string
  };
  unread_notifications_count: number;
  user_uuid: string;
}

export interface NotificationSettings {
  app_uuid: string;
  flag_account: 0 | 1;
  flag_apparel: 0 | 1;
  flag_arena: 0 | 1;
  flag_catalog: 0 | 1;
  flag_embroidery: 0 | 1;
  flag_facecoverings: 0 | 1;
  flag_io: 0 | 1;
  flag_merchandising: 0 | 1;
  flag_music: 0 | 1;
  flag_office: 0 | 1;
  flag_prints: 0 | 1;
  flag_screenburning: 0 | 1;
  flag_sewing: 0 | 1;
  flag_soundblock: 0 | 1;
  flag_tourmask: 0 | 1;
  flag_ux: 0 | 1;
  setting: NotificationSetting;
}

export type ToastrPosition = 'top-left' |
  'top-middle' |
  'top-right' |
  'middle-left' |
  'middle-middle' |
  'middle-right' |
  'bottom-left' |
  'bottom-middle' |
  'bottom-right';

export interface NotificationSetting {
  per_page: number;
  play_sound: 0 | 1;
  position: ToastrPosition;
  show_time: number;
  user_uuid: string;
  web: 0 | 1;
}
