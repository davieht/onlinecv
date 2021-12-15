Array.prototype.last = function(idx) {
    return this.slice(-1 -(idx ? idx : 0))[0];
};

function objectLast(obj, idx) {
    return Object.values(obj)[Object.values(obj).length - 1 + (idx ? idx : 0)]
}

function objectIdx(obj, idx) {
    return Object.values(obj)[idx]
}

function objectSum(obj) {
    return Object.values(obj).reduce((res, item) => res + item, 0)
}

Array.prototype.sum = function(idx) {
    return this.reduce((res, item) => res + item, 0);
};

String.prototype.asRoundInt = function() {
    let parsed = parseInt(this);
    if (isNaN(parsed)) {
        parsed = 0;
    }
    return Math.round(parsed);
};

Number.prototype.asRoundStr = function() {
    return Math.round(this).toLocaleString("de-AT");
};

String.prototype.toInt = function() {
    return parseInt(this);
};

String.prototype.toFloat = function() {
    return parseFloat(this);
};

Number.prototype.toSignedString = function() {
    return (this <= 0 ? "" : "+") + Math.round(this).toLocaleString("de-AT");
};

function humanise(total_days)
{
    var date_current = new Date();
    var utime_target = date_current.getTime() + total_days*86400*1000;
    var date_target = new Date(utime_target);

    var diff_year  = parseInt(date_target.getUTCFullYear() - date_current.getUTCFullYear());
    var diff_month = parseInt(date_target.getUTCMonth() - date_current.getUTCMonth());
    var diff_day   = parseInt(date_target.getUTCDate() - date_current.getUTCDate());

    var days_in_month = [31, (date_target.getUTCFullYear()%4?29:28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var date_string = "";
    
    while(true)
    {
        date_string = "";
        date_string += (diff_year>0 ? diff_year + (diff_year > 1 ?" Jahre ": " Jahr "):"");

        if(diff_month<0){diff_year -= 1; diff_month += 12; continue;}
        date_string += (diff_month > 0 ? diff_month + (diff_month > 1 ? " Monate ": " Monat "):"");

        if(diff_day<0){diff_month -= 1; diff_day += days_in_month[((11+date_target.getUTCMonth())%12)]; continue;}
        date_string += (diff_day > 0 ? diff_day + (diff_day > 1 ? " Tage" : "Tag") :"");
        break;
    }

    return date_string;
}

function getColor(value, light){
    var hue=((value)*120).toString(10);
    return ["hsl(",hue,",70%,",light,"%)"].join("");
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function inciThreshold(value) {
    if (value === 0) {
        return 'lightgrey';
    } else if (value < 20) {
        return 'lightgreen';
    } else if (value < 40) {
        return 'green';
    } else if (value < 100) {
        return 'yellow';
    } else if (value < 200) {
        return 'orange';
    } else if (value < 400) {
        return 'red';
    } else if (value < 1000) {
        return 'darkred';
    } else if (value < 2000) {
        return 'purple';
    } else if (value < 4000) {
        return 'magenta';
    } else if (value < 10000) {
        return 'darkblue';
    } else {
        return 'black';
    }
}
