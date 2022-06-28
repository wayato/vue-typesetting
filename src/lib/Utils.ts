const DRAG_IMG: HTMLImageElement = new Image()
DRAG_IMG.src = 'data:image/jpeg;base64,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'
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
    public static setDragImg(e: DragEvent) {
        e.dataTransfer.setDragImage(DRAG_IMG, 0, 0)
    }

    // 设置拖拽数据
    public static setConfig(e: DragEvent, data: any) {
        e.dataTransfer.setData('config', JSON.stringify(data))
    }

    // 获取拖拽数据
    public static getConfig(e: DragEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            const configStr = e.dataTransfer.getData('config')
            if (configStr !== '') {
                resolve(JSON.parse(configStr))
            } else {
                reject()
            }
        })
    }
}
