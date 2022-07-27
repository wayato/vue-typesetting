import Vue from 'vue'

export default class Global {
    public static state = Vue.observable({
        currentKey: '', // 当前选中的key
        addDraging: false, // 是否正在新增拖拽
        updateDraging: false, // 是否正在更新拖拽
        isInner: true // 鼠标是否是处于编辑区域
    })

    // 渲染typesetting的宿主vue
    public static hostVue: Vue
    public static getComponent(name: string) {
        return this.hostVue.$options.components[name] || 'div'
    }

    // debug模式
    public static debug: boolean = false

    // 设置组件传入props之前的aop事件
    // 可能是异步、同步
    public static propsAop: any
    public static setPropsAOP(event: (value: LeafAst) => unknown) {
        this.propsAop = event
    }

    // 设置拖拽数据
    public static dragData: any
    public static setDragData(data: any) {
        this.dragData = data
    }
    public static getDragData(): any {
        return this.dragData
    }
}