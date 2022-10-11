import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum Permissions {
  'ACCOUNT_REPORT_PAYMENTS' = 'App.Soundblock.Account.Report.Billing',
  'ACCOUNT_PROJECT_CREATE' = 'App.Soundblock.Account.Project.Create',
  'ACCOUNT_PROJECT_DEPLOY' = 'App.Soundblock.Account.Project.Deploy',
  'ACCOUNT_PROJECT_CONTRACT' = 'App.Soundblock.Account.Project.Contract',
  'ACCOUNT_REPORT_USAGE' = 'App.Soundblock.Account.Report.Usage',
  'ACCOUNT_REPORT_AUDIT' = 'App.Soundblock.Account.Report.Audit',
  'PROJECT_MEMBER_CREATE' = 'App.Soundblock.Project.Member.Create',
  'PROJECT_MEMBER_DELETE' = 'App.Soundblock.Project.Member.Delete',
  'PROJECT_MEMBER_PERMISSIONS' = 'App.Soundblock.Project.Member.Permissions',
  'PROJECT_FILE_MUSIC_ADD' = 'App.Soundblock.Project.File.Music.Add',
  'PROJECT_FILE_MUSIC_DELETE' = 'App.Soundblock.Project.File.Music.Delete',
  'PROJECT_FILE_MUSIC_DOWNLOAD' = 'App.Soundblock.Project.File.Music.Download',
  'PROJECT_FILE_MUSIC_RESTORE' = 'App.Soundblock.Project.File.Music.Restore',
  'PROJECT_FILE_MUSIC_UPDATE' = 'App.Soundblock.Project.File.Music.Update',
  'PROJECT_FILE_VIDEO_ADD' = 'App.Soundblock.Project.File.Video.Add',
  'PROJECT_FILE_VIDEO_DELETE' = 'App.Soundblock.Project.File.Video.Delete',
  'PROJECT_FILE_VIDEO_DOWNLOAD' = 'App.Soundblock.Project.File.Video.Download',
  'PROJECT_FILE_VIDEO_RESTORE' = 'App.Soundblock.Project.File.Video.Restore',
  'PROJECT_FILE_VIDEO_UPDATE' = 'App.Soundblock.Project.File.Video.Update',
  'PROJECT_FILE_MERCH_ADD' = 'App.Soundblock.Project.File.Merch.Add',
  'PROJECT_FILE_MERCH_DELETE' = 'App.Soundblock.Project.File.Merch.Delete',
  'PROJECT_FILE_MERCH_DOWNLOAD' = 'App.Soundblock.Project.File.Merch.Download',
  'PROJECT_FILE_MERCH_RESTORE' = 'App.Soundblock.Project.File.Merch.Restore',
  'PROJECT_FILE_MERCH_UPDATE' = 'App.Soundblock.Project.File.Merch.Update',
  'PROJECT_FILE_OTHER_ADD' = 'App.Soundblock.Project.File.Files.Add',
  'PROJECT_FILE_OTHER_DELETE' = 'App.Soundblock.Project.File.Files.Delete',
  'PROJECT_FILE_OTHER_DOWNLOAD' = 'App.Soundblock.Project.File.Files.Download',
  'PROJECT_FILE_OTHER_RESTORE' = 'App.Soundblock.Project.File.Files.Restore',
  'PROJECT_FILE_OTHER_UPDATE' = 'App.Soundblock.Project.File.Files.Update',
  'PROJECT_REPORT_USAGE' = 'App.Soundblock.Project.Report.Usage',
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  userPermissionsForProject: {
    permission_name: string;
    permission_value: 1 | 0
    auth_uuid?: string;
    flag_critical?: number;
    permission_id?: number;
    permission_memo?: string;
    permission_uuid?: string;
  }[];

  permissionsLoaded$ = new Subject<void>();

  checkUserPermission(permissionName: Permissions): boolean {
    if (!this.userPermissionsForProject) {
      return false;
    }

    return !!this.userPermissionsForProject.find(p => p.permission_name === permissionName && p.permission_value);
  }
}
