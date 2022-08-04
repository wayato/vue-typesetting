
import Vue from 'vue'
import type { CreateElement } from 'vue/types/vue'
import { VNode } from "vue/types/umd"
import Utils from "./Utils"
import Container from './Container'
import Leaf from './Leaf'
import DragImg from './DragImg'
import HeaderFooter from './HeaderFooter'

export default class Typesetting {

    // 设置拖拽数据
    public setDragData(e: DragEvent, data: any) {
        this.state.global.addDraging = true
        DragImg.show(e.x, e.y, data, () => {
            this.state.global.addDraging = false
        })
    }

    // 设置渲染typesetting的宿主vue
    public setVue(hostVue: Vue): void {
        this.state.global.hostVue = hostVue
    }

    // 开启debug模式
    public setDebug(debug: boolean): void {
        this.state.global.debug = debug
    }

    // 页面的基本配置
    public setConfig(config: PageBaseConfig): void {
        this.state.pageBaseConfig = config
    }

    // 页面的布局数据
    public setData(dataAST: Array<ContianerAst | LeafAst>): void {
        this.state.dataAST = dataAST
    }

    // 设置组件传入props之前的aop事件
    public setPropsAOP(event: any) {
        this.state.global.propsAop = event
    }

    // 监听事件
    public listenerEvents: Map<string, Function> = new Map()
    public addEventListener(eventName: string, callback: Function) {
        this.listenerEvents.set(eventName, callback)
    }
    public handleEvent(eventName: string, params: {
        type: 'add' | 'delete' | 'exchange' | 'update',
        attr?: string, // 如果type是update则可能有这项，代表更改了其中的什么属性
        allData: Array<LeafAst | ContianerAst>,
        data: LeafAst | LeafAst[]
    }) {
        if (this.listenerEvents.has(eventName)) {
            this.listenerEvents.get(eventName)(params)
        }
    }

    // 修改当前currentKey
    public changeKey(data: LeafAst | null) {
        if (data === null) {
            data = {
                key: '',
                comp: ''
            }
        }
        if (this.state.global.currentKey === data.key) return
        this.state.global.currentKey = data.key
        this.handleEvent('keyChange', JSON.parse(JSON.stringify(data)))
    }

    public state = Vue.observable({
        dataAST: [],
        pageBaseConfig: <PageBaseConfig>{},
        global: {
            hostVue: null, // 宿主vue实例
            debug: false, // 是否开启debug模式
            propsAop: null, // 组件渲染前置事件
            currentKey: '', // 当前选中的key
            addDraging: false, // 是否正在新增拖拽
            updateDraging: false, // 是否正在更新拖拽
            isInner: true // 鼠标是否是处于编辑区域
        }
    })
    // 渲染函数
    public render($el: HTMLElement): void {
        const that = this
        const state = that.state
        const component = Vue.extend({
            render(h: CreateElement): VNode {
                return h('div', {
                    class: {
                        'vue-typesetting': true
                    },
                    style: {
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        inset: 0,
                        paddingLeft: state.pageBaseConfig?.left_margin || '10px',
                        paddingRight: state.pageBaseConfig?.right_margin || '10px',
                        paddingTop: state.pageBaseConfig?.paddingTop || '10px',
                        paddingBottom: state.pageBaseConfig?.paddingBottom || '10px',
                        backgroundColor: state.pageBaseConfig?.bg_color || '#FFF',
                        '-webkit-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        'user-select': 'none'
                    },
                    on: {
                        mouseleave: () => {
                            if (state.global.updateDraging) {
                                state.global.isInner = false
                            }
                        },
                        mouseenter: () => {
                            if (state.global.updateDraging) {
                                state.global.isInner = true
                            }
                        }
                    }
                }, [
                    h(HeaderFooter, {
                        props: {
                            type: 'header',
                            height: state.pageBaseConfig?.header_height || 0,
                            changeKey: that.changeKey.bind(that),
                            config: state.pageBaseConfig.headerConfig,
                            global: state.global,
                        }
                    }),
                    h('div', {
                        style: {
                            flex: 1,
                            display: 'flex'
                        }
                    }, state.dataAST.length === 0
                    ? [
                        h('div', {
                            style: {
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            },
                            on: {
                                mouseup: (e: Event) => {
                                    if (state.global.addDraging) { // 新增
                                        that.updateData(null, DragImg.dragData)
                                    }
                                }
                            }
                        }, '拖拽至这里')
                    ]
                    : state.dataAST.map((childAst: ContianerAst | LeafAst) => {
                        const params = {
                            key: childAst.key,
                            props: {
                                dataAST: childAst,
                                updateData: that.updateData.bind(that),
                                changeKey: that.changeKey.bind(that),
                                global: state.global,
                            }
                        }
                        if ('comp' in childAst) {
                            return h(Leaf, params)
                        } else {
                            return h(Container, params)
                        }
                    })),
                    h(HeaderFooter, {
                        props: {
                            type: 'footer',
                            height: state.pageBaseConfig?.footer_height || 0,
                            changeKey: that.changeKey.bind(that),
                            config: state.pageBaseConfig.footerConfig,
                            global: state.global,
                        }
                    })
                ])
            }
        })
        $el.append(new component().$mount().$el)
    }

