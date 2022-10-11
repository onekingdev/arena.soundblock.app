import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { Contract, ContractMember } from 'src/app/models/team';
import { ProfileService } from 'src/app/services/account/profile';
import { ProjectService } from 'src/app/services/project/project';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { ModifyContractComponent } from 'src/app/components/project/dialog/modify-contract/modify-contract.component';
import { takeUntil } from 'rxjs/operators';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/local';
import { AuthService } from 'src/app/services/account/auth';
import { ChartService } from 'src/app/services/contract/chart';

import * as _ from 'lodash';
import { ServiceData } from 'src/app/models/service';
import { PermissionService, Permissions } from 'src/app/services/account/permission.service';
import { User } from 'src/app/models/user';
import { HttpErrorResponse } from '@angular/common/http';
import Echo from 'laravel-echo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.page.html',
  styleUrls: ['./contract.page.scss'],
})
export class ContractPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  contract: Contract;
  userInfo: User;
  userContract: any;
  services: ServiceData[];

  usersWithContractPermission: {
    name: string;
    user_uuid: string;
    primary_email: {
      flag_primary: 0 | 1;
      flag_verified: 0 | 1;
      user_auth_email: string;
    };
  }[];

  projectOwner: {
    name: string;
    user_uuid: string;
    primary_email: {
      flag_primary: 0 | 1;
      flag_verified: 0 | 1;
      user_auth_email: string;
    };
  };

  projectId: string;

  hasModifyContractPermission: boolean;

  pusherActive = true;

  getContractLoading: boolean;

  private echo:Echo;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private projectService: ProjectService,
    private profileService: ProfileService,
    private authService: AuthService,
    private chartService: ChartService,
    private permissionService: PermissionService,
    private blockchainService: BlockchainService,
    private router: Router,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.profileService
      .getBasicUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.userInfo = res;
      });

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // This will fire on every visit and subscribe to the contract changes
        if (!this.projectId) {
          this.projectId = params.id;
          this.subscribeToContractChanges();
          this.getContractData();
        }
      });

    this.permissionService.permissionsLoaded$.subscribe(() => {
      this.hasModifyContractPermission = this.permissionService.checkUserPermission(
        Permissions.ACCOUNT_PROJECT_CONTRACT
      );
    });
  }

  getContractData() {
    this.getContractLoading = true;

    this.projectService.getProjectContract(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(contract => {
        this.setContractData(contract);
      }, (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/projects']);
        }
      });
  }

  cancelContract(contractUUID: string) {
    if (!this.hasModifyContractPermission) {
      return;
    }

    this.getContractLoading = true;

    this.projectService
      .cancelProjectContract(contractUUID)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.pusherActive) {
          this.getContractData();
        }
      }, () => {
        this.getContractLoading = false;
      });
  }

  acceptContract(contract: Contract) {
    this.getContractLoading = true;

    this.projectService
      .acceptProjectContract(contract.contract_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.pusherActive) {
          this.getContractData();
        }
      }, () => {
        this.getContractLoading = false;
      });
  }

  rejectContract(contract: Contract) {
    this.getContractLoading = true;

    this.projectService
      .rejectProjectContract(contract.contract_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.pusherActive) {
          this.getContractData();
        }
      }, () => {
        this.getContractLoading = false;
      });
  }

 modifyContract(contract: Contract) {
    if (
      this.userContract && this.userContract.contract_status === 'Pending' ||
      this.contract.flag_status === 'Modifying' ||
      !this.hasModifyContractPermission
    ) {
      return;
    }

    const modal =  this.modalService.show( ModifyContractComponent, {
      class: 'modify-contract-modal',
      initialState: {
        projectId: this.projectId,
        contract,
      }
    });

    modal.content.modalHidden.subscribe(result => {
      if (result) {
        this.getContractLoading = true;
        this.projectService
          .updateProjectContract(this.projectId, result as ContractMember[])
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            if (!this.pusherActive) {
              this.getContractData();
            }
          }, () => {
            this.getContractLoading = false;
          });
      }

      this.parseChartData();
    });

  }

  createContract() {
    if (!this.hasModifyContractPermission) {
      return;
    }
    const modalRef = this.modalService.show(ModifyContractComponent,
      { class:'modify-contract-modal',
      ignoreBackdropClick: true,
        initialState: { 
          projectId: this.projectId,
          contract: new Contract()
        }
      })

    modalRef.content.modalHidden
    .subscribe((result) => {
      this.getContractLoading = true;

      this.projectService
        .createProjectContract(this.projectId, result)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.pusherActive) {
            this.getContractData();
          }
        }, () => {
          this.getContractLoading = false;
        });
    });
  }

  sendEmailReminder(uuid: string, type: 'invite' | 'user') {
    this.projectService
      .sentContractMemberReminder(this.projectId, uuid, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getContractData();
      });
  }

  private setContractData(contract: Contract) {
    this.projectService.projectHasActiveContract = contract.flag_status === 'Active';

    this.contract = contract;
    if (!contract.contract_users) { return; }

    this.userContract = contract.contract_users.find(cu => cu.user_uuid === this.userInfo.user_uuid);

    if (contract.contract_permission_users) {
      // Get all users with permission without the owner
      this.usersWithContractPermission = contract.contract_permission_users.filter(u => !u.is_owner);
      // Set the project owner
      this.projectOwner = contract.contract_permission_users.find(u => u.is_owner);
    }

    this.parseChartData();

    this.getContractLoading = false;
  }

  showBlockchainViewer(ledgerUuid) {
    const modal = this.modalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }
  
  private subscribeToContractChanges() {
    const pusher = new Pusher(environment.pusherApiKey, {
      authEndpoint: `${environment.apiUrl}broadcasting/auth`,
      cluster: environment.pusherCluster,
      forceTLS: true,
      encrypted: true,
      auth: {
        params: {},
        headers: {
          Authorization: `Bearer ${this.authService.accessToken}`
        }
      },
    });

    const channelContract = pusher.subscribe(`private-channel.app.soundblock.project.${this.projectId}.contract`);

    channelContract.bind(`Soundblock.Project.${this.projectId}.Contract`, (contract: Contract) => {
      this.setContractData(contract);
    });
    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.projectId}.ledger`);

    channel.bind(`Soundblock.Project.${this.projectId}.Ledger`, (res) => {
      if(this.contract.contract_uuid === res.entity_uuid) {
        this.contract.ledger_uuid = res.ledger_uuid;
      }
    });


    // On Pusher error get the contract data manually
    pusher.connection.bind('error', () => {
      this.pusherActive = false;
    });

    channel.bind('pusher:subscription_error', () => {
      this.pusherActive = false;
    });
  }

  private parseChartData() {
    let inviteMembers: ContractMember[] = [];
    let contractMembers: ContractMember[] = [];

    contractMembers = _.cloneDeep(this.contract.contract_users.filter(user => user.user_payout).map(user => {
      return {
        name: user.name,
        email: user.user_auth_email,
        role: user.role_id,
        payout: user.user_payout
      } as ContractMember;
    }));

    inviteMembers = _.cloneDeep(this.contract.contract_invites.filter(user => user.invite_payout).map(user => {
      return {
        name: user.invite_name,
        email: user.invite_email,
        role: user.invite_role,
        payout: user.invite_payout
      } as ContractMember;
    }));

    contractMembers = [...contractMembers, ...inviteMembers];

    let unalloc = 100;
    const chartData = [];
    const chartLabels = [];
    contractMembers.forEach(element => {
      chartLabels.push(element.name);
      chartData.push(element.payout);
      unalloc -= element.payout;
    });

    chartData.unshift(unalloc);
    chartLabels.unshift('Unallocated');

    this.chartService.updateChartData(this.projectId, chartLabels, chartData);
  }

  private leaveChannel(): void {
    this.echo?.leaveChannel(`private-channel.app.soundblock.project.${this.projectId}.contract`);
    this.echo?.leaveChannel(`private-channel.app.soundblock.project.${this.projectId}.ledger`);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.leaveChannel();
  }
}
