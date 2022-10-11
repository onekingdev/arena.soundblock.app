import { Permissions } from '../services/account/permission.service';

export class SectionPermission {
  add?: boolean;
  update?: boolean;
  download?: boolean;
  delete?: boolean;
  restore?: boolean;
}

export class PermissionData {
  music = new SectionPermission();
  video = new SectionPermission();
  merch = new SectionPermission();
  other = new SectionPermission();
  createProject?: boolean;
  deployPlatform?: boolean;
  addMember?: boolean;
  deleteMember?: boolean;
  changePermission?: boolean;
  accountPayment?: boolean;
  auditLog?: boolean;
  modifyContract?: boolean;
  usageAccount?: boolean;
  usageProject?: boolean;
}

export interface Permission {
  auth_uuid: string;
  flag_critical: 0 | 1;
  permission_id: number;
  permission_memo: string;
  permission_name: string;
  permission_uuid: string;
  permission_value: 0 | 1;
}

export enum Section {
  'REPORT' = 'report',
  'ACCOUNT' = 'account',
  'FILE' = 'file'
}

export enum SubSection {
  'REPORT' = 'report',
  'PROJECT' = 'project',
  'MEMBER' = 'member',
  'MUSIC' = 'music',
  'VIDEO' = 'video',
  'MERCH' = 'merch',
  'OTHER' = 'other'
}

export enum Action {
  'PAYMENTS' = 'payments',
  'CREATE' = 'create',
  'DEPLOY' = 'deploy',
  'MODIFY' = 'modify',
  'PERMISSIONS' = 'permissions',
  'DELETE' = 'delete',
  'ADD' = 'add',
  'DOWNLOAD' = 'download',
  'RESTORE' = 'restore',
  'UPDATE' = 'update',
  'USAGE' = 'usage',
}

export const PERMISSION_INFO = [
  {
    name: Permissions.ACCOUNT_REPORT_PAYMENTS,
    section: Section.REPORT,
    subsection: SubSection.REPORT,
    action: Action.PAYMENTS
  },
  {
    name: Permissions.ACCOUNT_PROJECT_CREATE,
    section: Section.ACCOUNT,
    subsection: SubSection.PROJECT,
    action: Action.CREATE
  },
  {
    name: Permissions.ACCOUNT_PROJECT_DEPLOY,
    section: Section.ACCOUNT,
    subsection: SubSection.PROJECT,
    action: Action.DEPLOY
  },
  {
    name: Permissions.ACCOUNT_PROJECT_CONTRACT,
    section: Section.ACCOUNT,
    subsection: SubSection.PROJECT,
    action: Action.MODIFY
  },
  {
    name: Permissions.PROJECT_MEMBER_CREATE,
    section: Section.ACCOUNT,
    subsection: SubSection.MEMBER,
    action: Action.CREATE
  },
  {
    name: Permissions.PROJECT_MEMBER_DELETE,
    section: Section.ACCOUNT,
    subsection: SubSection.MEMBER,
    action: Action.DELETE
  },
  {
    name: Permissions.PROJECT_MEMBER_PERMISSIONS,
    section: Section.ACCOUNT,
    subsection: SubSection.MEMBER,
    action: Action.PERMISSIONS
  },
  {
    name: Permissions.PROJECT_FILE_MUSIC_ADD,
    section: Section.FILE,
    subsection: SubSection.MUSIC,
    action: Action.ADD
  },
  {
    name: Permissions.PROJECT_FILE_MUSIC_DELETE,
    section: Section.FILE,
    subsection: SubSection.MUSIC,
    action: Action.DELETE
  },
  {
    name: Permissions.PROJECT_FILE_MUSIC_DOWNLOAD,
    section: Section.FILE,
    subsection: SubSection.MUSIC,
    action: Action.DOWNLOAD
  },
  {
    name: Permissions.PROJECT_FILE_MUSIC_RESTORE,
    section: Section.FILE,
    subsection: SubSection.MUSIC,
    action: Action.RESTORE
  },
  {
    name: Permissions.PROJECT_FILE_MUSIC_UPDATE,
    section: Section.FILE,
    subsection: SubSection.MUSIC,
    action: Action.UPDATE
  },
  {
    name: Permissions.PROJECT_FILE_VIDEO_ADD,
    section: Section.FILE,
    subsection: SubSection.VIDEO,
    action: Action.ADD
  },
  {
    name: Permissions.PROJECT_FILE_VIDEO_DELETE,
    section: Section.FILE,
    subsection: SubSection.VIDEO,
    action: Action.DELETE
  },
  {
    name: Permissions.PROJECT_FILE_VIDEO_DOWNLOAD,
    section: Section.FILE,
    subsection: SubSection.VIDEO,
    action: Action.DOWNLOAD
  },
  {
    name: Permissions.PROJECT_FILE_VIDEO_RESTORE,
    section: Section.FILE,
    subsection: SubSection.VIDEO,
    action: Action.RESTORE
  },
  {
    name: Permissions.PROJECT_FILE_VIDEO_UPDATE,
    section: Section.FILE,
    subsection: SubSection.VIDEO,
    action: Action.UPDATE
  },
  {
    name: Permissions.PROJECT_FILE_MERCH_ADD,
    section: Section.FILE,
    subsection: SubSection.MERCH,
    action: Action.ADD
  },
  {
    name: Permissions.PROJECT_FILE_MERCH_DELETE,
    section: Section.FILE,
    subsection: SubSection.MERCH,
    action: Action.DELETE
  },
  {
    name: Permissions.PROJECT_FILE_MERCH_DOWNLOAD,
    section: Section.FILE,
    subsection: SubSection.MERCH,
    action: Action.DOWNLOAD
  },
  {
    name: Permissions.PROJECT_FILE_MERCH_RESTORE,
    section: Section.FILE,
    subsection: SubSection.MERCH,
    action: Action.RESTORE
  },
  {
    name: Permissions.PROJECT_FILE_MERCH_UPDATE,
    section: Section.FILE, subsection: SubSection.MERCH,
    action: Action.UPDATE
  },
  {
    name: Permissions.PROJECT_FILE_OTHER_ADD,
    section: Section.FILE,
    subsection: SubSection.OTHER,
    action: Action.ADD
  },
  {
    name: Permissions.PROJECT_FILE_OTHER_DELETE,
    section: Section.FILE,
    subsection: SubSection.OTHER,
    action: Action.DELETE
  },
  {
    name: Permissions.PROJECT_FILE_OTHER_DOWNLOAD,
    section: Section.FILE,
    subsection: SubSection.OTHER,
    action: Action.DOWNLOAD
  },
  {
    name: Permissions.PROJECT_FILE_OTHER_RESTORE,
    section: Section.FILE, subsection: SubSection.OTHER,
    action: Action.RESTORE
  },
  {
    name: Permissions.PROJECT_FILE_OTHER_UPDATE,
    section: Section.FILE,
    subsection: SubSection.OTHER,
    action: Action.UPDATE
  },
  {
    name: Permissions.PROJECT_REPORT_USAGE,
    section: Section.REPORT,
    subsection: SubSection.PROJECT,
    action: Action.USAGE
  },
];
