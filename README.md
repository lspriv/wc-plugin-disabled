## Wx Calendar Plugin For MultiSelector
![NPM Version](https://img.shields.io/npm/v/@lspriv/wc-plugin-disabled)
![Static Badge](https://img.shields.io/badge/coverage-later-a9a9a9)
![GitHub License](https://img.shields.io/github/license/lspriv/wc-plugin-disabled)

小程序日历 [`wx-calendar`](https://github.com/lspriv/wx-calendar) 日期禁用插件

### 使用
- 小程序基础库 `SDKVersion` >= 3.0.0
- 日历组件 [`wx-calendar`](https://github.com/lspriv/wx-calendar) >= 1.7.0

#### 安装
```bash
npm i @lspriv/wc-plugin-disabled -S
```

#### 构建
微信小程序开发工具菜单栏：`工具` --> `构建 npm`
[*官方文档*](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#_2-%E6%9E%84%E5%BB%BA-npm)

#### 页面使用
```html
<calendar id="calendar" />
```
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DisabledPlugin, DISABLED_PLUGIN_KEY } = require('@lspriv/wc-plugin-disabled');

WxCalendar.use(DisabledPlugin, { 
  ... // 见插件选项，也可以不传
});

Page({
  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    const disabledPlugin = calendar.getPlugin(DISABLED_PLUGIN_KEY);

    disabledPlugin.disable([
      { year: 2024, month: 6, day: 7 }, // 禁用单个日期
      // 禁用一个范围的日期
      [                              
        { year: 2024, month: 6, day: 10 },
        { year: 2024, month: 6, day: 15 }
      ]
    ]);

    disabledPlugin.isDateDisabled({ year: 2024, month: 6, day: 7 }); // 判断某个日期是否被禁用

    // 对传入的日期进行过滤，过滤掉当前已被禁用的日期
    disabledPlugin.filter([  
      { year: 2024, month: 6, day: 6 }, // 单个日期
      // 一个范围
      [                                 
        { year: 2024, month: 6, day: 12 },
        { year: 2024, month: 6, day: 18 }
      ]
    ])
  }
})
```

### 插件选项

<table>
    <tr>
        <th>选项</th>
        <th>类型</th>
        <th>说明</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>style</td>
        <td>object</td>
        <td>禁用样式</td>
        <td>{ opacity: 0.3 }</td>
    </tr>
</table>

### 方法

[***`disable`***](#disable) 禁用日期
```typescript
{
  /**
   * @param dates 要禁用的日期
   * @param clear 是否清除当前已禁用的日期，默认 false
   */
  (dates: Array<CalendarDay | DateRange>, clear?: boolean): void;
}
```
```typescript
type DateRange = [start: CalendarDay, end: CalendarDay];
```

[***`isDateDisabled`***](#isDateDisabled) 日期是否被禁用
```typescript
{
  /**
   * @param date 要判断的日期
   */
  (date: CalendarDay): boolean;
}
```

[***`filter`***](#filter) 过滤日期
```typescript
{filter
  /**
   * @param date 要判断的日期
   */
  (dates: Array<CalendarDay | DateRange>): Array<CalendarDay | DateRange>;
}
```

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的道友加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)

