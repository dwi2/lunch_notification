(function() {
  var moment = require('moment'),
    timer = require('sdk/timers'),
    tabs = require('sdk/tabs'),
    self = require('sdk/self')
    notifications = require('sdk/notifications'),
    dinbendonUrl = 'http://dinbendon.net/do/',
    bendonIconUrl = self.data.url('bendon.png'),
    now = moment(),
    startingTime = moment({hour: 10, minute: 50}),
    deadlineTime = moment({hour: 11, minute: 00}),
    isWorkingDay = function (datetime) {
      return moment.isMoment(datetime) &&
        datetime.day() > 0 && datetime.day() < 6;
    },
    turnedOff = false,
    timerId = undefined,
    onClick = function () {
      turnedOff = true;
      if (timerId) {
        timer.clearTimeout(timerId);
      }
      tabs.open({
        url: dinbendonUrl,
        inNewWindow: false,
        inBackground: false
      });
    },
    check = function () {
      now = moment();
      if (isWorkingDay(now) && !turnedOff &&
            now.isAfter(startingTime) && now.isBefore(deadlineTime)) {
        notifications.notify({
          text: '今天訂便當了嗎?',
          iconURL: bendonIconUrl,
          onClick: onClick
        });
        startTimer();
      }
    },
    startTimer = function () {
      timerId = timer.setTimeout(check, 60000);
    };
  check();
}());