const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(dateString, now = new Date()) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    if (!(now instanceof Date) || Number.isNaN(now.getTime())) now = new Date();

    const elapsed = now.getTime() - date.getTime();
    if (elapsed < 0) return formatAbsoluteDate(date, now);
    if (elapsed < MINUTE) return 'Just now';
    if (elapsed < HOUR) {
        const minutes = Math.floor(elapsed / MINUTE);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (elapsed < DAY) {
        const hours = Math.floor(elapsed / HOUR);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (elapsed < 7 * DAY) {
        const days = Math.floor(elapsed / DAY);
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    }

    return formatAbsoluteDate(date, now);
}

function formatAbsoluteDate(date, now) {
    const day = String(date.getDate());
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = now.getFullYear();

    return `${month} ${day}, ${year}`;
}