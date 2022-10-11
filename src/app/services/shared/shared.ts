import { Injectable } from '@angular/core';
import { Action, PERMISSION_INFO, PermissionData, Section, SubSection } from 'src/app/models/permission';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor() { }

  checkPasswordStrength(password: string) {
    const strongRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
    );
    const mediumRegex = new RegExp(
      '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
    );

    if (strongRegex.test(password)) {
      return 'Strong';
    }

    if (mediumRegex.test(password)) {
      return 'Medium';
    }

    return 'Weak';
  }

  getFileIcon(type: string) {
    switch (type) {
      case 'dir':
        return 'fa-folder';
      case 'wav':
        return 'fa-file-audio';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'ai':
      case 'psd':
      case 'png':
        return 'fa-file-image';
      case 'mp4':
        return 'fa-file-video';
      case 'pdf':
        return 'fa-file-pdf';
      default:
        return 'fa-file';
    }
  }

  getFileName(str: string) {
    const index = str.lastIndexOf('.');
    return str.slice(0, index);
  }

  getFileExtension(str: string) {
    // Get the last index because of files with dots in them
    const index = str.lastIndexOf('.');
    return str.slice(index + 1, str.length);
  }

  getQueryParameter(key: string): string {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  parsePermissionsArrayToObject(permissions: any[], groupPermission?: PermissionData) {
    let result = new PermissionData();
    if (groupPermission) {
      result = _.cloneDeep(groupPermission);
    }
    for (const item of permissions) {
      const permissionDetail = PERMISSION_INFO.find(res => res.name === item.permission_name);

      if (!permissionDetail) { continue; }

      const section = permissionDetail.section;
      const subsection = permissionDetail.subsection;
      const action = permissionDetail.action;

      const value = item.permission_value;
      switch (section) {
        case Section.ACCOUNT:
          if (subsection === SubSection.PROJECT && action === Action.CREATE) {
            result.createProject = value;
          }
          if (subsection === SubSection.PROJECT && action === Action.DEPLOY) {
            result.deployPlatform = value;
          }
          if (subsection === SubSection.PROJECT && action === Action.MODIFY) {
            result.modifyContract = value;
          }
          if (subsection === SubSection.MEMBER && action === Action.CREATE) {
            result.addMember = value;
          }
          if (subsection === SubSection.MEMBER && action === Action.DELETE) {
            result.deleteMember = value;
          }
          if (subsection === SubSection.MEMBER && action === Action.PERMISSIONS) {
            result.changePermission = value;
          }
          break;
        case Section.REPORT:
          if (subsection === SubSection.PROJECT && action === Action.USAGE) {
            result.usageProject = value;
          }
          if (subsection === SubSection.PROJECT && action === Action.USAGE) {
            result.accountPayment = value;
          }
          result.accountPayment = value;
          break;
        case Section.FILE:
          result[subsection][action] = value;
          break;
      }
    }
    return result;
  }

  parsePermissionsObjectToArray(permission: PermissionData) {
    const result = [];
    for (const item of PERMISSION_INFO) {

      const section = item.section;
      const subsection = item.subsection;
      const action = item.action;

      switch (section) {
        case Section.ACCOUNT:
          if (subsection === SubSection.PROJECT && action === Action.CREATE) {
            if (typeof permission.createProject !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.createProject ? 1 : 0 });
            }
          }
          if (subsection === SubSection.PROJECT && action === Action.DEPLOY) {
            if (typeof permission.deployPlatform !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.deployPlatform ? 1 : 0 });
            }
          }
          if (subsection === SubSection.PROJECT && action === Action.MODIFY) {
            if (typeof permission.modifyContract !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.modifyContract ? 1 : 0 });
            }
          }
          if (subsection === SubSection.MEMBER && action === Action.CREATE) {
            if (typeof permission.addMember !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.addMember ? 1 : 0 });
            }
          }
          if (subsection === SubSection.MEMBER && action === Action.DELETE) {
            if (typeof permission.deleteMember !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.deleteMember ? 1 : 0 });
            }
          }
          if (subsection === SubSection.MEMBER && action === Action.PERMISSIONS) {
            if (typeof permission.changePermission !== 'undefined') {
              result.push({ permission_name: item.name, permission_value: permission.changePermission ? 1 : 0 });
            }
          }
          break;
        case Section.REPORT:
          if (typeof permission.accountPayment !== 'undefined') {
            result.push({ permission_name: item.name, permission_value: permission.accountPayment ? 1 : 0 });
          }
          break;
        case Section.FILE:
          if (typeof permission[subsection][action] !== 'undefined') {
            result.push({ permission_name: item.name, permission_value: permission[subsection][action] ? 1 : 0 });
          }
          break;
      }
    }
    return result;
  }
}
