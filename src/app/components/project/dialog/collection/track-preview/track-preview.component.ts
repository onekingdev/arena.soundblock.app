import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subject, throwError, Observable, Subscription } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { ProjectTab, ProjectTrack } from 'src/app/models/project';
import { CollectionService } from 'src/app/services/project/collection';
import { ProjectService } from 'src/app/services/project/project';
import * as WaveSurfer from 'wavesurfer.js';
import * as WaveSurferRegions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';

@Component({
  selector: 'app-track-preview',
  templateUrl: './track-preview.component.html',
  styleUrls: ['./track-preview.component.scss'],
})
export class TrackPreviewComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('wavesurferRef') wavesurferRef: ElementRef;

  private regionDragging$ = new Subject<void>();

  private regionOptions = {
    start: 0,
    end: 30,
    drag: true,
    resize: false,
    loop: true,
    minLength: 30,
    maxLength: 30,
    color: 'rgba(211,211,211,0.5)'
  };

  @Input() tracks: ProjectTrack[];
  projectUUID: string;
  selectedTrack: ProjectTrack;
  downloadTrackProgress = 0;
  trackCache: {
    trackUUID: string;
    file: Blob;
  }[] = [];

  wavesurfer: WaveSurfer;

  trackLoading: boolean;

  regionPlaying: boolean;

  trackVolume = 33;
  lastTrackVolume = 33;

  setTimecodesLoading: boolean;

  trackDuration: string;
  currentTime = '0:00';

  previewStart = '0';
  previewStop = '30';

  errorMessage: string;
  successMessage: string;

  downloadSub: Subscription;

  get trackRegion(): any {
    return Object.values(this.wavesurfer.regions.list)[0];
  }

  get regionStart(): string {
    return this.trackRegion.start;
  }

  set regionStart(time: string) {
    this.trackRegion.start = time;
  }

  get regionEnd(): string {
    return this.trackRegion.end;
  }

  set regionEnd(time: string) {
    this.trackRegion.end = time;
  }

  constructor(
    protected dialogRef: NbDialogRef<TrackPreviewComponent>,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    private zone: NgZone
  ) {

  }

  ngOnInit() {
    this.projectService.watchProjectInfo()
      .subscribe(projectInfo => {
        this.projectUUID = projectInfo.project_uuid;
        this.tracks = projectInfo.tracks;
      });
  }

  ngAfterViewInit() {
    this.initializeWaveSurfer();

    this.regionDragging$.pipe(debounceTime(200))
      .subscribe(() => {
        if (this.regionPlaying) {
          this.stop();
          this.playRegion();
        }
      })
  }

  changeVolume() {
    const volume = this.trackVolume / 100;
    this.wavesurfer.setVolume(volume);
  }

  mute() {
    this.lastTrackVolume = this.trackVolume;
    this.trackVolume = 0;
    this.wavesurfer.setVolume(0);
  }

  unMute() {
    this.wavesurfer.setVolume(this.lastTrackVolume / 100);
    this.trackVolume = this.lastTrackVolume;
  }

  selectTrack(track: ProjectTrack) {
    // Track is under 30s or is already selected or another track is loading
    if (
      track.meta.file_duration <= 30 ||
      this.selectedTrack === track
    ) {
      return;
    }

    // Reset track download progress
    this.downloadTrackProgress = 0;

    const trackUUID = track.file_uuid;

    // Show the loading bar
    this.trackLoading = true;

    this.selectedTrack = track;

    // Find track uuid in cache
    const cachedTrack = this.trackCache.find(tc => tc.trackUUID === trackUUID);

    // There's a cached track - play it directly
    if (cachedTrack) {
      this.loadTrackFile(track);
      return;
    }

    if (this.downloadSub) {
      this.downloadSub.unsubscribe();
    }
    // No cache track - download it
    this.downloadSub = this.collectionService.getProjectTrackFile(this.projectUUID, trackUUID)
      .pipe(map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            this.downloadTrackProgress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event.body;
        }
      }), catchError((error: HttpErrorResponse) => throwError(error)))
      .subscribe((file: Blob) => {
        if (file) {
          this.loadTrackFile(track, file);
        }
      }, () => {
        this.downloadTrackProgress = 0;
      }, () => {
        this.downloadTrackProgress = 0;
      });
  }

  playRegion() {
    this.regionPlaying = true;
    this.trackRegion.play();
  }

  stop() {
    this.regionPlaying = false;
    this.wavesurfer.pause();
  }

  setTrackPreview() {
    if (this.trackLoading || this.setTimecodesLoading) {
      return;
    }

    this.setTimecodesLoading = true;

    const trackUUID = this.selectedTrack.file_uuid;

    this.collectionService.setTrackPreviewTimeCodes(
      this.projectUUID,
      trackUUID,
      Math.floor(this.regionStart as any),
      Math.floor(this.regionEnd as any)
    ).subscribe(res => {
      this.setTimecodesLoading = false;

      const index = this.tracks.findIndex(t => t.file_uuid === trackUUID);
      this.tracks[index].track.preview_start = res.data?.meta?.preview_start;
      this.tracks[index].track.preview_stop = res.data?.meta?.preview_stop;
      this.successMessage = `Track preview set successfully`;
      setTimeout(() => this.successMessage = null, 5000);
    }, (error) => {
      this.setTimecodesLoading = false;
      this.errorMessage = `There was an error, please try again later`;
      setTimeout(() => this.errorMessage = null, 5000);
    });
  }

  secondsToTime(seconds: number | string) {
    if (typeof seconds === 'string') {
      seconds = Number(seconds.replace(':', '.'));
    }

    // Hours, minutes and seconds
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let result = '';
    if (hrs > 0) {
      result += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }
    result += '' + mins + ':' + (secs < 10 ? '0' : '');
    result += '' + secs;
    return result;
  }

  private initializeWaveSurfer() {
    const regionPlugin = WaveSurferRegions.create({
      regions: [this.regionOptions]
    });

    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferRef.nativeElement,
      plugins: [regionPlugin],
      waveColor: '#aaaaaa',
      progressColor: '#f74264',
      height: 60,
      responsive: 10,
      interact: false,
      barWidth: 2,
      barHeight: 1,
      barGap: null,
    });

    this.wavesurfer.setVolume(this.trackVolume / 100);

    this.addWavesurferEventListeners();

    // Select the first track over 30s
    const trackToSelect = this.tracks.find(t => t.meta.file_duration > 30);

    if (trackToSelect) {
      this.selectTrack(trackToSelect);
    } else {
      // If there are not tracks over 30s show the music list
      this.collectionService.setCurrentTab(ProjectTab.MUSIC);
    }
  }

  private async loadTrackFile(track: ProjectTrack, file?: Blob) {
    const trackUUID = track.file_uuid;

    // We have a downloaded file - push it to the cache
    if (file) {
      this.trackCache.push({
        trackUUID,
        file
      });

      this.wavesurfer.loadBlob(file);
    } else {
      // No downloaded file - find it from cache
      const cachedTrackFile = this.trackCache.find(tc => tc.trackUUID === trackUUID).file;

      this.wavesurfer.loadBlob(cachedTrackFile);
    }

    this.wavesurfer.on('loading', (progress: number) => {
      this.downloadTrackProgress = progress;
    });

    this.wavesurfer.on('ready', () => {
      this.trackLoading = false;

      // This fixes a bug in which if the region is at the end and we load a new track
      // wavesurfer container gets stretched and scrollbar is added
      this.wavesurfer.clearRegions();
      this.wavesurfer.addRegion(this.regionOptions);

      this.trackDuration = this.secondsToTime(this.wavesurfer.getDuration());

      this.loadTrackPreview(track);

      // This fixes a bug in which the wave element won't show
      setTimeout(() => this.wavesurfer.drawBuffer(), 0);
    });
  }

  private loadTrackPreview(track: ProjectTrack) {
    const start = track.meta.preview_start;
    const stop = track.meta.preview_stop;

    if (start && stop) {
      this.regionStart = Number(start) as any;
      this.regionEnd = Number(stop) as any;

      this.previewStart = this.secondsToTime(track.meta.preview_start);
      this.previewStop = this.secondsToTime(track.meta.preview_stop);
    } else {
      this.previewStart = '0';
      this.previewStop = '30';
    }
  }

  private addWavesurferEventListeners() {
    // When playing update the current time
    this.wavesurfer.on('audioprocess', () => {
      if (this.wavesurfer.isPlaying()) {
        if (this.currentTime !== this.secondsToTime(this.wavesurfer.getCurrentTime())) {
          // Angular's change detection doesn't behave properly so force it
          this.zone.run(() => {
            this.currentTime = this.secondsToTime(this.wavesurfer.getCurrentTime());
          });
        }
      }
    });

    // Track preview region dragging
    this.wavesurfer.on('region-updated', () => {
      this.previewStart = this.secondsToTime(this.trackRegion.start);
      this.previewStop = this.secondsToTime(this.trackRegion.end);

      // Emit track region dragging so we can debounce
      this.regionDragging$.next();

      // This fixes a bug which in some cases preview stop can be 0:29
      if (this.previewStop === '0:29') {
        this.previewStop = '0:30';
      }
    });

    // Once the trcak is finished stop playing
    this.wavesurfer.on('finish', () => {
      this.stop();
    });
  }

  close() {
    this.stop();
   this.dialogRef.close();
  }

  ngOnDestroy() {

  }

}
