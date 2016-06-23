function ISODateString(d) {
    function pad(n) {
        return n<10 ? '0'+n : n;
    };
    return d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth()+1) + '-'
        + pad(d.getUTCDate()) + 'T'
        + pad(d.getUTCHours()) + ':'
        + pad(d.getUTCMinutes()) + ':'
        + pad(d.getUTCSeconds()) + 'Z';
};

function parseItemDate(item) {
    function monthFromNum(v) {
        var n = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return n[parseInt(v) - 1];
    };
    function dayFromNum(v) {
        var n = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return n[parseInt(v) - 1];
    };

    var allDay = item.start.date? true : false;
    var startDT = allDay ? item.start.date : item.start.dateTime;
    var dateTime = startDT.split("T"); //split date from time
    var date = dateTime[0].split("-"); //split yyyy mm dd
    var startYear = date[0];
    var startMonth = monthFromNum(date[1]);
    var startDay = date[2];
    var startDateISO = new Date(startMonth + " " + startDay + ", " + startYear + " 00:00:00");
    var startDayWeek = dayFromNum(startDateISO.getDay());

    if (allDay == true) { //change this to match your needs
        var returnDateString = startDayWeek + ' ' + startDay + ' ' + startMonth + ' ' + startYear + ' ' + 'All Day';
        var hashDate = date[0] + date[1] + date[2] + '0000';
        console.log(hashDate);
        var optionList = [returnDateString, hashDate];
        return optionList;
    }
    else {
        var time = dateTime[1].split(":"); //split hh ss etc...
        var startHour = time[0];
        var startMin = time[1];
        var hashDate = date[0] + date[1] + date[2] + startHour + startMin;
        var returnDateString = startDayWeek + ' ' + startDay + ' ' + startMonth + ' ' + startYear + ' ' + startHour + ':' + startMin;
        var optionList = [returnDateString, hashDate];
        return optionList;
    }
}
function DownloadCalendar() {
    // See also http://stackoverflow.com/questions/28262674/retrieve-google-calendar-events-using-api-v3-in-javascript
    
    gapi.client.setApiKey('AIzaSyDaB6Hw8JXt0gZRWbG7w7dL1zniFngTxUY');
    gapi.client.load('calendar', 'v3')
        .then(
            function() {
                var today = new Date();
                var nextWeek = new Date();
                nextWeek.setDate(today.getDate() + 7);
                var request = gapi.client.calendar.events.list({
                    'calendarId': 'berkeley.edu_6100gbs47mg4ofjljkfjh7b3so@group.calendar.google.com',
//                    'orderBy': 'startTime',
//                    'singleEvents': true,
                    'timeMin': ISODateString(today),
                    'timeMax': ISODateString(nextWeek)
                });
                request.execute(function(resp) {
                    console.log(resp);
                    var dateList = {};

                    for (var i = 0; i < resp.items.length; i++) {
                        var item = resp.items[i];
                        var dateInfo = parseItemDate(item);
                        var dateInfoHash = dateInfo[1];
                        dateList[dateInfoHash] = item;
                        // dateList.push({
                        //     key:   dateInfoHash,
                        //     value: item
                        // });
                    }

                    var keys = Object.keys(dateList);
                    keys.sort(function(a, b){return a-b});
                    console.log(keys);

                    for (i in keys) {
                        var li = document.createElement('li');
                        var id = keys[i]
                        var item = dateList[id];
                        li.innerHTML = item.summary;
                        if (item.recurrence) {
                            li.innerHTML += ' [weekly]';
                            li.className = li.className + " weekly";
                        } else {
                            li.className = li.className + " single";
                        }
                        var dateInfo = parseItemDate(item);
                        li.innerHTML += ' ' + dateInfo[0];
                        if (item.description) {
                            li.innerHTML += '<p><em>' + item.description + '</p></em>';
                        }
                        document.getElementById('events').appendChild(li);
                    }

                    // for (var i = 0; i < resp.items.length; i++) {
                    //     var li = document.createElement('li');
                    //     var item = resp.items[i];
                    //     li.innerHTML = item.summary;
                    //     if (item.recurrence) {
                    //         li.innerHTML += ' [weekly] sdfsdfas' + keys[0];
                    //         li.className = li.className + " weekly";
                    //     }
                    //     var dateInfo = parseItemDate(item);
                    //     li.innerHTML += ' ' + dateInfo[0];
                    //     if (item.description) {
                    //         li.innerHTML += '<p><em>' + item.description + '</p></em>';
                    //     }
                    //     document.getElementById('events').appendChild(li);
                    // }

                    });
            },
            function(reason) {
                console.log('Could not load Google API: ' + reason);
            });
};