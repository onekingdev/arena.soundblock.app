import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountNumber'
})
export class AccountNumberPipe implements PipeTransform {

  transform(value: any, type?: string): any {
    let res = '******';
    if (type === 'credit') {
      res = '****-****-****-';
    }
    value = value + '';
    res = res + value.slice(-4);
    return res;
  }
}
