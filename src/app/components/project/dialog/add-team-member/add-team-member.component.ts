import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, OnDestroy, ElementRef, Output, EventEmitter } from '@angular/core';
import { TeamMember, Team } from 'src/app/models/team';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { PermissionData } from 'src/app/models/permission';
import { SharedService } from 'src/app/services/shared/shared';
import { ProjectService } from 'src/app/services/project/project';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionService, Permissions } from 'src/app/services/account/permission.service';
import { ProfileService } from 'src/app/services/account/profile';
import { BsModalRef } from 'ngx-bootstrap/modal';

export enum PermissionTab {
  'ACCOUNT',
  'FILE',
  'REPORTS'
}

@Component({
  selector: 'app-add-team-member',
  templateUrl: './add-team-member.component.html',
  styleUrls: ['./add-team-member.component.scss'],
})
export class AddTeamMemberComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('email') emailInputRef: ElementRef;
  // <-- CONTEXT INPUTS -->
  team: Team;
  memberUUID: string = null;
  invite: boolean;
  // These function should be passed from the component which opened this dialog
  @Output() closed: EventEmitter<any> = new EventEmitter<any>();
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();
  // <-- CONTEXT INPUTS -->

  private destroy$ = new Subject<void>();

  form: FormGroup;

  alreadyAddedEmails: string[] = [];
  step = 'addMember'

  selectedTab = PermissionTab.ACCOUNT;

  addMemberError: string;
  errors = [];

  subPermissions = ['Add', 'Restore', 'Download', 'Delete', 'Update'];

  sections = ['Music', 'Video', 'Merch', 'Other'];
  accountPermissions = ['']
  membersDialogRef: NbDialogRef<any>;
  permissionsDialogRef: NbDialogRef<any>;

  permission = new PermissionData();
  get isNewMember(): boolean {
    return !!!this.memberUUID;
  }

  get PermissionTab() {
    return PermissionTab;
  }

  get hasEditPermissionsPermission(): boolean {
    return this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_PERMISSIONS
    );
  }

  constructor(
    private dialogService: NbDialogService,
    private sharedService: SharedService,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private permissionService: PermissionService,
    public profileService: ProfileService,
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
    if (this.isNewMember) {

      this.form = this.fb.group({
        first_name: ['', [Validators.required, Validators.minLength(3)]],
        last_name: ['', [Validators.required, Validators.minLength(1)]],
        user_auth_email: ['', [Validators.required, Validators.email, (control: AbstractControl) => {
          if (!this.alreadyAddedEmails.length) {
            return null;
          }

          if (this.alreadyAddedEmails.find(e => e === control.value)) {
            return { alreadyAdded: true };
          }
        }]],
        user_role_id: ['', Validators.required]
      });
    } else {
      this.projectService
        .getTeamMemberPermission(this.team.team_uuid, this.memberUUID, this.invite)
        .subscribe(res => {
          this.permission = this.sharedService.parsePermissionsArrayToObject(res);
          this.step = 'setPermission';
        });
    }
  }

  ngAfterViewInit() {
  }

  allPermissionsSelected(tab: PermissionTab): boolean {
    switch (tab) {
      case PermissionTab.ACCOUNT: {
        return [
          this.permission.createProject,
          this.permission.deployPlatform,
          this.permission.addMember,
          this.permission.deleteMember,
          this.permission.changePermission,
          this.permission.modifyContract
        ].filter(Boolean).length === 6;
      }

      case PermissionTab.FILE: {
        return [
          this.permission.music,
          this.permission.video,
          this.permission.merch,
          this.permission.other,
        ].filter(section => {
          return section.add &&
            section.update &&
            section.download &&
            section.delete &&
            section.restore;
        }).length === 4;
      }

      case PermissionTab.REPORTS: {
        return this.permission.accountPayment
          && this.permission.auditLog && 
          this.permission.usageAccount &&
          this.permission.usageProject
          ;
      }
    }
  }

  selectAllPermissions(tab: PermissionTab) {
    const allSelected = this.allPermissionsSelected(tab);

    switch (tab) {
      case PermissionTab.ACCOUNT: {
        this.permission.createProject = !!!allSelected;
        this.permission.deployPlatform = !!!allSelected;
        this.permission.addMember = !!!allSelected;
        this.permission.deleteMember = !!!allSelected;
        this.permission.changePermission = !!!allSelected;
        this.permission.modifyContract = !!!allSelected;

        break;
      }

      case PermissionTab.FILE: {
        [
          this.permission.music,
          this.permission.video,
          this.permission.merch,
          this.permission.other,
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
        this.permission.accountPayment = !!!allSelected;
        this.permission.auditLog = !!!allSelected;
        this.permission.usageAccount = !!!allSelected;
        this.permission.usageProject = !!! allSelected;

        break;
      }
    }
  }

  setPermission() {
    this.form.markAllAsTouched();

    if (this.form.invalid) { return; }

    // TODO: Do we need this?
    this.permission = new PermissionData();

    // Show permissions dialog
    this.step = 'setPermission';
  }

  addMember() {
    const permissionArray = this.sharedService.parsePermissionsObjectToArray(this.permission);

    this.errors = [];

    this.projectService
      .addTeamMember(this.team.team_uuid, this.form.value as TeamMember, permissionArray)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.changed.emit(res);
        this.closeDialog();
      }, res => {
        // Show the error
        this.addMemberError = res.error.status.message;
        // Close permissions dialog
        // Show form dialog
        this.step = 'addMember';
        this.form.reset();
        // Add the email to already added ones
        this.alreadyAddedEmails.push(this.form.controls.user_auth_email.value);
      });
  }

  updateMemberPermissions() {
    const permissionArray = this.sharedService.parsePermissionsObjectToArray(this.permission);

    this.projectService
      .setTeamMemberPermission(this.team.team_uuid, this.memberUUID, permissionArray, this.invite)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed.emit();
        this.closeDialog();
      }, error => {
        const errorsArray = Object.values(error.errors);
        // @ts-ignore
        this.errors = errorsArray.flat();
      });
  }

  closeDialog() {
    this.bsModalRef.hide();
    this.closed.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