    // 更新数据
    public updateData(key: string, param?: string | ContianerAst | LeafAst, newLeaf?: LeafAst) {
        if (typeof param === 'string') {
            this.exchangeAst(key, param)
        } else if (param === undefined) {
            this.deleteAst(key)
        } else {
            this.updateAst(key, param, newLeaf)
        }
    }

    // 根据name修改特定的数据
    public updateByName(key: string, name: string, data: unknown) {
        try {
            let ast: ContianerAst | LeafAst = null
            if (/header|footer/.test(key)) {
                console.log('页眉页脚逻辑待补充')
            } else {
                ast = this.findAst(key).ast
                if (JSON.stringify((<any>ast)[name]) != JSON.stringify(data)) {
                    Vue.prototype.$set(ast, name, JSON.parse(JSON.stringify(data)))
                } // 数据相同则不执行
                this.handleEvent('update', {
                    type: 'update',
                    attr: name,
                    allData: JSON.parse(JSON.stringify(this.state.dataAST)),
                    data: JSON.parse(JSON.stringify(ast))
                })
            }
        } catch (e) {
            console.error('查询不到key所在节点')
        }
    }

    // 找到节点
    public findAst(key: string, fatherChildren?: Array<ContianerAst | LeafAst>, father?: ContianerAst): FindAst | undefined {
        if (fatherChildren === undefined) fatherChildren = this.state.dataAST
        for (let i: number = 0; i < fatherChildren.length; i++) {
            if (fatherChildren[i].key === key) {
                return {
                    ast: fatherChildren[i],
                    fatherChildren,
                    father,
                    index: i
                }
            } else {
                if ('children' in fatherChildren[i]) {
                    const result: FindAst | undefined = this.findAst(key, (<ContianerAst>fatherChildren[i]).children, <ContianerAst>fatherChildren[i])
                    if (result) return result
                }
            }
        }
    }

    // 找到key的节点，把更改后的数据更新进去
    private updateAst(key: string, targetAst: ContianerAst | LeafAst, newLeaf?: LeafAst) {
        if (key === null) {
            targetAst = <LeafAst>targetAst
            key = Utils.getUuid()
            newLeaf = {
                key,
                ...targetAst
            }
            // page第一层插入元素
            this.state.dataAST.push(newLeaf)
            this.changeKey(newLeaf)
        } else {
            const findAst: FindAst = this.findAst(key)
            Vue.prototype.$set(findAst.fatherChildren, findAst.index, targetAst)
        }
        this.handleEvent('update', {
            type: newLeaf ? 'add' : 'update',
            allData: JSON.parse(JSON.stringify(this.state.dataAST)),
            data: JSON.parse(JSON.stringify(newLeaf || targetAst))
        })
    }

    // 交换两个节点
    private exchangeAst(key1: string, key2: string) {
        const findAst1: FindAst = this.findAst(key1)
        const findAst2: FindAst = this.findAst(key2)
        Vue.prototype.$set(findAst1.fatherChildren, findAst1.index, findAst2.ast)
        Vue.prototype.$set(findAst2.fatherChildren, findAst2.index, findAst1.ast)
        this.handleEvent('update', {
            type: 'exchange',
            allData: JSON.parse(JSON.stringify(this.state.dataAST)),
            data: JSON.parse(JSON.stringify([findAst1.ast, findAst2.ast]))
        })
    }

    // 将id节点的父节点更改为key节点的兄弟节点
    private deleteAst(key: string) {
        const findAst: FindAst = this.findAst(key)
        if (findAst.father) {
            // fatherChildren只有两个元素，!findAst.index非0即1，非1即0，便是其兄弟节点
            const sibling: ContianerAst | LeafAst = findAst.fatherChildren[Number(!findAst.index)]
            Object.assign(findAst.father, sibling)
            if (!('children' in sibling)) Vue.prototype.$delete(findAst.father, 'children')
            if (!('p' in sibling)) Vue.prototype.$delete(findAst.father, 'p')
            if (!('dir' in sibling)) Vue.prototype.$delete(findAst.father, 'dir')
        } else {
            Vue.prototype.$delete(findAst.fatherChildren, findAst.index)
        }
        // 如果是删除的选中的节点，清理掉并通知外界
        if (key === this.state.global.currentKey) {
            this.changeKey(null)
        }
        this.handleEvent('update', {
            type: 'delete',
            allData: JSON.parse(JSON.stringify(this.state.dataAST)),
            data: JSON.parse(JSON.stringify(findAst.ast))
        })
    }
}

type FindAst = {
    ast: ContianerAst | LeafAst,
    fatherChildren: Array<ContianerAst | LeafAst>,
    father?: ContianerAst,
    index: number
}