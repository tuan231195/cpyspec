import { formatTime } from './time';

describe('formatTime', () => {
    it('should format ms correctly', () => {
        expect(formatTime(0)).toEqual('0ms');
        expect(formatTime(1)).toEqual('1ms');
    });

    it('should format seconds correctly', () => {
        expect(formatTime(1000)).toEqual('1s');
        expect(formatTime(1020)).toEqual('1s 20ms');
        expect(formatTime(2000)).toEqual('2s');
    });

    it('should format minutes correctly', () => {
        expect(formatTime(60000)).toEqual('1m');
        expect(formatTime(61020)).toEqual('1m 1s 20ms');
        expect(formatTime(120000)).toEqual('2m');
    });

    it('should format hours correctly', () => {
        expect(formatTime(3600000)).toEqual('1h');
        expect(formatTime(7301324)).toEqual('2h 1m 41s 324ms');
    });
});
