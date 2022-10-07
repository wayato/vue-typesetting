export default class Utils {
    static getUUID(): string {
        return new Date().getTime().toString()
    }
}