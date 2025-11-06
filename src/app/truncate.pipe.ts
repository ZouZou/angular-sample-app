import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: false
})
export class TruncatePipe implements PipeTransform {

  transform(value: any): any {
    return value.split(' ').slice(0, 2).join(' ') + '...';
  }

}
