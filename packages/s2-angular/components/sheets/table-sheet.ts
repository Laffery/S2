import { Component, input } from '@angular/core';
import { S2DataConfig, ThemeCfg } from '@antv/s2';
import { BaseSheetComponent } from './base-sheet';
import { SheetComponentOptions } from './options';

@Component({
  selector: 's2-table-sheet',
  imports: [BaseSheetComponent],
  template: `
    <s2-base-sheet
      [dataCfg]="dataCfg()"
      sheetType="table"
      [options]="options()"
      [themeCfg]="themeCfg()"
    />
  `,
})
export class TableSheetComponent {
  readonly dataCfg = input<S2DataConfig>({
    data: [],
    fields: {},
  });
  readonly options = input<SheetComponentOptions>();
  readonly themeCfg = input<ThemeCfg>();
}
