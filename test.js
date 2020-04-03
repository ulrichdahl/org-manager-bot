var chrono = require('chrono-node');
var moment = require('moment-timezone');
var ics = require('ics');

global.parseTimeString = function(string) { 
    var time = moment.tz('CET').utc().format('HH:mm');
    // console.log('UTC time now', time);
    time = chrono.parseDate(time, new Date(), { forwardDate: true });
    // console.log('Chrono parsed time now', time);
    var timeDiff = moment.tz('CET').diff(time, 'minutes');
    // console.log('Chrono diff to UTC', timeDiff);
    time.setMinutes(time.getMinutes() + timeDiff);
    // console.log('Corrected UTC time', time);

    time = chrono.parseDate(string, new Date(), { forwardDate: true });
    // console.log('Chrono parsed time of: ' + string, time);
    time.setMinutes(time.getMinutes() + timeDiff - moment.tz('CET').utcOffset());
    // console.log('Corrected chrono time', time);
    time = moment.tz(time, 'UTC');
    return time;
}



console.log('Moment time output', parseTimeString("tomorrow 21:00").locale('da').tz('CET').format('LLLL z'));
