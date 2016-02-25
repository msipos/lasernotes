var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
];

function pad(s) {
    s = s + "";
    if (s.length < 2) {
        s = "0" + s;
    }
    return s;
}

function formatDate(d) {
    var rv = monthNames[d.getMonth()];
    rv += " ";
    rv += d.getDate();
    rv += ", ";
    rv += d.getFullYear();
    return rv;
}

function formatDatePicker(d) {
    var rv = pad(d.getMonth() + 1);
    rv += "/";
    rv += pad(d.getDate());
    rv += "/";
    rv += d.getFullYear();
    return rv;
}

function formatTime(d) {
    var rv = pad(d.getHours());
    rv += ":";
    rv += pad(d.getMinutes());
    return rv;
}

function formatDateTime(d) {
    var rv = formatDate(d);
    rv += " ";
    rv += formatTime(d);
    return rv;
}

function shorten(s, l) {
    if (s.length > l) {
        return s.slice(0, l) + "...";
    }
    return s;
}

module.exports.formatTime = formatTime;
module.exports.formatDate = formatDate;
module.exports.formatDatePicker = formatDatePicker;
module.exports.formatDateTime = formatDateTime;
module.exports.shorten = shorten;
