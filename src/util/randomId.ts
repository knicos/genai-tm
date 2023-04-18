const ALLOWED = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function randomId(length: number = 8): string {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const strarray = Array.from(array).map((v) => ALLOWED.charAt(v % ALLOWED.length));
    return strarray.join('');
}
