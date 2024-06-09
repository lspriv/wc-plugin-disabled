/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-10 07:37:42
 */
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DisabledPlugin, DISABLED_PLUGIN_KEY } = require('../../plugins/wc-plugin-disabled/index');

WxCalendar.use(DisabledPlugin);

Page({
  data: {
    padding: 0
  },
  onLoad() {
    const { bottom } = wx.getMenuButtonBoundingClientRect();
    this.setData({
      padding: bottom
    });
  },
  handleLoad(e) {
    const calendar = this.selectComponent('#calendar');
    const disabledPlugin = calendar.getPlugin(DISABLED_PLUGIN_KEY);

    disabledPlugin.disable([
      { year: 2024, month: 6, day: 9 },
      { year: 2024, month: 6, day: 10 }
    ]);
    console.log('handleLoad', e);
  },
  handleChange({ detail }) {
    console.log('calendar-date-change', detail);
  },
  handleViewChange({ detail }) {
    console.log('calendar-view-change', detail);
  },
  handleSchedule(e) {
    console.log('handleSchedule', e);
  }
});
