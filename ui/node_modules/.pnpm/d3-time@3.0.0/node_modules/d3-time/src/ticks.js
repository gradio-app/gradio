import {bisector, tickStep} from "d3-array";
import {durationDay, durationHour, durationMinute, durationMonth, durationSecond, durationWeek, durationYear} from "./duration.js";
import millisecond from "./millisecond.js";
import second from "./second.js";
import minute from "./minute.js";
import hour from "./hour.js";
import day from "./day.js";
import {sunday as week} from "./week.js";
import month from "./month.js";
import year from "./year.js";
import utcMinute from "./utcMinute.js";
import utcHour from "./utcHour.js";
import utcDay from "./utcDay.js";
import {utcSunday as utcWeek} from "./utcWeek.js";
import utcMonth from "./utcMonth.js";
import utcYear from "./utcYear.js";

function ticker(year, month, week, day, hour, minute) {

  const tickIntervals = [
    [second,  1,      durationSecond],
    [second,  5,  5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute,  1,      durationMinute],
    [minute,  5,  5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [  hour,  1,      durationHour  ],
    [  hour,  3,  3 * durationHour  ],
    [  hour,  6,  6 * durationHour  ],
    [  hour, 12, 12 * durationHour  ],
    [   day,  1,      durationDay   ],
    [   day,  2,  2 * durationDay   ],
    [  week,  1,      durationWeek  ],
    [ month,  1,      durationMonth ],
    [ month,  3,  3 * durationMonth ],
    [  year,  1,      durationYear  ]
  ];

  function ticks(start, stop, count) {
    const reverse = stop < start;
    if (reverse) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop
    return reverse ? ticks.reverse() : ticks;
  }

  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i = bisector(([,, step]) => step).right(tickIntervals, target);
    if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
    if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }

  return [ticks, tickInterval];
}

const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcWeek, utcDay, utcHour, utcMinute);
const [timeTicks, timeTickInterval] = ticker(year, month, week, day, hour, minute);

export {utcTicks, utcTickInterval, timeTicks, timeTickInterval};
