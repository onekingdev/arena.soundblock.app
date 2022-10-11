import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import * as Chart from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartService } from 'src/app/services/contract/chart';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() id: string;
  @ViewChild('myCanvasPie', { static: true }) canvasPie: ElementRef;

  private destroy$ = new Subject<void>();

  labels = ['Unallocated'];
  data = [100];
  chart: any;
  constructor(
    private chartService: ChartService,
  ) { }

  ngOnInit() {
    this.watchChartID();
  }

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvasPie.nativeElement;
    const ctx = this.canvasPie.nativeElement.getContext('2d');

    canvasEl.width = 325;
    canvasEl.height = 325;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [
          {
            // label: '# of Votes',
            data: this.data,
            fill: true,
            backgroundColor: [
              '#3f3f3f', '#87cbff', '#586cb4', '#9a87ff', '#879dff', '#d9d9d9', '#87e7ff', '#dc87ff', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
              '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        animation: {
          easing: 'linear'
        },

        cutoutPercentage: 40,
        responsive: true,
        scales: {}
      }
    });
  }

  watchChartID() {
    this.chartService.getChartID()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!this.chart) {
          this.labels = this.chartService.labels;
          this.data = this.chartService.data;
        }
        if (this.chart && this.id === res) {
          this.labels = this.chartService.labels;
          this.data = this.chartService.data;
          this.chart.chart.data.labels = this.labels;
          this.chart.chart.data.datasets[0].data = this.data;
          this.chart.chart.update();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
