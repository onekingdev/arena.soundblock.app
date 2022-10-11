import { Component, OnInit, OnDestroy, Input, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ModalController } from '@ionic/angular';

import { ChartService } from 'src/app/services/contract/chart';

import { Contract, ContractMember, Team } from 'src/app/models/team';
import { PermissionData } from 'src/app/models/permission';

import * as _ from 'lodash';
import { ProjectService } from 'src/app/services/project/project';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { NbDialogService, NbSelectComponent } from '@nebular/theme';
import { AddTeamMemberComponent } from '../add-team-member/add-team-member.component';
import { PermissionService, Permissions } from 'src/app/services/account/permission.service';
import { ProfileService } from 'src/app/services/account/profile';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProjectRole } from 'src/app/models/service';

@Component({
  selector: 'app-modify-contract',
  templateUrl: './modify-contract.component.html',
  styleUrls: ['./modify-contract.component.scss'],
})
export class ModifyContractComponent implements OnInit, OnDestroy {
  @Input() projectId: any;
  @Input() contract: Contract;
  @Input() teamPermission?: PermissionData;
  @Input() action?: any;

  @ViewChild('memberSelect') memberSelect: NbSelectComponent;

  private destroy$ = new Subject<void>();

  formGroup: FormGroup;

  members: ContractMember[];

  chartData = [100];
  chartLabels = ['Unallocated'];
  unalloc: any;

  submitted: boolean;

  payoutFull: boolean;
  wrongValue: boolean;

  alert = false;
  returnUrl: any;
  isEmpty: boolean;

  addUserText = '< Add User >';

  availableTeamMembers: ContractMember[];

  getTeamMembersLoading: boolean;

  team: Team;
  contractOwner: ProjectRole;
  roles: ProjectRole[];

  showForm = true;

  userUUIDRoleLoading: string;

  modalHidden: EventEmitter<ContractMember[]> = new EventEmitter<ContractMember[]>();

