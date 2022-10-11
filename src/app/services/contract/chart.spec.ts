import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart';

describe('ChartService', () => {
  let service: ChartService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
    service = TestBed.get(ChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set chartID : setChartID', () => {
    service.setChartID('chartId');
    expect(service.chartID.value).toEqual('chartId');
  });

  it('should return chartId observable : getChardID', (done: DoneFn) => {
    service.chartID.next('chardId');
    service.getChartID().subscribe(res => {
      expect(res).toBeTruthy();
      done();
    }, fail);
  });

  it('should set labels, data and id : updateChartData', () => {
    service.updateChartData('id', ['label'], [100]);
    expect(service.chartID.value).toEqual('id');
    expect(service.labels).toEqual(['label']);
    expect(service.data).toEqual([100]);
  });
});
