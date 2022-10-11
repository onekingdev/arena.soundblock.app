import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'epoch'
})
export class EpochPipe implements PipeTransform {

// Posted Month 1, 2021 (Updated Month 1, 2021) 

  transform(timestamp: number, type: string): string {
    switch(type) {
      case 'mediumDate':
        return moment.unix(timestamp).format('MMMM D, YYYY');
      default:
        break;
    }
    return 'ssd';
  }

}
