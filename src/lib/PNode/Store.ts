export default class Store {
    
    // 是否正在进行内部拖拽
    public static isDragInner: boolean = false

    public static setIsDragInner(isDragInner: boolean) {
        this.isDragInner = isDragInner
    }
}