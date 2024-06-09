/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-06-10 07:20:15
 */
import {
  type Plugin,
  type WcYear,
  type CalendarDay,
  type CalendarData,
  type PluginService,
  type CalendarEventDetail,
  type Nullable,
  type TrackDateResult,
  type TrackYearResult,
  type WcAnnualMarks,
  type EventIntercept,
  type OnceEmiter,
  timestamp,
  isSameDate,
  normalDate,
  isLeapYear,
  getAnnualMarkKey,
  GREGORIAN_MONTH_DAYS
} from '@lspriv/wx-calendar/lib';

export interface DisabledPluginOpts {
  style: Record<string, string | number>;
}

type DateRange = [start: CalendarDay, end: CalendarDay];

export type DisabledArray = Array<CalendarDay | DateRange>;

type TouchEvent = WechatMiniprogram.TouchEvent<{}, { wdx: number; ddx: number }>;

const timestampRange = (range: DateRange) => range.map(item => timestamp(item)).sort();

export class DisabledPlugin implements Plugin {
  static KEY = 'wc-plugin-disabled' as const;

  private options: DisabledPluginOpts;

  private disabled: DisabledArray;

  private service: PluginService;

  constructor(options?: Partial<DisabledPluginOpts>) {
    this.options = this.formOptions(options);
    this.disabled = [];
  }

  private formOptions(options?: Partial<DisabledPluginOpts>): DisabledPluginOpts {
    return {
      style: {
        pointerEvents: 'none',
        touchAction: 'none',
        opacity: 0.3,
        ...options?.style
      }
    };
  }

  PLUGIN_INITIALIZE(service: PluginService) {
    this.service = service;
  }

  PLUGIN_ON_ATTACH(service: PluginService, sets: Partial<CalendarData>) {
    sets.pointer!.show = false;
    service.component._pointer_.show = false;
  }

  PLUGIN_ON_LOAD(_: PluginService, detail: CalendarEventDetail) {
    detail.checked = void 0;
  }

  PLUGIN_ON_CHANGE(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter): void {
    if (detail.source !== 'click') emiter.cancel();
    service.component._pointer_.show = false;
  }

  PLUGIN_CATCH_TAP(service: PluginService, event: TouchEvent, intercept: EventIntercept): void {
    const { wdx, ddx } = event.mark!;
    const panel = service.component.data.panels[service.component.data.current];
    const date = panel.weeks[wdx].days[ddx];
    if (this.isDateDisabled(date)) intercept();
    else service.component._pointer_.show = true;
  }

  PLUGIN_TRACK_DATE(date: CalendarDay): Nullable<TrackDateResult> {
    if (!this.isDateDisabled(date)) return null;
    return {
      style: this.options.style
    };
  }

  PLUGIN_TRACK_YEAR(year: WcYear): Nullable<TrackYearResult> {
    const marks: WcAnnualMarks = new Map();
    for (let i = 0; i < 12; i++) {
      const days = i === 1 && isLeapYear(year.year) ? GREGORIAN_MONTH_DAYS[i] + 1 : GREGORIAN_MONTH_DAYS[i];
      for (let j = 0; j < days; j++) {
        const date = { year: year.year, month: i + 1, day: j + 1 };
        const key = getAnnualMarkKey({ month: date.month, day: date.day });

        if (this.isDateDisabled(date)) {
          const opacity = this.options.style.opacity;
          marks.set(key, {
            style: {
              opacity: { light: opacity, dark: opacity }
            }
          });
        }
      }
    }
    return marks.size ? { marks } : null;
  }

  PLUGIN_DATES_FILTER(_, dates: Array<CalendarDay | DateRange>): Array<CalendarDay | DateRange> {
    return this.filter(dates);
  }

  public disable(dates: DisabledArray, clear: boolean = false) {
    const deletes: DisabledArray = [];
    if (clear) {
      deletes.push(...this.disabled);
      this.disabled = [];
    }
    this.disabled = this.mergeDisabled([...this.disabled, ...dates]);

    const updates = deletes.length ? this.mergeDisabled([...this.disabled, ...deletes]) : this.disabled;
    this.update(updates);
  }

  public filter(dates: Array<CalendarDay | DateRange>): Array<CalendarDay | DateRange> {
    return dates.flatMap(item => {
      if (Array.isArray(item)) {
        const arr: Array<CalendarDay | DateRange> = [];
        let [start, end] = timestampRange(item);
        for (let i = start; i <= end; i += 86400000) {
          const date = normalDate(i);
          if (this.isDateDisabled(date)) {
            const { year: y1, month: m1, day: d1 } = date;
            if (i > start) {
              const last = i - 86400000;
              if (last <= start) arr.push({ year: y1, month: m1, day: d1 });
              else {
                const { year: y2, month: m2, day: d2 } = normalDate(start);
                const { year: y3, month: m3, day: d3 } = normalDate(last);
                arr.push([
                  { year: y2, month: m2, day: d2 },
                  { year: y3, month: m3, day: d3 }
                ]);
              }
            }
            start = i + 86400000;
          }
        }
        return arr.length ? arr : item;
      } else return this.isDateDisabled(item) ? [] : item;
    });
  }

  public isDateDisabled(date: CalendarDay): boolean {
    const dateTimestamp = timestamp(date);
    for (let i = this.disabled.length; i--; ) {
      const item = this.disabled[i];
      if (Array.isArray(item)) {
        const range = timestampRange(item);
        if (dateTimestamp >= range[0] && dateTimestamp <= range[1]) return true;
      } else {
        if (isSameDate(item, date)) return true;
      }
    }
    return false;
  }

  private mergeDisabled(dates: DisabledArray): DisabledArray {
    const disabled: Array<number | [number, number]> = [];
    const _dates = dates.flatMap<number | [number, number]>(item => {
      if (Array.isArray(item)) {
        if (item.length) return item.length > 1 ? [timestampRange(item) as [number, number]] : timestamp(item[0]);
        else return [];
      } else return timestamp(item);
    });
    const ranges = _dates.filter(item => Array.isArray(item));
    for (let i = _dates.length; i--; ) {
      const date = _dates[i];
      if (Array.isArray(date)) {
        const inRange = disabled.findIndex(item => Array.isArray(item) && !(date[0] > item[1] || date[1] < item[0]));
        if (inRange >= 0) {
          const range = disabled[inRange];
          disabled.splice(inRange, 1, [Math.min(date[0], range[0]), Math.max(date[1], range[1])]);
        } else {
          disabled.push(date);
        }
      } else {
        let inRange: number | [number, number] | undefined = ranges.find(item => date >= item[0] && date <= item[1]);
        if (!inRange) inRange = disabled.find(item => !Array.isArray(item) && item === date);
        if (!inRange) disabled.push(date);
      }
    }

    return disabled.map(item => {
      if (Array.isArray(item)) return item.map(date => normalDate(date)) as DateRange;
      return normalDate(item);
    });
  }

  private update(updates: DisabledArray) {
    this.service.updateRange(updates.map(item => (Array.isArray(item) ? item : [item])));
    const years = [
      ...new Set(
        updates.flatMap(item => {
          if (Array.isArray(item)) {
            const arr: number[] = [];
            for (let i = item[0].year; i <= item[1].year; i++) arr.push(i);
            return arr;
          } else return item.year;
        })
      )
    ];
    this.service.updateAnnuals(years);
  }
}

export const DISABLED_PLUGIN_KEY = DisabledPlugin.KEY;
