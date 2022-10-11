import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import * as Chart from 'chart.js';
import { combineLatest, fromEvent, Subject, Subscription , Observable} from 'rxjs';
import { ProfileService } from 'src/app/services/account/profile';
import { takeUntil } from 'rxjs/operators';
import { ProjectService } from 'src/app/services/project/project';
import { Service, ServiceData } from 'src/app/models/service';
import { Permissions } from 'src/app/services/account/permission.service';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report/report';
import { FileSize } from './size';
import { ModalController } from '@ionic/angular';
import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Projects } from '../../../models/project';

interface Report {
  limits: {
    diskspace: number,
    bandwidth: number
  },
  report: object
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss']
})
export class ReportsPage implements OnInit, OnDestroy {
  @ViewChild('billCanvas', { static: false }) billCanvas: ElementRef;

  @ViewChild('discCanvas') discCanvas: ElementRef;
  @ViewChild('bandCanvas') bandCanvas: ElementRef;
  @ViewChild('monthlyCanvas') monthlyCanvas: ElementRef;
  @ViewChild('entireArea') entireArea: ElementRef;
  @ViewChild('selectArea') selectArea: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjustChartHeight();
  }

  discChart: any;
  bandChart: any;
  monthlyChart: any;

  private destroy$ = new Subject<void>();
  accountObservable: Observable<any>;
  account: any;

  services: ServiceData[];
  servicePlans: object;
  projects: Projects;
  selectedService: Service;

  billChart: any;

  transactionData = [];
  monthlyReport = [];

  dateRange = {
    start: new Date(),
    end: new Date()
  };

  serviceUuid = '';
  projectUuid = '';

  resizeObservable$: Observable<Event>;
  resizeSubscription$:  Subscription;

  constructor(
    private dialogService: NbDialogService,
    public profileService: ProfileService,
    private projectService: ProjectService,
    private reportService: ReportService,
    private modalController: ModalController,
    private bsModalServie: BsModalService,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit() {

    const now = new Date();
    const nowMonth = ('0' + (now.getMonth() + 1)).slice(-2);
    const nowDay = ('0' + now.getDate()).slice(-2);

    const monthStart = `${now.getFullYear()}-${nowMonth}-01`;
    const monthEnd = `${now.getFullYear()}-${nowMonth}-${nowDay}`;

    this.dateRange = {
      start: new Date(monthStart),
      end: new Date(monthEnd)
    };

    this.getData();
    this.getBasicUserServiceInfo();

    // Detect Height Change
    // this.resizeObservable$ = fromEvent(document, 'resize');
    // this.resizeSubscription$ = this.resizeObservable$.subscribe(val => {
    //   console.log(val);
    // })
  }

  getData() {
    this.accountObservable = combineLatest([
      this.profileService.getAccount(),
      this.profileService.getMonthlyReport()
    ]);

    this.accountObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(([account, report]) => {
        this.account = account;
        if (account.transactions.data !== undefined) {
          this.transactionData = account.transactions.data;
        }

        this.monthlyReport = report;
        // setTimeout(() => {
        //   this.makeChart();
        // }, 100);
      });
  }
  getBasicUserServiceInfo() {
    this.profileService
      .getBasicUserServicesInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        // Filter the services for ones we have Create project permission for

        // this.services = res.filter(service => this.checkCreateProjectPermission(service));
        this.services = res;

        const temp: any[] = [];
        this.services.map(item => {
          temp.push({ owner: item.account.account_holder, account: item });
        });
        this.servicePlans = _.mapValues(_.groupBy(temp, 'owner'),
          clist => clist.map(car => _.omit(car, 'owner')));
      });
  }

  checkCreateProjectPermission(service: ServiceData) {
    for (const permission of service.permissions) {
      if (permission.permission_name === Permissions.ACCOUNT_PROJECT_CREATE && permission.permission_value) {
        return true;
      }
    }
    return false;
  }

  makeChart() {
    const chartData = [];
    const chartLabels = [];
    for (const data of this.monthlyReport) {
      chartLabels.push(data.month);
      chartData.push(data.amount.toFixed(2));
    }

    chartData.push(0);

    const canvasEl: HTMLCanvasElement = this.billCanvas.nativeElement;

    const ctx = this.billCanvas.nativeElement.getContext('2d');

    canvasEl.width = 500;
    canvasEl.height = 300;

    this.billChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Billing Status',
          backgroundColor: '#518DC9',
          borderWidth: 0,
          barPercentage: 0.6,
          data: chartData
        }]
      },
      options: {
        responsive: true,
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Billing Status'
        }
      }
    });
  }

  getBillingDate(planDay: number) {
    const curDate = new Date();
    const month = curDate.getMonth();
    const day = curDate.getDay();
    if (day < planDay) {
      curDate.setDate(planDay);
      return curDate;
    } else {
      curDate.setMonth(month + 1);
      return curDate;
    }
  }

  selectServicePlan(e: Service) {

    if (e) {
      this.selectedService = e;
    }
    this.serviceUuid = this.selectedService.account_uuid;

    if (!this.serviceUuid && this.monthlyChart) {
      this.projects = null;
      this.projectUuid = '';
      this.monthlyChart.destroy();
      return;
    }

    this.projectUuid = '';
    this.projects = null;

    this.projectService.getServiceProjects(this.serviceUuid).subscribe(projects => {
      this.projects = projects;
    });

    if (this.dateRange.start === null || this.dateRange.end === null) {
      this.showError('Please select date range').then(() => {
      });
    } else {
      const datesHaveSameYear = this.checkDateRangeInSameYear(this.dateRange.start, this.dateRange.end);
      const fromDate = this.formatDate(this.dateRange.start);
      const toDate = this.formatDate(this.dateRange.end);
      const result = this.reportService.getReportsByService(this.serviceUuid, fromDate, toDate).subscribe(res => {
        this.makeMonthlyChart(res.report, datesHaveSameYear);
      });
    }
  }

  selectProject(e) {
    if (this.projectUuid === '') {
      this.selectServicePlan(e);
      return;
    }

    if (this.dateRange?.start === null || this.dateRange?.end === null) {
      this.showError('Please select date range').then(() => {
      });
    } else {
      const datesHaveSameYear = this.checkDateRangeInSameYear(this.dateRange.start, this.dateRange.end);
      const fromDate = this.formatDate(this.dateRange.start);
      const toDate = this.formatDate(this.dateRange.end);
      const result = this.reportService.getReportsByProject(this.projectUuid, fromDate, toDate).subscribe(res => {
        this.makeMonthlyChart(res.report, datesHaveSameYear);
      });
    }
  }

  formatDate(d: Date, getWithoutYear: boolean = false) {
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();
    const year = d.getFullYear();

    month = ('0' + month).slice(-2);
    day = ('0' + day).slice(-2);
    if (getWithoutYear) {
      return [month, day].join('-');
    }
    return [year, month, day].join('-');
  }
  checkDateRangeInSameYear(startDate: Date, endDate: Date) {
    return (startDate.getFullYear() === endDate.getFullYear());
  }

  datesUpdated(ev: any) {

    if (!ev.start || !ev.end) {
      return;
    }

    this.dateRange = ev;

    if (this.projectUuid) {
      this.selectProject(null);
      return;
    }

    if (this.serviceUuid) {
      this.selectServicePlan(null);
      return;
    }
  }

  determineSize(type: string, size: number) {
    switch (type) {
      case FileSize.BY:
        return size.toFixed(2);
      case FileSize.KB:
        return (size / 1024).toFixed(2);
      case FileSize.MB:
        return (size / Math.pow(1024, 2)).toFixed(2);
      case FileSize.GB:
        return (size / Math.pow(1024, 3)).toFixed(2);
      case FileSize.TB:
        return (size / Math.pow(1024, 4)).toFixed(2);
    }
  }

  async showError(message: string) {
    const modal = await this.bsModalServie.show(AlertDialogComponent,{
      class:'modal-dialog-centered',
      initialState: {
        title: 'Confirm',
        message,
        description: ''
      }
    });


    return modal.content.confirmed.subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeSubscription$.unsubscribe();
  }

  adjustChartHeight() {
    const height = this.entireArea.nativeElement.offsetHeight - (this.selectArea.nativeElement.offsetTop + this.selectArea.nativeElement.offsetHeight) - 20;
    this.renderer.setStyle(this.monthlyCanvas.nativeElement, 'height', `${height}px`);
  }

  makeMonthlyChart(report, bothDatesAreInSameYear: boolean = true) {
    this.adjustChartHeight();
    if (!report) {
      return;
    }

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const diskspace = [];
    const bandwidth = [];
    const chartLabels = [];
    const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    for (const k in report) {
      if (report.hasOwnProperty(k)) {
        diskspace.push(+(report[k].diskspace).toFixed(0));
        bandwidth.push(+(report[k].bandwidth).toFixed(0));
        if (bothDatesAreInSameYear) {
          chartLabels.push(this.formatDate(new Date(k), true));
        }
        else {
          chartLabels.push(k);
        }
      }
    }

    const canvasEl: HTMLCanvasElement = this.monthlyCanvas.nativeElement;
    // canvasEl.height = 300;f
    const data = {
      labels: chartLabels,
      datasets: [
        {
          label: 'Disk Space',
          backgroundColor: '#1863ad',
          data: diskspace,
          barPercentage: 0.6,
          stack: '1'
        },
        {
          label: 'Bandwidth',
          backgroundColor: '#782c7f',
          data: bandwidth,
          barPercentage: 0.6,
          stack: '2'
        }
      ]
    };

    const ctx = this.monthlyCanvas.nativeElement.getContext('2d');
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: true,
            ticks: {
              callback: function (value, index, values) {
                // return value + 'M';
                if(value===0){
                  return 0;
                }
                return  parseFloat((value / Math.pow(1024, Math.floor(Math.log(value) / Math.log(1024)))).toFixed(0))
                 + sizes[Math.floor(Math.log(value*1024*1024) / Math.log(1024))]
              }
            }
          }],
          xAxes: [{
            stacked: true,
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0
            }
          }]
        },
        legend: {
          display: false,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Disk Space and Bandwidth Usage'
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label: (tooltipItem, d) => {
              return `${d.datasets[+tooltipItem.datasetIndex].label}: ${tooltipItem.value}Mb`;
            },
            title: () => null
          }
        }
      }
    });
  }

}
