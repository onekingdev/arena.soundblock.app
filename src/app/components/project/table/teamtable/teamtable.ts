import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Team } from 'src/app/models/team';

import * as _ from 'lodash';
import { AddTeamMemberComponent, PermissionTab } from '../../dialog/add-team-member/add-team-member.component';
import { ProjectService } from 'src/app/services/project/project';
import { SharedService } from 'src/app/services/shared/shared';
import { PermissionData } from 'src/app/models/permission';
import { Permissions, PermissionService } from 'src/app/services/account/permission.service';
import { DeleteConfirmationComponent } from 'src/app/components/common/delete-confirmation/delete-confirmation.component';
import { first } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/account/profile';
import { ProjectRole } from 'src/app/models/service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-teamtable',
  templateUrl: './teamtable.html',
  styleUrls: ['./teamtable.scss', '../../dialog/add-team-member/add-team-member.component.scss'],
})
export class TeamtableComponent implements OnInit {
  @Input() team: Team;
  @Output() changed = new EventEmitter<void>();

  errors = [];

  selectedTeamMemberPermissions: PermissionData;
  selectedMemberUUID: string;
  isSelectedMemberInvite: boolean;
  memberPermissionsLoading: boolean;
  editUserPermission: boolean;
  selectedMemberIsOwner: boolean;

  selectedTab = PermissionTab.ACCOUNT;

  subPermissions = ['Add', 'Restore', 'Delete', 'Update', 'Download'];

  sections = ['Music', 'Video', 'Merch', 'Other'];

  userUUIDRoleLoading: string;

  roles: ProjectRole[];

  get PermissionTab() {
    return PermissionTab;
  }

