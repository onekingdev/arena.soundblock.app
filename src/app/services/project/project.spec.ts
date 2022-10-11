import { TestBed, getTestBed } from '@angular/core/testing';
import { ProjectService } from './project';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionService } from './collection';
import { Project } from 'src/app/models/project';

describe('ProjectService', () => {
  let collectionServiceMock: any;
  let service: ProjectService;
  let httpClient: HttpTestingController;
  beforeEach(() => {
    collectionServiceMock = jasmine.createSpyObj('CollectionService', ['currentPath']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CollectionService, useValue: collectionServiceMock }
      ]
    });
    httpClient = getTestBed().get(HttpTestingController);
    service = TestBed.get(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected project list (HttpClient called once, Get) : getProjects', () => {
    service.getProjects().subscribe(res => expect(res).toEqual([]), fail);
    const req = httpClient.expectOne(`/soundblock/projects`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: []
    });

    httpClient.verify();
  });

  it('should return expected project (HttpClient called once, Get) : getProjectByID', () => {
    service.getProjectByID('id').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project?project=id`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: { project_uuid: 'uuid' }
    });

    httpClient.verify();
  });

  it('should return expected collections (HttpClient called once, Get) : getCollections', () => {
    service.getCollections('id').subscribe(res => expect(res).toEqual([]), fail);
    const req = httpClient.expectOne(`/soundblock/project/collections?project=id`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: []
    });

    httpClient.verify();
  });

  it('should return expected platforms (HttpClient called once, Get) : getPlatforms', () => {
    service.getPlatforms().subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/platforms`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should return expected platforms (HttpClient called once, Get) : getPlatforms', () => {
    service.getPlatforms().subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/platforms`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should call endpoint with param as project (HttpClient called once, Post) : createProject', () => {
    service.createProject('project').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project`, 'call to api');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should call endpoint with param as project (HttpClient called once, Post) : createProject', () => {
    service.createProject('project').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project`, 'call to api');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should return expected result (HttpClient called once, Post) : updateProjectContract', () => {
    service.updateProjectContract('1', 'member').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project/1/contract`, 'call to api');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should return expected result (HttpClient called once, Patch) : acceptProjectContract', () => {
    service.acceptProjectContract('1').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project/contract/1/accept`, 'call to api');
    expect(req.request.method).toBe('PATCH');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should return expected result (HttpClient called once, Patch) : rejectProjectContract', () => {
    service.rejectProjectContract('1').subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/soundblock/project/contract/1/reject`, 'call to api');
    expect(req.request.method).toBe('PATCH');
    req.flush({
      data: {}
    });

    httpClient.verify();
  });

  it('should set collectionUuid, collections and tracks : setProjectInfo', () => {
    const project = {
      project_uuid: 'B089AC98-ED58-4286-B5DD-530019631819',
      project_title: 'Remind me Tomorrow',
      status: 'Pending',
      collections: {
        data: [
          {
            collection_uuid: 'B6BCEBB8-CCDC-4702-87FC-BC702203F9F2',
            project_uuid: 'B089AC98-ED58-4286-B5DD-530019631819',
            collection_comment: '**jin',
            musics: { data: [] }
          }
        ]
      }
    };
    service.setProjectInfo(new Project().deserialize(project));
    expect(service.collectionUuid.value).toEqual('B6BCEBB8-CCDC-4702-87FC-BC702203F9F2');
    expect(service.collectionAdded$.value).toEqual(project.collections.data);
    expect(service.tracks.value).toEqual(project.collections.data[0].musics.data);
  });

  it('should init collectionUuid, collections and tracks if project collection doesnt exist: setProjectInfo', () => {
    const project = {
      project_uuid: 'B089AC98-ED58-4286-B5DD-530019631819',
      project_title: 'Remind me Tomorrow',
      status: 'Pending',
    };
    service.setProjectInfo(new Project().deserialize(project));
    expect(service.collectionUuid.value).toEqual('');
    expect(service.collectionAdded$.value).toEqual([]);
    expect(service.tracks.value).toEqual([]);
  });

  it('should return true if current collection is latest : isLatestCollection', () => {
    const data = [
      {
        collection_uuid: 'B6BCEBB8-CCDC-4702-87FC-BC702203F9F2',
        project_uuid: 'B089AC98-ED58-4286-B5DD-530019631819',
        collection_comment: '**jin',
        musics: { data: [] }
      }
    ];
    service.collectionAdded$.next(data);
    service.collectionUuid.next('B6BCEBB8-CCDC-4702-87FC-BC702203F9F2');
    expect(service.isLatestCollection).toBeTruthy();
  });

  it('should return false if current collection is old : isLatestCollection', () => {
    const data = [
      {
        collection_uuid: 'B6BCEBB8-CCDC-4702-87FC-BC702203F9F2',
        project_uuid: 'B089AC98-ED58-4286-B5DD-530019631819',
        collection_comment: '**jin',
        musics: { data: [] }
      }
    ];
    service.collectionAdded$.next(data);
    service.collectionUuid.next('');
    expect(service.isLatestCollection).toBeFalsy();
  });
});
