export function parseBetween(str: string, left: string, right: string): string | null {
    let start = str.indexOf(left);
    if (start === -1) {
        return null;
    }
    start += left.length;
    const end = str.indexOf(right, start);
    if (end === -1) {
        return null;
    }
    return str.substring(start, end);
}