  get hasDeleteMemberPermission(): boolean {
    return this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_DELETE
    );
  }

  get hasEditPermissionsPermission(): boolean {
    return this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_PERMISSIONS
    );
  }

  get hasAddMembersPermission(): boolean {
    return this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_CREATE
    );
  }

  windowWidth = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  constructor(
    private dialogService: NbDialogService,
    private sharedService: SharedService,
    private projectService: ProjectService,
    private bsModalService: BsModalService,
    private permissionService: PermissionService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.profileService.projectRoles.subscribe(roles => {
      this.roles = roles;
    })
    this.selectMemberWithPermissions();
    this.editUserPermission = this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_PERMISSIONS
    );
  }

  changeMemberRole(userUUID: string, role: string) {
    this.userUUIDRoleLoading = userUUID;

    this.projectService.changeTeamMemberRole(this.team.team_uuid, userUUID, role)
      .subscribe(() => {
        this.userUUIDRoleLoading = null;
      }, () => {
        this.userUUIDRoleLoading = null;
      });
  }

  showMemberDialog(memberUUID: string = null, invite: boolean = false) {
    const modalRef = this.bsModalService.show(AddTeamMemberComponent , {
      initialState: {
        team: this.team,
        memberUUID,
        invite
      }
    });
    modalRef.content.closed.subscribe(() => {
      modalRef.hide();
    })
    modalRef.content.changed.subscribe(() => {
      this.changed.emit();
      const project$ = this.projectService.project;
      project$.next(project$.value);
    })
  }

  resendInviteEmail(memberUUID: string, type: 'invite' | 'user') {
    this.projectService
      .sendTeamMemberReminder(this.team.project_uuid, memberUUID, type)
      .subscribe(() => {
        this.changed.emit();
      });
  }

  allPermissionsSelected(tab: PermissionTab): boolean {
    switch (tab) {
      case PermissionTab.ACCOUNT: {
        return [
          this.selectedTeamMemberPermissions.createProject,
          this.selectedTeamMemberPermissions.deployPlatform,
          this.selectedTeamMemberPermissions.addMember,
          this.selectedTeamMemberPermissions.deleteMember,
          this.selectedTeamMemberPermissions.changePermission,
          this.selectedTeamMemberPermissions.modifyContract
        ].filter(Boolean).length === 6;
      }

      case PermissionTab.FILE: {
        return [
          this.selectedTeamMemberPermissions.music,
          this.selectedTeamMemberPermissions.video,
          this.selectedTeamMemberPermissions.merch,
          this.selectedTeamMemberPermissions.other,
        ].filter(section => {
          return section.add &&
            section.update &&
            section.download &&
            section.delete &&
            section.restore;
        }).length === 4;
      }

      case PermissionTab.REPORTS: {
        return this.selectedTeamMemberPermissions.accountPayment
          && this.selectedTeamMemberPermissions.auditLog;
      }
    }
  }

  secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes") : "";
    return hDisplay + 'and ' + mDisplay; 
}

  selectAllPermissions(tab: PermissionTab) {
    const allSelected = this.allPermissionsSelected(tab);

    switch (tab) {
      case PermissionTab.ACCOUNT: {
        this.selectedTeamMemberPermissions.createProject = !!!allSelected;
        this.selectedTeamMemberPermissions.deployPlatform = !!!allSelected;
        this.selectedTeamMemberPermissions.addMember = !!!allSelected;
        this.selectedTeamMemberPermissions.deleteMember = !!!allSelected;
        this.selectedTeamMemberPermissions.changePermission = !!!allSelected;
        this.selectedTeamMemberPermissions.modifyContract = !!!allSelected;

        break;
      }

      case PermissionTab.FILE: {
        [
          this.selectedTeamMemberPermissions.music,
          this.selectedTeamMemberPermissions.video,
          this.selectedTeamMemberPermissions.merch,
          this.selectedTeamMemberPermissions.other,
        ].forEach(section => {
          section.add = !!!allSelected;
          section.update = !!!allSelected;
          section.download = !!!allSelected;
          section.delete = !!!allSelected;
          section.restore = !!!allSelected;
        });

        break;
      }

      case PermissionTab.REPORTS: {
        this.selectedTeamMemberPermissions.accountPayment = !!!allSelected;
        this.selectedTeamMemberPermissions.auditLog = !!!allSelected;

        break;
      }
    }

    this.updateMemberPermissions();
  }

  selectMember(memberUUID: string, invite: boolean = false, isOwner: boolean = false) {
    // Don't make the call if the member is already selected
    if (this.selectedMemberUUID === memberUUID) {
      return;
    }

    if (!this.hasEditPermissionsPermission && memberUUID !== this.profileService.user.value.user_uuid) {
      return;
    }

    this.selectedMemberIsOwner = isOwner;
    this.selectedMemberUUID = memberUUID;
    this.isSelectedMemberInvite = invite;
    this.memberPermissionsLoading = true;

    this.projectService
      .getTeamMemberPermission(this.team.team_uuid, memberUUID, invite)
      .subscribe(res => {
        this.selectedTeamMemberPermissions = this.sharedService.parsePermissionsArrayToObject(res);
      }, () => {
        this.memberPermissionsLoading = false;
      }, () => {
        this.memberPermissionsLoading = false;
      });
    this.editUserPermission = this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_PERMISSIONS
    );
  }

  async deleteMember(e: Event, teamMemberUUID: string, name: string) {
    e.stopPropagation();

    const result = await this.dialogService.open(DeleteConfirmationComponent, {
      context: {
        message: `Are you sure you want to delete ${name}?`
      }
    }).onClose.pipe(first()).toPromise();

    if (result) {
      // TODO: Check if the user is part of the contract!

      this.projectService
        .deleteTeamMember(this.team.project_uuid, teamMemberUUID)
        .subscribe(() => {
          this.changed.emit();
        });
    }
  }

  updateMemberPermissions() {
    this.memberPermissionsLoading = true;

    const permissionArray = this.sharedService.parsePermissionsObjectToArray(this.selectedTeamMemberPermissions);

    this.projectService
      .setTeamMemberPermission(
        this.team.team_uuid,
        this.selectedMemberUUID,
        permissionArray,
        this.isSelectedMemberInvite
      )
      .subscribe((res) => {
        // Current user is updating his permissions so update the service
        if (this.selectedMemberUUID === this.profileService.user.value.user_uuid) {
          this.permissionService.userPermissionsForProject = res;
        }

        this.memberPermissionsLoading = false;
      }, error => {
        this.memberPermissionsLoading = false;
        this.errors.push(error.error.status.message);
      });
  }

  getDuration(seconds) {
    return this.secondsToHms(seconds);
  }

  updatePermission() {
    // This fixes updateMemberPermissions being called before the model is set
    setTimeout(() => this.updateMemberPermissions(), 0);
  }

  private selectMemberWithPermissions() {
    const selectMember = () => {
      // Find the user in the data
      const teamUser = this.team.users
        .find(u => u.user_uuid === this.profileService.user.value.user_uuid);

      // Select the signed in user
      this.selectMember(teamUser.user_uuid, false, teamUser.is_owner);
    };

    // We already loaded permissions i.e. coming from another route
    if (this.permissionService.userPermissionsForProject) {
      selectMember();
    } else {
      // Wait for permissions to load i.e. loading the page directly
      this.permissionService.permissionsLoaded$.subscribe(() => {
        selectMember();
      });
    }
  }
}
