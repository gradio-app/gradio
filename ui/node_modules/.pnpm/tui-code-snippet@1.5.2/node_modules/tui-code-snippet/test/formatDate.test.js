'use strict';

var formatDate = require('../src/js/formatDate');

describe('date format', function() {
    it('date format function is defined', function() {
        expect(formatDate).toBeDefined();
    });

    describe('test various inputs', function() {
        var inputs = [
                {year: 1999,
                    month: 9,
                    date: 9,
                    hour: 0,
                    minute: 2},
                {year: 2010,
                    month: 12,
                    date: 13,
                    hour: 10,
                    minute: 0},
                {year: 12,
                    month: 1,
                    date: 29,
                    hour: 23,
                    minute: 40}
            ],
            forms = [
                'yyyy-MM-dd',
                'yy-MM-dd',
                'yy-MM-DD',
                'yyyy년 M월 dd일',
                'yy, M-dd',
                'yyyy년 M/d',
                'yyyy-MM-d',
                '\\a, yyyy-MM-d',
                'MMM DD YYYY HH:mm',
                'MMMM DD YYYY H:m A'
            ];

        describe('plain object', function() {
            describe('{year: 1999, month: 9, date: 9, hour: 0, minute: 2}', function() {
                it('-> yyyy-MM-dd', function() {
                    expect(formatDate(forms[0], inputs[0])).toEqual('1999-09-09');
                });
                it('-> yy-MM-dd', function() {
                    expect(formatDate(forms[1], inputs[0])).toEqual('99-09-09');
                });
                it('-> yy-MM-DD', function() {
                    expect(formatDate(forms[2], inputs[0])).toEqual('99-09-09');
                });
                it('-> yyyy년 M월 dd일', function() {
                    expect(formatDate(forms[3], inputs[0])).toEqual('1999년 9월 09일');
                });
                it('-> yy, M-dd', function() {
                    expect(formatDate(forms[4], inputs[0])).toEqual('99, 9-09');
                });
                it('-> yyyy년 M/d', function() {
                    expect(formatDate(forms[5], inputs[0])).toEqual('1999년 9/9');
                });
                it('-> yyyy-MM-d', function() {
                    expect(formatDate(forms[6], inputs[0])).toEqual('1999-09-9');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    expect(formatDate(forms[7], inputs[0])).toEqual('a, 1999-09-9');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    expect(formatDate(forms[8], inputs[0])).toEqual('Sep 09 1999 00:02');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    expect(formatDate(forms[9], inputs[0])).toEqual('September 09 1999 12:2 AM');
                });
            });

            describe('{year: 2010, month: 12, date: 13, hour: 10, minute: 0}', function() {
                it('-> yyyy-MM-dd', function() {
                    expect(formatDate(forms[0], inputs[1])).toEqual('2010-12-13');
                });
                it('-> yy-MM-dd', function() {
                    expect(formatDate(forms[1], inputs[1])).toEqual('10-12-13');
                });
                it('-> yy-MM-DD', function() {
                    expect(formatDate(forms[2], inputs[1])).toEqual('10-12-13');
                });
                it('-> yyyy년 M월 dd일', function() {
                    expect(formatDate(forms[3], inputs[1])).toEqual('2010년 12월 13일');
                });
                it('-> yy, M-dd', function() {
                    expect(formatDate(forms[4], inputs[1])).toEqual('10, 12-13');
                });
                it('-> yyyy년 M/d', function() {
                    expect(formatDate(forms[5], inputs[1])).toEqual('2010년 12/13');
                });
                it('-> yyyy-MM-d', function() {
                    expect(formatDate(forms[6], inputs[1])).toEqual('2010-12-13');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    expect(formatDate(forms[7], inputs[1])).toEqual('a, 2010-12-13');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    expect(formatDate(forms[8], inputs[1])).toEqual('Dec 13 2010 10:00');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    expect(formatDate(forms[9], inputs[1])).toEqual('December 13 2010 10:0 AM');
                });
            });

            describe('{year: 12, month: 1, date: 29, hour: 23, minute: 40}', function() {
                it('-> yyyy-MM-dd', function() {
                    expect(formatDate(forms[0], inputs[2])).toEqual('2012-01-29');
                });
                it('-> yy-MM-dd', function() {
                    expect(formatDate(forms[1], inputs[2])).toEqual('12-01-29');
                });
                it('-> yy-MM-DD', function() {
                    expect(formatDate(forms[2], inputs[2])).toEqual('12-01-29');
                });
                it('-> yyyy년 M월 dd일', function() {
                    expect(formatDate(forms[3], inputs[2])).toEqual('2012년 1월 29일');
                });
                it('-> yy, M-dd', function() {
                    expect(formatDate(forms[4], inputs[2])).toEqual('12, 1-29');
                });
                it('-> yyyy년 M/d', function() {
                    expect(formatDate(forms[5], inputs[2])).toEqual('2012년 1/29');
                });
                it('-> yyyy-MM-d', function() {
                    expect(formatDate(forms[6], inputs[2])).toEqual('2012-01-29');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    expect(formatDate(forms[7], inputs[2])).toEqual('a, 2012-01-29');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    expect(formatDate(forms[8], inputs[2])).toEqual('Jan 29 2012 23:40');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    expect(formatDate(forms[9], inputs[2])).toEqual('January 29 2012 11:40 PM');
                });
            });
        });

        describe('Date Object', function() {
            describe('new Date(1999, 8, 9, 0, 2}', function() {
                it('-> yyyy-MM-dd', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[0], dt)).toEqual('1999-09-09');
                });
                it('-> yy-MM-dd', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[1], dt)).toEqual('99-09-09');
                });
                it('-> yy-MM-DD', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[2], dt)).toEqual('99-09-09');
                });
                it('-> yyyy년 M월 dd일', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[3], dt)).toEqual('1999년 9월 09일');
                });
                it('-> yy, M-dd', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[4], dt)).toEqual('99, 9-09');
                });
                it('-> yyyy년 M/d', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[5], dt)).toEqual('1999년 9/9');
                });
                it('-> yyyy-MM-d', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[6], dt)).toEqual('1999-09-9');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[7], dt)).toEqual('a, 1999-09-9');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[8], dt)).toEqual('Sep 09 1999 00:02');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    var date = inputs[0],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[9], dt)).toEqual('September 09 1999 12:2 AM');
                });
            });

            describe('new Date(2010, 11, 13, 10, 0)', function() {
                it('-> yyyy-MM-dd', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[0], dt)).toEqual('2010-12-13');
                });
                it('-> yy-MM-dd', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[1], dt)).toEqual('10-12-13');
                });
                it('-> yy-MM-DD', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[2], dt)).toEqual('10-12-13');
                });
                it('-> yyyy년 M월 dd일', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[3], dt)).toEqual('2010년 12월 13일');
                });
                it('-> yy, M-dd', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[4], dt)).toEqual('10, 12-13');
                });
                it('-> yyyy년 M/d', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[5], dt)).toEqual('2010년 12/13');
                });
                it('-> yyyy-MM-d', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[6], dt)).toEqual('2010-12-13');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[7], dt)).toEqual('a, 2010-12-13');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[8], dt)).toEqual('Dec 13 2010 10:00');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    var date = inputs[1],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[9], dt)).toEqual('December 13 2010 10:0 AM');
                });
            });

            describe('new Date(2012, 0, 29, 23, 40)', function() {
                it('-> yyyy-MM-dd', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[0], dt)).toEqual('2012-01-29');
                });
                it('-> yy-MM-dd', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[1], dt)).toEqual('12-01-29');
                });
                it('-> yy-MM-DD', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[2], dt)).toEqual('12-01-29');
                });
                it('-> yyyy년 M월 dd일', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[3], dt)).toEqual('2012년 1월 29일');
                });
                it('-> yy, M-dd', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[4], dt)).toEqual('12, 1-29');
                });
                it('-> yyyy년 M/d', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[5], dt)).toEqual('2012년 1/29');
                });
                it('-> yyyy-MM-d', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[6], dt)).toEqual('2012-01-29');
                });
                it('-> \\a, yyyy-MM-d', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[7], dt)).toEqual('a, 2012-01-29');
                });
                it('-> MMM DD YYYY HH:mm', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[8], dt)).toEqual('Jan 29 2012 23:40');
                });
                it('-> MMMM DD YYYY H:m A', function() {
                    var date = inputs[2],
                        nYear = (date.year < 100) ? date.year + 2000 : date.year,
                        nMonth = date.month - 1,
                        nDate = date.date,
                        dt = new Date(nYear, nMonth, nDate, date.hour, date.minute);

                    expect(formatDate(forms[9], dt)).toEqual('January 29 2012 11:40 PM');
                });
            });
        });

        describe('meridiemSet', function() {
            it('AM -> 오전', function() {
                var option = {
                    meridiemSet: {
                        AM: '오전',
                        PM: '오후'
                    }
                };
                var date = {year: 1999,
                    month: 9,
                    date: 9,
                    hour: 0,
                    minute: 2};

                expect(formatDate('yyyy-MM-dd a hh:mm', date, option)).toEqual('1999-09-09 오전 12:02');
            });
            it('PM -> 오후', function() {
                var option = {
                    meridiemSet: {
                        AM: '오전',
                        PM: '오후'
                    }
                };
                var date = {year: 1999,
                    month: 9,
                    date: 9,
                    hour: 13,
                    minute: 2};

                expect(formatDate('yyyy-MM-dd A hh:mm', date, option)).toEqual('1999-09-09 오후 01:02');
            });
        });

        it('not full-date but time format', function() {
            var date = {year: 1999,
                month: 9,
                date: 9,
                hour: 2,
                minute: 3};

            expect(formatDate('a hh:mm', date)).toEqual('AM 02:03');
        });

        it('not full-date but time format with meridiemSet', function() {
            var option = {
                meridiemSet: {
                    AM: '오전',
                    PM: '오후'
                }
            };
            var date = {year: 1999,
                month: 9,
                date: 9,
                hour: 12,
                minute: 3};

            // See the clock system: https://en.wikipedia.org/wiki/12-hour_clock
            expect(formatDate('a hh:mm', date, option)).toEqual('오후 12:03');
        });
    });
});
