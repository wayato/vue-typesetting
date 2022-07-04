import type { Component, AsyncComponent } from "vue"
import Page from "./PNode/Page"
import { PageBaseConfig, PNodeAST } from "./type"
import Utils from "./Utils"

export default class Typesetting {
    // 当前处于的vue实例
    private static vue: Vue

    // 设置vue实例
    public static setVue(vue: Vue) {
        this.vue = vue
    }

    // 根据组件名称获取vue实例中的组件
    public static getComponent(name: string): Component<any, any, any, any> | AsyncComponent<any, any, any, any> | string {
        return this.vue.$options.components[name] || 'div'
    }

    // 设置拖拽数据
    public static setDragData(e: DragEvent, data: any) {
        Utils.setDragImg(e)
        Utils.setConfig(e, data)
    }

    // page实例
    private page: Page

    constructor(pageConfig: PageBaseConfig, dataAsts: PNodeAST[] = []) {
        this.page = new Page()
        this.page.setConfig(pageConfig)
        this.page.setData(dataAsts)

        document.documentElement.addEventListener('dragover', Utils.stopBubble)
        document.documentElement.addEventListener('drop', this.page.outerDrop.bind(this.page))
    }

    // 设置page的数据
    // 整体替换
    public setData(dataAsts: PNodeAST[]) {
        this.page.setData(dataAsts)
    }

    // 根据id更改数据
    public updateData(id: string, data: unknown) {
        try {
            const { ast } = this.page.findAst(id)
            this.page.updateData(id, {
                ...ast,
                data: {
                    color: data
                }
            })
        } catch (e) {
            console.error('查询不到id所在节点')
        }
    }

    // 设置page的基本配置
    public setConfig(pageConfig: PageBaseConfig) {
        this.page.setConfig(pageConfig)
    }

    // 渲染
    public render($el: HTMLElement) {
        $el.style.position = 'relative' // 保证是相对定位
        const component = this.page.create()
        $el.append(new component().$mount().$el)
    }

    // 监听事件
    public addEventListener(eventName: string, callback: (e: unknown) => void) {
        this.page.setEvent(eventName, callback)
    }
}