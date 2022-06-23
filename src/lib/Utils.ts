// 工具类
export default class Utils {
    // 阻止冒泡
    public static stopBubble(e: Event) {
        e.preventDefault()
        e.stopPropagation()
    }

    // 生成uuid
    public static getUuid(): string {
        return (<any>crypto)?.randomUUID() || Math.random().toString()
    }
}
