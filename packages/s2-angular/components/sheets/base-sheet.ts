import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  BaseTooltip,
  getBaseSheetComponentOptions,
  PivotSheet,
  S2_PREFIX_CLS,
  S2DataConfig,
  S2Options,
  S2RenderOptions,
  SheetType,
  SpreadSheet,
  TableSheet,
  ThemeCfg,
} from '@antv/s2';
import { PivotChartSheet } from '@antv/s2/extends';
import { SheetComponentOptions, TooltipOperatorMenuOptions } from './options';

type SheetInstance = TableSheet | PivotSheet | PivotChartSheet;

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
  selector: 's2-base-sheet',
  template: `
    <div [class]="prefixCls + '-container'" #container></div>
  `,
  host: {
    class: `${S2_PREFIX_CLS}-wrapper`,
  },
})
export class BaseSheetComponent implements AfterViewInit, OnDestroy {
  readonly prefixCls = S2_PREFIX_CLS;

  readonly sheetType = input<SheetType>();
  readonly dataCfg = input<S2DataConfig>({
    data: [],
    fields: {},
  });
  readonly options = input<SheetComponentOptions>();
  readonly themeCfg = input<ThemeCfg>();

  readonly loading = signal(false);
  readonly container = viewChild('container', { read: ElementRef });

  private mounted = false;
  private spreadsheet?: SheetInstance;
  private currentSheetType?: SheetType;
  private currentDataCfg?: S2DataConfig;
  private currentOptions?: SheetComponentOptions;
  private currentThemeCfg?: ThemeCfg;

  constructor() {
    effect(() => {
      this.sheetType();
      this.dataCfg();
      this.options();
      this.themeCfg();

      if (!this.mounted || !this.spreadsheet) {
        return;
      }

      queueMicrotask(() => {
        void this.updateSpreadSheet();
      });
    });
  }

  renderSpreadSheet(container: HTMLDivElement): SheetInstance {
    const s2Options = getSheetComponentOptions(this.options() ?? {});

    if (this.sheetType() === 'table') {
      return new TableSheet(
        container,
        this.dataCfg(),
        s2Options as unknown as S2Options,
      );
    }

    if (this.sheetType() === 'pivotChart') {
      return new PivotChartSheet(
        container,
        this.dataCfg(),
        s2Options as unknown as S2Options,
      );
    }

    return new PivotSheet(
      container,
      this.dataCfg(),
      s2Options as unknown as S2Options,
    );
  }

  async buildSpreadSheet(): Promise<void> {
    const container = this.container()?.nativeElement;

    if (!container) {
      return;
    }

    this.loading.set(true);

    try {
      this.spreadsheet?.destroy();
      this.spreadsheet = this.renderSpreadSheet(container);
      this.currentSheetType = this.sheetType();
      this.currentDataCfg = this.dataCfg();
      this.currentOptions = this.options();
      this.currentThemeCfg = this.themeCfg();

      this.spreadsheet.setThemeCfg(this.themeCfg());
      await this.spreadsheet.render();
    } finally {
      this.loading.set(false);
    }
  }

  async updateSpreadSheet(): Promise<void> {
    if (this.currentSheetType !== this.sheetType()) {
      await this.buildSpreadSheet();
      return;
    }

    const dataCfg = this.dataCfg();
    const options = this.options();
    const themeCfg = this.themeCfg();
    const dataCfgChanged = this.currentDataCfg !== dataCfg;
    const optionsChanged = this.currentOptions !== options;
    const themeCfgChanged = this.currentThemeCfg !== themeCfg;
    const columnsChanged =
      this.currentDataCfg?.fields?.columns?.length !==
      dataCfg.fields?.columns?.length;
    const rebuildDataSet =
      this.currentOptions?.hierarchyType !== options?.hierarchyType;
    const renderOptions: S2RenderOptions = {
      reloadData: dataCfgChanged || rebuildDataSet,
      rebuildDataSet,
    };

    this.currentDataCfg = dataCfg;
    this.currentOptions = options;
    this.currentThemeCfg = themeCfg;
    this.loading.set(true);

    try {
      if (dataCfgChanged || rebuildDataSet) {
        if (columnsChanged) {
          this.spreadsheet?.facet?.clearInitColLeafNodes();
        }

        this.spreadsheet?.setDataCfg(dataCfg);
      }

      if (optionsChanged) {
        const s2Options = getSheetComponentOptions(options ?? {});

        this.spreadsheet?.setOptions(s2Options as unknown as S2Options);
        this.spreadsheet?.changeSheetSize(options?.width, options?.height);
      }

      if (themeCfgChanged) {
        this.spreadsheet?.setThemeCfg(themeCfg);
      }

      await this.spreadsheet?.render(renderOptions);
    } finally {
      this.loading.set(false);
    }
  }

  ngAfterViewInit(): void {
    this.mounted = true;
    void this.buildSpreadSheet();
  }

  ngOnDestroy(): void {
    this.loading.set(false);
    this.spreadsheet?.destroy();
    this.spreadsheet = undefined;
  }
}