  get hasAddMembersPermission(): boolean {
    return this.permissionService.checkUserPermission(
      Permissions.PROJECT_MEMBER_CREATE
    );
  }

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private chartService: ChartService,
    private projectService: ProjectService,
    private dialogService: NbDialogService,
    private permissionService: PermissionService,
    public profileService: ProfileService,
    private modalService: BsModalService
  ) {
    this.profileService.projectRoles.subscribe(roles => {
      this.roles = roles;
    })
  }

  ngOnInit() {
    this.contractOwner = this.roles.find(rol => rol.dataRole === 'Owner');
    this.combineContractMembers();
    this.getTeamMembers();

    this.initFormGroup();
    this.parseData();
  }

  changeMemberRole(userUUID: string, index: number, role: ProjectRole) {
    this.userUUIDRoleLoading = userUUID;

    this.projectService.changeTeamMemberRole(this.team.team_uuid, userUUID, role.dataUUID)
      .subscribe(() => {
        this.userUUIDRoleLoading = null;
        this.formMembers.at(index).patchValue({ role });
        this.updateMemberData(this.formMembers.at(index).value, index);
      }, () => {
        this.userUUIDRoleLoading = null;
      });
  }

  showAddTeamMemberDialog() {
    // this.modalService.hide();
    this.showForm = false;

    const modalRef = this.modalService.show(AddTeamMemberComponent, {
      initialState: {
        team: this.team
      }
    })
    modalRef.content.closed.subscribe(() => {
      modalRef.hide();
    });
    modalRef.content.changed.subscribe((invite) => {
      if (invite) {
        this.formMembers.push(this.createMemberFormGroup(this.parseInviteUser(invite)));
      }
      this.getTeamMembers();
    })
  }

  get formMembers(): any {
    return this.formGroup.controls.members as FormArray;
  }

  parseData() {
    this.unalloc = 100;
    this.chartData = [];
    this.chartLabels = [];
    this.members.forEach(member => {
      this.chartLabels.push(member.name);
      this.chartData.push(member.payout);
      this.unalloc -= member.payout;
      if (this.unalloc !== 0) {
        this.unalloc = this.unalloc.toFixed(2);
      }
    });
    this.chartData.unshift(this.unalloc);
    this.chartLabels.unshift('Unallocated');
    this.chartService.updateChartData(this.projectId, this.chartLabels, this.chartData);

    if (this.unalloc < 0 || this.unalloc !== 0) {
      this.formGroup.setErrors({ payoutInvalid: true });
    }

    if (this.chartData[0] === 0) {
      this.payoutFull = false;
    }
  }

  initFormGroup() {
    this.formGroup = this.formBuilder.group({
      members: this.formBuilder.array([])
    });

    for (const member of this.members) {
      this.formMembers.push(this.createMemberFormGroup(member));
    }
  }

  createMemberFormGroup(member) {
    const payoutValidators = [
      Validators.required,
      Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
      Validators.max(100.00),
      Validators.min(1.00)
    ];
    return this.formBuilder.group({
      name: [member.name, Validators.required],
      uuid: [member.uuid || null],
      isOwner: [member.isOwner || false],
      email: [member.email, Validators.required],
      role: [member.role, Validators.required],
      role_id: [member?.role?.dataUUID],
      payout: [member?.payout, payoutValidators],
      invited: [member?.invited]
    });
  }

  onPayout(formGroup: FormGroup, i: number) {
    if (formGroup.invalid) {
      return;
    }

    // Get values from forms fields
    const memberData = formGroup.value as ContractMember;

    this.updateMemberData(memberData, i);

    // Reset the dropdown
    this.memberSelect.selected = '';
  }

  checkPayoutDistribution() {
    let sum = 0;

    for (const member of this.members) {
      sum += member.payout;
    }

    if (sum > 100) {
      this.wrongValue = true;

      setTimeout(() => this.wrongValue = false, 5000);
      return false;
    } else if (sum < 100) {
      this.payoutFull = true;

      setTimeout(() => this.payoutFull = false, 5000);
      return false;
    }

    return true;
  }

  /** Checks if available team member is already added */
  checkMemberIsAdded(memberEmail: string): boolean {
    return !!(this.formMembers.value as ContractMember[]).find(m => m.email === memberEmail);
  }

  parseInviteUser(user) {
    return {
      name: user?.name,
      email: user?.primary_email?.user_auth_email,
      role: new ProjectRole(user?.role),
      uuid: user?.invite_uuid,
      payout: 0 // TODO
    }
  }

  updateMemberData(member: ContractMember, index: number) {
    // Add a new member
    if (index >= this.members.length) {
      this.members.push(member);
      // Update existing one
    } else {
      this.members[index] = member;
    }
    this.parseData();
  }

  addMember(member: ContractMember) {
    if (!member || this.checkMemberIsAdded(member.email)) {
      return;
    }
    if (member as any === 'Add member') {
      this.showAddTeamMemberDialog();
    }
    else {
      this.formMembers.push(this.createMemberFormGroup(member));
    }
  }

  deleteMember(index: number) {
    this.formMembers.removeAt(index);
    this.members.splice(index, 1);
    this.parseData();
  }

  onSubmit(formGroup: FormGroup) {
    this.submitted = true;

    if (!formGroup.valid) {
      return;
    }

    if (!this.checkPayoutDistribution()) {
      return;
    }

    // Remove member's uuid property if it's null
    this.members.forEach(m => {
      for (const propName in m) {
        if (propName === 'invited' && m[propName]) {
          delete m[propName];
          delete m['uuid'];
        }
        else if (m[propName] === null) {
          delete m[propName];
        }
      }
    });

    this.modalService.hide();
    this.modalHidden.emit(this.members);
  }

  private getTeamMembers() {
    this.getTeamMembersLoading = true;

    this.projectService
      .getProjectTeam(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.team = res.team;

        this.availableTeamMembers = this.combineTeamMembers();

        // Add the project owner if there's no contract
        if (!this.contract.contract_users.length) {
          // Get the owner
          const owner = this.availableTeamMembers.find(m => m.isOwner);
          // Add 1% payout so he's valid one
          owner.payout = 100;

          owner.role = this.contractOwner;

          // Create form group
          const ownerFG = this.createMemberFormGroup(owner);

          // Trigger onPayout so the user is added to this.members
          this.onPayout(ownerFG, 0);

          // Add the members to this.formMember
          this.addMember(this.availableTeamMembers.find(m => m.isOwner));
        }
      },
        () => this.getTeamMembersLoading = false,
        () => this.getTeamMembersLoading = false
      );
  }

  private combineTeamMembers(): ContractMember[] {
    const teamUsers = this.team.users.map(u => ({
      name: u.name,
      email: u.user_auth_email,
      role: u.user_role ? u.user_role : u.role,
      uuid: u.user_uuid,
      isOwner: u.is_owner,
      payout: 0 // TODO
    }));

    const teamInvites = this.team.invite.map(invite => ({
      name: invite.invite_name,
      email: invite.invite_email,
      role: this.roles.find(role => role.dataUUID === invite.project_role_uuid),
      uuid: invite.invite_uuid,
      payout: 0, // TODO
      invited: true,
    }));


    return [...teamUsers, ...teamInvites];
  }

  private combineContractMembers() {
    let inviteMembers: ContractMember[] = [];
    if (this.contract.contract_users !== undefined) {
      this.members = _.cloneDeep(this.contract.contract_users.filter(user => user.user_payout).map(user => {
        return {
          name: user.name,
          uuid: user.user_uuid,
          email: user.user_auth_email,
          isOwner: user.is_owner,
          role: this.roles?.find(role => role.dataRole === user.user_role),
          payout: user.user_payout,
        } as ContractMember;
      }));
    }

    if (this.contract.contract_invites !== undefined) {
      inviteMembers = _.cloneDeep(this.contract.contract_invites.filter(user => user.invite_payout).map(user => {
        return {
          name: user.invite_name,
          email: user.invite_email,
          role: user.invite_role,
          payout: user.invite_payout,
        } as ContractMember;
      }));
    }

    this.members = [...this.members, ...inviteMembers];
  }

  close() {
    this.modalService.hide();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
