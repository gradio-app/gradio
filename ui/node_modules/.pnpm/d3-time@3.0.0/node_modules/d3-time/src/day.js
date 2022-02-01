import interval from "./interval.js";
import {durationDay, durationMinute} from "./duration.js";

var day = interval(
  date => date.setHours(0, 0, 0, 0),
  (date, step) => date.setDate(date.getDate() + step),
  (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  date => date.getDate() - 1
);

export default day;
export var days = day.range;
