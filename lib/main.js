(function() {
  'use strict';
  var moment = require('moment'),
    timer = require('sdk/timers'),
    tabs = require('sdk/tabs'),
    self = require('sdk/self'),
    notifications = require('sdk/notifications'),
    _ = require("sdk/l10n").get,
    dinbendonUrl = 'http://dinbendon.net/do/',
    bendonIconUrl = self.data.url('bendon.png'),
    startingTime = moment({hour: 10, minute: 50}),
    deadlineTime = moment({hour: 11, minute: 0}),
    isWorkingDay = function (datetime) {
      return moment.isMoment(datetime) &&
        datetime.day() > 0 && datetime.day() < 6;
    },
    turnedOff = false,
    timerId,
    resetStateTimer,
    resetState = function () {
      var now = moment(),
        increment = 1,
        nextCheckTimeDiff;
      if (now.day() === 5) {
        increment = 3;
      } else if (now.day() === 6) {
        increment = 2;
      }
      // reset starttime and deadline to next working day
      startingTime = startingTime.add('d', increment);
      deadlineTime = deadlineTime.add('d', increment);
      turnedOff = false;
      // invoke check at next startingTime
      startTimer(startingTime.diff(now));
    },
    // call this in onClick
    startResetStateTimer = function () {
      var now = moment(),
        diff = deadlineTime.diff(now);
      diff = (diff > 0) ? diff : 0;
      if (resetStateTimer) {
        timer.clearTimeout(resetStateTimer);
      }
      // if diff < 0, means now is later than deadline
      // reset state right away
      resetStateTimer = timer.setTimeout(resetState, diff);
    },
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
    startTimer = function (timeout) {
      timeout = timeout || 60000;
      timerId = timer.setTimeout(check, timeout);
    },
    check = function () {
      var now = moment();
      startResetStateTimer();
      if (isWorkingDay(now) && !turnedOff &&
            now.isAfter(startingTime) && now.isBefore(deadlineTime)) {
        notifications.notify({
          text: _('notification'),
          iconURL: bendonIconUrl,
          onClick: onClick
        });
        startTimer();
      }
    };

  check();
}());