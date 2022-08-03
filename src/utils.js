export function getTime() {
    const date = new Date()

    let hour = date.getHours()

    if (hour <= 9) {
        hour = '0' + hour
    }

    let minute = date.getMinutes()

    if (minute <= 9) {
        minute = '0' + minute
    }

    return `${hour}:${minute}`
}