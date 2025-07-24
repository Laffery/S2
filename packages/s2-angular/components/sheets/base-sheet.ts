import {AfterViewInit, Component, ElementRef, input, signal, TemplateRef, viewChild} from '@angular/core';
import {
  BaseTooltip,
  getBaseSheetComponentOptions, PivotSheet,
  S2_PREFIX_CLS,
  S2DataConfig, S2Options, SheetType,
  SpreadSheet, TableSheet,
  ThemeCfg
} from '@antv/s2';
import {PivotChartSheet} from '@antv/s2/extends';
import {SheetComponentOptions, TooltipOperatorMenuOptions} from './options';


class CustomTooltip extends BaseTooltip<TemplateRef<void>, TooltipOperatorMenuOptions> {
}

export const RENDER_TOOLTIP_OPTIONS: SheetComponentOptions = {
  tooltip: {
    render: (spreadsheet: SpreadSheet) => new CustomTooltip(spreadsheet),
  },
};

export const getSheetComponentOptions = (
  ...options: Partial<SheetComponentOptions>[]
) =>
  getBaseSheetComponentOptions<SheetComponentOptions>(
    RENDER_TOOLTIP_OPTIONS,
    ...options,
  );


@Component({
  selector: 'app-base-sheet',
  template: `
    <div [class]="prefixCls + '-container'" #container></div>
  `,
  host: {
    class: `${S2_PREFIX_CLS}-wrapper`
  }
})
export class BaseSheetComponent implements AfterViewInit {
  readonly prefixCls = S2_PREFIX_CLS;

  readonly sheetType = input<SheetType>();
  readonly dataCfg = input<S2DataConfig>({
    data: [],
    fields: {},
  })
  readonly options = input<SheetComponentOptions>();
  readonly themeCfg = input<ThemeCfg>();

  readonly loading = signal(false);
  readonly container = viewChild('container', { read: ElementRef });

  renderSpreadSheet(container: HTMLDivElement): TableSheet | PivotSheet | PivotChartSheet {
    const s2Options = getSheetComponentOptions(this.options()!);
    if (this.sheetType() === 'table') {
      return new TableSheet(container, this.dataCfg(), s2Options as unknown as S2Options);
    } else if (this.sheetType() === 'pivotChart') {
      return new PivotChartSheet(container, this.dataCfg(), s2Options as unknown as S2Options);
    }
    return new PivotSheet(container, this.dataCfg(), s2Options as unknown as S2Options);
  }

  buildSpreadSheet(): void {
    this.loading.set(true);

    const s2 = this.renderSpreadSheet(this.container()?.nativeElement);
    s2.setThemeCfg(this.themeCfg());

    s2.render().then(() => {
      this.loading.set(false);
    });
  }

  ngAfterViewInit(): void {
    this.buildSpreadSheet();
  }
}
