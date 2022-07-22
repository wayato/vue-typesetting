const DRAG_IMG: HTMLImageElement = new Image()
DRAG_IMG.src = require('../assets/drag.jpg')
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

    // 设置拖拽图像
    // public static setDragImg(e: DragEvent) {
    //     e.dataTransfer.setDragImage(DRAG_IMG, 0, 0)
    // }

    // // 设置拖拽数据
    // public static setConfig(e: MouseEvent, data: any) {
    //     e.dataTransfer.setData('config', JSON.stringify(data))
    // }

    // // 获取拖拽数据
    // public static getConfig(e: MouseEvent): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         const configStr = e.dataTransfer.getData('config')
    //         if (configStr !== '') {
    //             resolve(JSON.parse(configStr))
    //         } else {
    //             reject()
    //         }
    //     })
    // }
}
