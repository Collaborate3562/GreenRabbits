export const truncate = (str, n) => {
    if (str.length < n) return str;

    const a = str.slice(0, n - 3) + "..."
    return a;
}