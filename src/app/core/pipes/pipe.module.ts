import { NgModule } from '@angular/core';

import { DateAgoPipe } from './date-ago';
import { FileSizePipe } from './size';
import { AccountNumberPipe } from './account-number';
import { DurationPipe } from './duration';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TimestampPipe } from './timestamp.pipe';
import { EpochPipe } from './epoch.pipe';

@NgModule({
  declarations: [FileSizePipe, DateAgoPipe, AccountNumberPipe, DurationPipe, SafeHtmlPipe, TimestampPipe, EpochPipe],
  exports: [FileSizePipe, DateAgoPipe, AccountNumberPipe, DurationPipe, SafeHtmlPipe, TimestampPipe, EpochPipe],
})
export class PipeModule { }
