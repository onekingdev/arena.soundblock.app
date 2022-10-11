import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {
  transform(value: any, format?: string): string|null {
    return formatDate(value * 1000, format === undefined ? 'MM-dd-y' : format, 'en');
  }
}
