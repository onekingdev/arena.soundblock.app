import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';
import { Collection, CollectionFile, CollectionsResponse, DownloadInfo, AddNotesRequest, AddNotesResponse, EditNoteRequest, AddLyricsRequest, LyricsResponse, EditLyricsRequest, UpdateTrackRequest, AddTrackPublisherRequest, AddTrackArtistRequest, AddTrackContributorRequest, OrganizeTracksRequest } from 'src/app/models/collection';
import { ProjectTab, ProjectTrack, DatabaseTab, ArtistPublisherResponse, AddTrackArtistResponse, TrackContributorResponse } from 'src/app/models/project';
import { FileStatus } from './upload';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  currentTab: BehaviorSubject<ProjectTab>;
  currentDatabaseTab: BehaviorSubject<DatabaseTab>;

  curItemListObs: Observable<Collection>;
  curItemList: BehaviorSubject<Collection>;
  checkedList: BehaviorSubject<FileStatus>;

  breadcrumb: BreadcrumbItem[] = [];
  currentPath = '';
  historyMenuShowStatus: true;

  constructor(
    private http: HttpClient,
  ) {
    this.initData();
  }

  initData() {
    this.currentTab = new BehaviorSubject('' as ProjectTab);
    this.currentDatabaseTab = new BehaviorSubject('' as DatabaseTab);
    this.curItemList = new BehaviorSubject('' as any);
    this.checkedList = new BehaviorSubject({
      music: [],
      video: [],
      merch: [],
      files: []
    });
  }

  getCollectionFiles(collection: string, filePath: string) {
    let params = new HttpParams();
    params = params.append('file_path', filePath==='tracks'?'Music':filePath.charAt(0).toUpperCase() + filePath.slice(1));
    return this.http.get<any>(`soundblock/project/collection/${collection}`, { params }).pipe(map(res => {
      const data = new Collection().deserialize(res.data);
      return data;
    }));
  }

  getProjectTrackFile(projectUUID: string, fileUUID: string) {
    return this.http.get(`soundblock/project/${projectUUID}/file/${fileUUID}`, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    });
  }

  getCollectionHistory(colUuid: string) {
    return this.http.get<any>(`soundblock/project/collection/${colUuid}/history`).pipe(map(res => {
      return res.data;
    }));
  }

  getDownloadDirectoryInfo(collectionUUID: string, directoryUUID: string) {
    return this.http.get<{
      data: {
        files: CollectionFile[],
        job_detail: any,
        job_type: string,
        job_uuid: string,
        stamp_start: number
      },
      status: any
    }>(
      `soundblock/project/collection/${collectionUUID}/directory/${directoryUUID}/files`
    );
  }

  addFolder(
    category: string,
    project: string,
    comment: string,
    name: string,
    path: string
  ) {
    const req = {
      directory_category: category,
      project,
      collection_comment: comment,
      directory_name: name,
      directory_path: path
    };

    return this.http.post<CollectionsResponse>(`soundblock/project/collection/directory`, req);
  }

  editFolder(
    category: string,
    project: string,
    comment: string,
    name: string,
    newName: string,
    path: string
  ) {
    const req = {
      file_category: category,
      project,
      collection_comment: comment,
      directory_name: name,
      directory_path: path,
      new_directory_name: newName,
      new_directory_path: path,
      directory_sortby: `${category}/${name}`
    };

    return this.http.patch<CollectionsResponse>(`soundblock/project/collection/directory`, req);
  }

  // TODO
  deleteFolder(
    category: string,
    projectUUID: string,
    comment: string,
    categoryUUID: string
  ) {
    return this.http.delete<any>(`soundblock/project/${projectUUID}/collection/directory/${categoryUUID}`, {
      params: {
        file_category: category,
        // project,
        collection_comment: comment,
      }
    });
  }

  restoreFolder(
    category: ProjectTab,
    collection: string,
    comment: string,
    uuid: string
  ) {
    const req = {
      file_category: category,
      collection,
      collection_comment: comment,
      directory: uuid
    };

    return this.http.post<any>(`soundblock/project/collection/restore`, req);
  }

  revertFolder(
    category: ProjectTab,
    collection: string,
    comment: string,
    uuid: string
  ) {
    const req = {
      file_category: category,
      collection,
      collection_comment: comment,
      directory: uuid
    };

    return this.http.post<any>(`soundblock/project/collection/revert`, req);
  }

  updateTrack(updateTrackRequest: UpdateTrackRequest) {
    return this.http.patch<any>(`soundblock/project/collection/file/track/update`, updateTrackRequest);
  }

  addNotes(addNotesRequest: AddNotesRequest) {
    return this.http.post<AddNotesResponse>(`soundblock/project/collection/file/track/notes`, addNotesRequest);
  }

  updateNotes(updateNotesRequest: EditNoteRequest) {
    return this.http.patch<AddNotesResponse> (`soundblock/project/collection/file/track/notes`, updateNotesRequest);
  }

  addLyrics(addLyricsRequest: AddLyricsRequest) {
    return this.http.post<LyricsResponse>(`soundblock/project/collection/file/track/lyrics`, addLyricsRequest);
  }

  addTrackPublisher(addTrackPublisherRequest: AddTrackPublisherRequest) {
    return this.http.post
    <ArtistPublisherResponse>(`soundblock/project/collection/file/track/publishers`, addTrackPublisherRequest);
  }


  addTrackContributor(addTrackContributorRequest: AddTrackContributorRequest) {
    return this.http.post
    <TrackContributorResponse>(`soundblock/project/collection/file/track/contributors`, addTrackContributorRequest);
  }



  addTrackArtist(addTrackRequest: AddTrackArtistRequest) {
    return this.http.post
    <AddTrackArtistResponse>(`soundblock/project/collection/file/track/artists`, addTrackRequest);
  }

  updateLyrics(updateLyricsRequest: EditLyricsRequest) {
    return this.http.patch<LyricsResponse>(`soundblock/project/collection/file/track/lyrics`, updateLyricsRequest);
  }
  
  deleteLyrics(lyrics: string) {
    return this.http.delete<any>('soundblock/project/collection/file/track/lyrics',{params: {lyrics} });
  }

  deleteTrackArtist(artist) {
    return this.http.delete<any>('soundblock/project/collection/file/track/artists',{params: {...artist} });
  }

  deleteArtistPublisher(file: string,publisher: string) {
    return this.http.delete<any>('soundblock/project/collection/file/track/publishers',{params: {file,publisher} });
  }

  deleteTrackContributor(file: string,contributor: string, type: string) {
    return this.http.delete<any>('soundblock/project/collection/file/track/contributors',{params: {file,contributor,type} });
  }

    
  deleteNote(note: string) {
    return this.http.delete<any>('soundblock/project/collection/file/track/notes',{params: {note} });
  }

  editFiles(
    category: ProjectTab,
    project: string,
    files: CollectionFile[],
    comment: string
  ) {
    const req = {
      file_category: category,
      project,
      files,
      collection_comment:comment
    };

    return this.http.patch<CollectionsResponse>(`soundblock/project/collection/files`, req);
  }

  restoreFile(
    category: ProjectTab,
    collection: string,
    comment: string,
    files: CollectionFile[]
  ) {
    const req = { file_category: category, collection, collection_comment: comment, files };
    return this.http.post<any>(`soundblock/project/collection/restore`, req);
  }

  revertFile(
    category: ProjectTab,
    collection: string,
    comment: string,
    files: CollectionFile[]
  ) {
    const req = {
      file_category: category,
      collection,
      collection_comment:
        comment, files
    };

    return this.http.post<any>(`soundblock/project/collection/revert`, req);
  }

  deleteFiles(
    category: ProjectTab,
    project: string,
    comment: string,
    files: CollectionFile[]
  ) {
    let params = new HttpParams();

    params = params.append('project', project);
    params = params.append('collection_comment', comment);
    params = params
    .append('file_category', category==='tracks'?'Music': category.charAt(0).toUpperCase() + category.slice(1));

    for (let i = 0; i < files.length; i++) {
      params = params.append(`files[${i}][file_uuid]`, files[i].file_uuid);
    }

    return this.http.delete<any>(`soundblock/project/collection/files`, { params });
  }

  uploadTrackCover(projectUUID: string, fileUUID: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{
      data: CollectionFile,
      status: any
    }>(`soundblock/project/${projectUUID}/file/${fileUUID}/cover`, formData);
  }
  organizeTracks(organizeTrackRequest: OrganizeTracksRequest) {
    return this.http.
    post<any>(`soundblock/project/collection/organize/tracks`, organizeTrackRequest).pipe(map(res => {
      return res.data;
    }));
  }

  organizeMusic(
    category: ProjectTab,
    projectUUID: string,
    comment: string,
    files: CollectionFile[],
    collectionUUID: string,
    volume_number: number
  ) {
    const req = {
      file_category: category ==='tracks'?'Music':category,
      project: projectUUID,
      collection: collectionUUID,
      volume_number: volume_number,
      collection_comment: comment,
      // We just need these three properties
      files: files.map(f => ({
        track_number: f.track.track_number,
        file_uuid: f.file_uuid
      }))
    };

    return this.http.post<CollectionsResponse>(`soundblock/project/collection/organize-music`, req).pipe(map(res => {
      return res.data;
    }));
  }

  setTrackPreviewTimeCodes(
    projectUUID: string,
    fileUUID: string,
    start: number | string,
    stop: number | string
  ) {
    return this.http.patch<{
      data: ProjectTrack,
      status: any
    }>(`soundblock/project/${projectUUID}/file/${fileUUID}/timecodes`, {
      preview_start: start,
      preview_stop: stop
    });
  }

  getTrackHistory(fileUuid: string, project: string) {
    let params = new HttpParams();
    params = params.append('file_uuid', fileUuid);
    params = params.append('project', project);
    return this.http.get<any>(`soundblock/project/collection/track/file/history`, {params}).pipe(map(res => {
      return res.data;
    }));
  }

  getFileHistory(fileUuid: string) {
    let params = new HttpParams();
    params = params.append('file_uuid', fileUuid);
    return this.http.get<any>(`soundblock/project/collection/file/${fileUuid}/history`, {params}).pipe(map(res => {
      return res.data;
    }));
  }

  downloadFiles(collection: string, files: CollectionFile[]) {
    let params = new HttpParams();
    for (let i = 0; i < files.length; i++) {
      params = params.append(`files[${i}][file_uuid]`, files[i].file_uuid);
    }

    return this.http.get<{
      data: DownloadInfo,
      status: any
    }>(`soundblock/project/collection/${collection}/download`, { params }).pipe(map(res => {
      return res.data;
    }));
  }

  setCurrentTab(tab: ProjectTab) {
    this.currentTab.next(tab);
  }

  setCurrentDatabaseTab(tab: DatabaseTab){
    this.currentDatabaseTab.next(tab);
  }

  watchCurrentTab() {
    return this.currentTab.asObservable();
  }

  watchCurrentDatabaseTab(){
    return this.currentDatabaseTab.asObservable();
  }

  watchCheckedList() {
    return this.checkedList.asObservable();
  }
  

  watchCurItemList() {
    return this.curItemList.asObservable();
  }

  addToCheckedList(file: CollectionFile) {
    const category = file.file_category;
    const list = this.checkedList.value;
    list[category] = list[category].filter(item => item.file_uuid !== file.file_uuid);
    list[category].push(file);
    this.checkedList.next(list);
  }

  deleteFromCheckedList(file: CollectionFile) {
    const category = file.file_category;
    const list = this.checkedList.value;
    list[category] = list[category].filter(item => item.file_uuid !== file.file_uuid);
    this.checkedList.next(list);
  }

  clearCheckedList() {
    this.checkedList.next({
      music: [],
      video: [],
      merch: [],
      files: []
    });
  }

  isFileChecked(file: CollectionFile) {
    const category = file.file_category;
    const list = this.checkedList.value;
    const index = list[category]?.findIndex(item => item.file_uuid === file.file_uuid);
    return index !== -1;
  }

  updateDataWithBreadcrumb(breadcrumb: BreadcrumbItem[], collectionUuid?: string) {
    let path = '';
    breadcrumb.forEach(node => {
      path += '/' + node.name;
    });
    path = path.substring(1);
    if(path === 'Tracks') {
      path= 'Music'
    }
    this.currentPath = path==='Music'?'Tracks':path;

    if(collectionUuid !== undefined) {
      this.curItemListObs = this.getCollectionFiles(collectionUuid, path);
      this.curItemListObs.subscribe(res => {
        this.curItemList.next(res);
      });
    } else {
      this.curItemListObs = new Observable((observer) => {
        observer.next(new Collection());
      })
      this.curItemListObs.subscribe(res => {
        this.curItemList.next(res);
      })
    }
  }
}
