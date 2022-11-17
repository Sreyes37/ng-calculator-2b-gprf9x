import { Pipe, PipeTransform } from '@angular/core';
import * as math from 'mathjs';

import { Token } from './calculator.component';

@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {
  transform(token: Token): string {
    if (typeof token === 'number') {
      token = math.format(token, {
        notation: 'auto',
        precision: 12,
        lowerExp: -15,
        upperExp: 15
      });
    }

    return token
      .replace('.', ',')
      .replace('*', '×')
      .replace('/', ':')
      .replace('-', '–');
  }
}