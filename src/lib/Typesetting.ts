
import Page from "./PNode/Page"
import { PageBaseConfig, PNodeAST } from "../lib/type"
import Utils from "./Utils"
import Vue from 'vue'

export default class Typesetting {

    // 设置拖拽数据
    public static setDragData(e: DragEvent, data: any) {
        Utils.setDragImg(e)
        Utils.setConfig(e, data)
    }

    // page实例
    private page: Page

    constructor() {
        this.page = new Page()

        document.documentElement.addEventListener('dragover', Utils.stopBubble)
        document.documentElement.addEventListener('drop', this.page.outerDrop.bind(this.page))
    }

    // 设置page的数据
    // 整体替换
    public setData(dataAsts: PNodeAST[]) {
        this.page.setData(dataAsts)
    }

    // 设置page的vue实例
    public setVue(vue: Vue) {
        this.page.setVue(vue)
    }

    // 设置page的基本配置
    public setConfig(pageConfig: PageBaseConfig) {
        this.page.setConfig(pageConfig)
    }

    // 根据key更改数据
    public updateData(key: string, data: unknown) {
        try {
            const { ast } = this.page.findAst(key)
            if (JSON.stringify(ast.data) === JSON.stringify(data)) return // 数据相同则不执行
            this.page.updateData(key, {
                ...ast,
                data
            })
        } catch (e) {
            console.error('查询不到key所在节点')
        }
    }

    

    // 渲染
    public render($el: HTMLElement) {
        // $el.style.position = 'relative' // TODO 需要识别是否已经有定位，不能换成别的定位方式
        const component = this.page.create([], [])
        $el.append(new component().$mount().$el)
    }

    // 监听事件
    public addEventListener(eventName: string, callback: (e: unknown) => void) {
        this.page.setEvent(eventName, callback)
    }
}