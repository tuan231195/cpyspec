export function formatTime(millis: number) {
    const levels: [string, number][] = [
        ['h', 1000 * 3600],
        ['m', 1000 * 60],
        ['s', 1000],
        ['ms', 1],
    ];
    let current = millis;
    const arr: string[] = [];
    for (const level of levels) {
        const amountForLevel = Math.floor(current / level[1]);
        if (amountForLevel > 0) {
            arr.push(`${amountForLevel}${level[0]}`);
        }
        current = current % level[1];
    }
    return arr.join(' ') || '0ms';
}
