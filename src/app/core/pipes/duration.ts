import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number, ...args: any[]): any {
    let hour, min, sec;
    hour = Math.floor(value / 3600);
    min = Math.floor((value % 3600) / 60);
    sec = value % 60;
    hour = (hour < 10) ? '0' + hour : hour;
    min = (min < 10) ? '0' + min : min;
    sec = (sec < 10) ? '0' + sec : sec;
    const str = hour + ':' + min + ':' + sec;
    return str;
  }

}
