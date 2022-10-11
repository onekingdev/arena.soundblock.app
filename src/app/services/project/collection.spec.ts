import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Collection } from 'src/app/models/collection';

describe('CollectionService', () => {
  let service: CollectionService;
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy };
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    service = new CollectionService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected files (HttpClient called once)', () => {
    const mock = {data: {files: {data: []}}};
    httpClientSpy.get.and.returnValue(of(mock));

    service.getCollectionFiles('collection', 'filePath', 'fileCategory').subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return an error when the server returns a 404', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found'
    });
    httpClientSpy.get.and.returnValue(throwError(errorResponse));

    service.getCollectionFiles('collection', 'filePath', 'fileCategory').subscribe(
      res => fail('expected an error, not files'),
      error => expect(error.error).toContain('test 404 error'));
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should call func with collection and files : downloadFiles', () => {
    const col = 'collection';
    const files = [{file_uuid: '1'}, {file_uuid: '2'}];
    httpClientSpy.get.and.returnValue(of({data: {}}));
    service.downloadFiles(col, files).subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.get).toHaveBeenCalledWith('/soundblock/project/collection/download?collection=collection&files[0][file_uuid]=1&files[1][file_uuid]=2');
  });

  it('should return observable : watchCurrentTab, watchCheckedList, watchCurItemList', (done: DoneFn) => {
    service.currentTab = new BehaviorSubject('test');
    service.checkedList = new BehaviorSubject({music: [], video: [], merch: [], other: []});
    service.curItemList = new BehaviorSubject('test');
    service.watchCurrentTab().subscribe(res => {
      expect(res).toEqual('test');
      done();
    }, fail);
    service.watchCheckedList().subscribe(res => {
      expect(res).toEqual({music: [], video: [], merch: [], other: []});
      done();
    }, fail);
    service.watchCurItemList().subscribe(res => {
      expect(res).toEqual('test');
      done();
    }, fail);
  });

  it('should add file: addToCheckedList', () => {
    const data = {music: [], video: [{file_uuid: '1'}], merch: [], other: []};
    const file = {file_uuid: '2', file_category: 'video'};
    service.checkedList.next(data);
    service.addToCheckedList(file);
    expect(service.checkedList.value.video).toContain(file);
    expect(service.checkedList.value.video.length).toEqual(2);
  });

  it('should add file if same file doesnt exist: addToCheckedList', () => {
    const data = {music: [], video: [{file_uuid: '1'}], merch: [], other: []};
    const file = {file_uuid: '1', file_category: 'video'};
    service.checkedList.next(data);
    service.addToCheckedList(file);
    expect(service.checkedList.value.video).toContain(file);
    expect(service.checkedList.value.video.length).toEqual(1, 'added existing file');
  });
  
  it('should update path and curItemList : updateDataWithBreadcrumb', () => {
    const data = [{name: '1'}, {name: '2'}];
    const mock = {data: {files: {data: []}}};
    httpClientSpy.get.and.returnValue(of(mock));
    service.currentTab.next('tab');
    service.updateDataWithBreadcrumb(data, 'colid');
    expect(service.currentPath).toEqual('1/2');
    expect(service.curItemList.value).toEqual(new Collection().deserialize(mock.data));
  });

});
