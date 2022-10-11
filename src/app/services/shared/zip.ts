import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ZipEntry } from 'src/app/core/interfaces/zip-entry';
import { ZipTask } from 'src/app/core/interfaces/zip-task';
import { ZipTaskProgress } from 'src/app/core/interfaces/zip-task-progress';

import * as _ from 'lodash';

declare const zip: any;

@Injectable({
  providedIn: 'root'
})
export class ZipService {
  public progress: any;

  constructor() {
    zip.workerScriptsPath = 'assets/scripts/';
  }

  getEntries(file: File): Observable<ZipEntry[]> {
    return new Observable(subscriber => {
      const reader = new zip.BlobReader(file);
      zip.createReader(reader, zipReader => {
        zipReader.getEntries(entries => {
          subscriber.next(entries);
          subscriber.complete();
        });
      }, message => {
        subscriber.error({ message });
      }
      );
    });
  }

  getData(entry: ZipEntry): ZipTask {
    const progress: any = new Subject<ZipTaskProgress>();

    const data = new Observable<Blob>(subscriber => {
      const writer = new zip.BlobWriter();

      // Using `as any` because we don't want to expose this
      // method in the interface
      (entry as any).getData(writer, blob => {
        subscriber.next(blob);
        subscriber.complete();
        progress.next(null);
      }, (current, total) => {
        this.progress = current;
        progress.next({ active: true, current, total });
      }
      );
    });
    return { progress, data };
  }
}
