import {Component} from '@angular/core';
import {BaseSheetComponent} from './base-sheet';

@Component({
  selector: 'app-table-sheet',
  imports: [BaseSheetComponent],
  template: `
    <app-base-sheet [dataCfg]="{ data: [], fields: { rows: [], columns: [], values: [] } }" sheetType="table">
      table-sheet works!
    </app-base-sheet>
  `
})
export class TableSheetComponent {}
