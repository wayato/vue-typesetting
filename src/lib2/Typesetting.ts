
import Vue, { h } from 'vue'
import type { CreateElement, VueConstructor } from 'vue/types/vue'
import { VNode } from "vue/types/umd"
import Utils from "./Utils"
import Container from './Container'
import Leaf from './Leaf'
import DragImg from './DragImg'
import { ContianerAst, LeafAst, PageBaseConfig } from './type'
import Global from './Global'


export default class Typesetting {

    // 宿主元素
    public hostELement: HTMLElement
    constructor() {
        document.documentElement.addEventListener('mousemove', (e) => {
            if (Global.state.addDraging || Global.state.updateDraging) {
                DragImg.show(e.x, e.y)
            }
        })
        document.documentElement.addEventListener('mouseup', () => {
            if (Global.state.updateDraging && !Global.state.isInner) { // 移除元素
                this.updateData(Global.getDragData().key)
            }
            DragImg.hide()
            Global.state.addDraging = false
            Global.state.updateDraging = false
        })
    }

    // 设置拖拽数据
    public setDragData(e: DragEvent, data: any) {
        Global.setDragData(data)
        Global.state.addDraging = true
        DragImg.show(e.x, e.y)
    }

    // 设置渲染typesetting的宿主vue
    public setVue(hostVue: Vue): void {
        Global.hostVue = hostVue
    }

    // 开启debug模式
    public setDebug(debug: boolean): void {
        Global.debug = debug
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
        Global.setPropsAOP(event)
    }

    // 监听事件
    public listenerEvents: Map<string, (e: unknown) => void> = new Map()
    public addEventListener(eventName: string, callback: (e: unknown) => void) {
        this.listenerEvents.set(eventName, callback)
    }
    public handleEvent(eventName: string, e: unknown) {
        if (this.listenerEvents.has(eventName)) {
            this.listenerEvents.get(eventName)(e)
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
        if (Global.state.currentKey === data.key) return
        Global.state.currentKey = data.key
        this.handleEvent('keyChange', JSON.parse(JSON.stringify(data)))
    }

    public state = Vue.observable({
        dataAST: [],
        pageBaseConfig: <PageBaseConfig>{}
    })
    // 渲染函数
    public render($el: HTMLElement): void {
        this.hostELement = $el
        const that = this
        const state = that.state
        const component = Vue.extend({
            render(h: CreateElement): VNode {
                // function headerFooter (type: 'header' | 'footer'): VNode {
                //     const height: string = (type === 'header' ? that.pageBaseConfig?.headerHeight : that.pageBaseConfig?.footerHeight) || 0
                //     const heightIs0: boolean = /^0/.test(height.toString())
                //     return h('div', {
                //         style: {
                //             height,
                //             display: 'flex',
                //             // border: heightIs0 ? 0 : '1px dashed #E6E6FF',
                //             boxSizing: 'border-box'
                //         }
                //     }, new Array(3).fill(null).map((_, index: number) => {
                //         const selectSelf: boolean = vm.currentKey === `${type}-${index}`
                //         return h('div', {
                //             class: {
                //                 'vue-typesetting__headerFooter': true
                //             },
                //             style: {
                //                 flex: 1,
                //                 borderStyle: selectSelf ? 'solid' : 'dashed',
                //                 borderColor: selectSelf ? Line.color : '#E6E6FF',
                //                 borderWidth: heightIs0 ? 0 : (selectSelf ? '2px' : '1px'),
                //             },
                //             on: {
                //                 click: (e: Event) => {
                //                     Utils.stopBubble(e)
                //                     this.observer.currentKey = `${type}-${index}`
                //                     console.log(`${type}-${index}`, vm, this.observer)
                //                     this.keyChange(`${type}-${index}`, type)
                //                 }
                //             }
                //         })
                //     }))
                // }
                return h('div', {
                    style: {
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        inset: 0,
                        paddingLeft: state.pageBaseConfig?.paddingLeft || '10px',
                        paddingRight: state.pageBaseConfig?.paddingRight || '10px',
                        paddingTop: state.pageBaseConfig?.paddingTop || '10px',
                        paddingBottom: state.pageBaseConfig?.paddingBottom || '10px',
                        backgroundColor: state.pageBaseConfig?.backgroundColor || '#FFF',
                        '-webkit-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        'user-select': 'none'
                    },
                    on: {
                        mouseleave: () => {
                            if (Global.state.updateDraging) {
                                Global.state.isInner = false
                            }
                        },
                        mouseenter: () => {
                            if (Global.state.updateDraging) {
                                Global.state.isInner = true
                            }
                        }
                    }
                }, [
                    // headerFooter.call(this, 'header'),
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
                                    if (Global.state.addDraging) { // 新增
                                        that.updateData(null, Global.getDragData())
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
                            }
                        }
                        if ('comp' in childAst) {
                            return h(Leaf, params)
                        } else {
                            return h(Container, params)
                        }
                    }))
                ])
            }
        })
        $el.append(new component().$mount().$el)
    }

    // 更新数据
    public updateData(key: string, param?: string | ContianerAst | LeafAst) {
        if (typeof param === 'string') {
            this.exchangeAst(key, param)
        } else if (param === undefined) {
            this.deleteAst(key)
        } else {
            this.updateAst(key, param)
        }
        this.handleEvent('update', JSON.parse(JSON.stringify(this.state.dataAST)))
    }

    // 更新props
    public updateProps(key: string, props: unknown) {
        try {
            const { ast } = this.findAst(key)
            if (JSON.stringify((<LeafAst>ast).props) === JSON.stringify(props)) return // 数据相同则不执行
            this.updateData(key, {
                ...ast,
                props
            })
        } catch (e) {
            console.error('查询不到key所在节点')
        }
    }

    // 找到节点
    public findAst(key: string, fatherChildren: Array<ContianerAst | LeafAst> = this.state.dataAST, father?: ContianerAst): FindAst | undefined {
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
    private updateAst(key: string, targetAst: ContianerAst | LeafAst) {
        if (key === null) {
            if (Global.debug) {
                console.log(`%c **新增组件，层级变化，会导致相关组件重渲** `, "color: red")
            }
            targetAst = <LeafAst>targetAst
            key = Utils.getUuid()
            const newLeaf: LeafAst = {
                key,
                ...targetAst
            }
            // page第一层插入元素
            this.state.dataAST.push(newLeaf)
            this.changeKey(newLeaf)
            return
        }
        const findAst: FindAst = this.findAst(key)
        Vue.prototype.$set(findAst.fatherChildren, findAst.index, targetAst)
    }

    // 交换两个节点
    private exchangeAst(key1: string, key2: string) {
        const findAst1: FindAst = this.findAst(key1)
        const findAst2: FindAst = this.findAst(key2)
        Vue.prototype.$set(findAst1.fatherChildren, findAst1.index, findAst2.ast)
        Vue.prototype.$set(findAst2.fatherChildren, findAst2.index, findAst1.ast)
    }

    // 将id节点的父节点更改为key节点的兄弟节点
    private deleteAst(key: string) {
        if (Global.debug) {
            console.log(`%c **移除组件，层级变化，会导致相关组件重渲** `, "color: red")
        }
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
        if (key === Global.state.currentKey) {
            this.changeKey(null)
        } 
    }
}

type FindAst = {
    ast: ContianerAst | LeafAst,
    fatherChildren: Array<ContianerAst | LeafAst>,
    father?: ContianerAst,
    index: number
}