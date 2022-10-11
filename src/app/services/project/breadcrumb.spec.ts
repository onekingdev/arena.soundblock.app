import { TestBed } from '@angular/core/testing';
import { BreadcrumbService } from './breadcrumb';
import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
    service = TestBed.get(BreadcrumbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return observable : getBreadcrumb', (done: DoneFn) => {
    service.breadcrumb.next([]);
    service.getBreadcrumb().subscribe(res => {
      expect(res).toBeTruthy();
      done();
    }, fail);
  });

  it('should include item after add to breadcrumb : addBreadcrumbItem', () => {
    const item = {name: 'data'};
    const length = service.breadcrumb.value.length;
    service.addBreadcrumbItem(item);
    expect(service.breadcrumb.value.includes(item)).toBeTruthy();
    expect(service.breadcrumb.value.length).toEqual(length + 1);
  });

  it('should include item after add to breadcrumb : addBreadcrumbItem', () => {
    const item = {name: 'data'};
    const length = service.breadcrumb.value.length;
    service.addBreadcrumbItem(item);
    expect(service.breadcrumb.value.includes(item)).toBeTruthy();
    expect(service.breadcrumb.value.length).toEqual(length + 1);
  });

  it('should slice breadcrumb : sliceBreadcrumb', () => {
    const data = [{name: '1'}, {name: '2'}];
    service.breadcrumb.next(data);
    service.sliceBreadcrumb(1);
    expect(service.breadcrumb.value).toEqual(data.slice(0, 1));
  });

  it('should be empty when call func with no params : initBreadcrumb', () => {
    service.initBreadcrumb();
    expect(service.breadcrumb.value.length).toEqual(0);
  });

  it('should have one item when call func with param : initBreadcrumb', () => {
    service.initBreadcrumb('data');
    expect(service.breadcrumb.value[0].name).toEqual('data');
  });
});
