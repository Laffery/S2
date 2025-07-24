import {Pagination, S2Options, TooltipOperatorMenuOptions as S2TooltipOperatorMenuOptions} from '@antv/s2';
import {TemplateRef} from '@angular/core';

export type TooltipOperatorMenuOptions = S2TooltipOperatorMenuOptions<string, string>;

export type SheetComponentOptions = S2Options<TemplateRef<void>, Pagination, TooltipOperatorMenuOptions>;
