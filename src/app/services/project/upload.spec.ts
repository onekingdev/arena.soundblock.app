import { UploadService } from './upload';
import { of, throwError, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';

describe('FileTransferService', () => {
  let service: UploadService;
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy };
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    service = new UploadService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update progress when response type is upload progress : uploadCollectionFile', () => {
    const event = {
      type: HttpEventType.UploadProgress,
      loaded: 30,
      total: 100
    };
    httpClientSpy.post.and.returnValue(of(event));

    service.uploadCollectionFile('', '', '', '', '');
    expect(service.progress).toEqual(30);
  });

  it('should return filename when upload success : uploadCollectionFile', () => {
    const event = {
      type: HttpEventType.Response,
      body: {data: 'file'}
    };
    httpClientSpy.post.and.returnValue(of(event));

    service.uploadCollectionFile('', '', '', '', '');
    expect(service.fileName).toEqual('file');
  });

  it('should set uploadFailed when upload fails : uploadCollectionFile', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 500 error',
      status: 500,
      statusText: 'Internal Server Error'
    });
    service.uploadSub =  new Subscription();
    httpClientSpy.post.and.returnValue(throwError(errorResponse));

    service.uploadCollectionFile('', '', '', '', '');
    expect(service.uploadFailed).toBeTruthy();
  });

  it('should return expected job status (HttpClient called once)', () => {
    const mock = {data: {files: {data: []}}};
    httpClientSpy.get.and.returnValue(of(mock));

    service.getJobStatus('uuid').subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should call endpoint with job and flag (HttpClient called once)', () => {
    const mock = {data: {files: {data: []}}};
    httpClientSpy.patch.and.returnValue(of(mock));

    service.setJobSilentAlert('job', 1).subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.patch.calls.count()).toBe(1, 'one call');
    expect(httpClientSpy.patch).toHaveBeenCalledWith('/job', {job: 'job', flag_silentalert: 1});
  });
});
