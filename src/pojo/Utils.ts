// 工具类
export default class Utils {
    // 阻止冒泡
    public static stopBubble(e: Event) {
        if (window.event) { 
            // ie 和 谷歌支持阻止冒泡
            window.event.cancelBubble = true
        } else { 
            // 火狐和谷歌支持的阻止冒泡
            e.preventDefault()
        }
    }
}
