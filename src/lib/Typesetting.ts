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
        this.page = new Page(dataAsts)
        this.page.setConfig(pageConfig)
    }

    // 设置page的数据
    setData(dataAsts: PNodeAST[]) {
        this.page.setData(dataAsts)
    }

    // 设置page的基本配置
    setConfig(pageConfig: PageBaseConfig) {
        this.page.setConfig(pageConfig)
    }

    // 渲染
    render($el: HTMLElement) {
        $el.style.position = 'relative' // 保证是相对定位
        const component = this.page.create()
        $el.append(new component().$mount().$el)
    }
}