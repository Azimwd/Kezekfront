const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function plural(value: number, forms: readonly [string, string, string]) {
    const lastTwo = value % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
    const last = value % 10;
    return last === 1 ? forms[0] : last >= 2 && last <= 4 ? forms[1] : forms[2];
}

// Календарные месяцы в часовом поясе сервера: месяц не равен фиксированным 30 дням.
function calendarParts(timestamp: number, timeZone: string) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
    }).formatToParts(timestamp);
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
    return {
        year: value('year'), month: value('month'), day: value('day'),
        hour: value('hour'), minute: value('minute'), second: value('second'),
        millisecond: ((timestamp % 1000) + 1000) % 1000,
    };
}

function fullCalendarMonths(now: number, end: number, timeZone: string) {
    const start = calendarParts(now, timeZone);
    const finish = calendarParts(end, timeZone);
    let months = (finish.year - start.year) * 12 + finish.month - start.month;
    if (months < 1) return 0;
    const lastDay = new Date(Date.UTC(finish.year, finish.month, 0)).getUTCDate();
    const anniversary = Date.UTC(finish.year, finish.month - 1,
        Math.min(start.day, lastDay), start.hour, start.minute, start.second, start.millisecond);
    const finishWallTime = Date.UTC(finish.year, finish.month - 1,
        finish.day, finish.hour, finish.minute, finish.second, finish.millisecond);
    if (anniversary > finishWallTime) months -= 1;
    return months;
}

export function freeAccessCountdown(end: number, now: number, timeZone = 'Asia/Qyzylorda') {
    if (!Number.isFinite(end) || !Number.isFinite(now)) return null;
    const remaining = end - now;
    if (remaining <= 0) return { ended: true, text: 'Бесплатный период завершён' };
    let months: number;
    try { months = fullCalendarMonths(now, end, timeZone); }
    catch { months = fullCalendarMonths(now, end, 'UTC'); }
    if (months >= 1) return {
        ended: false,
        text: `${plural(months, ['месяц', 'месяца', 'месяцев']) === 'месяц' ? 'Остался' : 'Осталось'} ${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`,
    };
    const days = Math.floor(remaining / DAY);
    if (days >= 1) return {
        ended: false,
        text: `${plural(days, ['день', 'дня', 'дней']) === 'день' ? 'Остался' : 'Осталось'} ${days} ${plural(days, ['день', 'дня', 'дней'])}`,
    };
    const hours = Math.floor(remaining / HOUR);
    if (hours >= 1) return {
        ended: false,
        text: `${plural(hours, ['час', 'часа', 'часов']) === 'час' ? 'Остался' : 'Осталось'} ${hours} ${plural(hours, ['час', 'часа', 'часов'])}`,
    };
    const minutes = Math.floor(remaining / 60_000);
    return {
        ended: false,
        text: minutes >= 1
            ? `${plural(minutes, ['минута', 'минуты', 'минут']) === 'минута' ? 'Осталась' : 'Осталось'} ${minutes} ${plural(minutes, ['минута', 'минуты', 'минут'])}`
            : 'Осталось меньше минуты',
    };
}

export function freeAccessDeadline(end: number, timeZone: string) {
    const options: Intl.DateTimeFormatOptions = {
        timeZone, day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    };
    try { return new Intl.DateTimeFormat('ru-RU', options).format(end); }
    catch { return new Intl.DateTimeFormat('ru-RU', { ...options, timeZone: 'UTC' }).format(end); }
}
