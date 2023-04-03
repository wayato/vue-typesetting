
import Vue from 'vue'
import type { CreateElement } from 'vue/types/vue'
import { VNode } from "vue/types/umd"
import Utils from "./Utils"
import Container from './Container'
import Leaf from './Leaf'
import DragImg from './DragImg'
import HeaderFooter from './HeaderFooter'
import Watermark from './Watermark'
import Permission, { PermissionProps } from './Permission'

export default class Typesetting {
    private permission: Permission = new Permission()

    public setPermission(props: PermissionProps) {
        this.permission.setProps(props)
    }

    // 设置拖拽数据
    public setDragData(e: DragEvent, data: any) {
        this.state.global.addDraging = true
        DragImg.show(e.x, e.y, data, () => {
            this.state.global.addDraging = false
        })
    }

    // 设置渲染typesetting的宿主vue, 以及宿主环境是否是生产环境
    public setVue(hostVue: Vue, isProduction: boolean = true) {
        this.state.global.hostVue = hostVue
        this.state.global.isProduction = isProduction
    }

    // 开启debug模式
    public setDebug(debug: boolean) {
        this.state.global.debug = debug
    }

    // 设置整体缩放大小
    public setScale(size: { width: string, height: string }, scale: number) {
        this.state.size = size
        this.state.scale = scale
    }

    // 页面的基本配置
    public setConfig(config: PageBaseConfig) {
        this.state.pageBaseConfig = config
    }

    // 页面的额外信息
    public setInfo(info: PageInfo) {
        this.state.pageInfo = info
    }

    // 设置页眉页脚配置
    public setHeaderFooterConfig(config: HeaderFooterConfig) {
        this.state.headerFooterConfig = config
    }

    // 页面的布局数据
    public setData(dataAST: Array<ContianerAst | LeafAst>) {
        this.state.dataAST = dataAST
    }

    // 设置组件传入props之前的aop事件
    public setPropsAOP(event: any) {
        this.state.global.propsAop = event
    }

    // 设置是否是预览模式，此模式下不会显示页眉页脚的线框
    public setPreview(preview: boolean = false) {
        this.state.global.preview = preview
    }

    // 设置注入
    public setProvide(provide: any = false) {
        this.state.provide = provide
    }

    // 监听事件
    public listenerEvents: Map<string, Function> = new Map()
    public addEventListener(eventName: string, callback: Function) {
        this.listenerEvents.set(eventName, callback)
    }
    public handleEvent(eventName: string, params: {
        type: 'add' | 'delete' | 'exchange' | 'update' | 'update-header-footer',
        attr?: string, // 如果type是update则可能有这项，代表更改了其中的什么属性
        allData: Array<LeafAst | ContianerAst>,
        data: LeafAst | LeafAst[]
    }) {
        if (this.listenerEvents.has(eventName)) {
            this.listenerEvents.get(eventName)(params)
        }
    }

    // 修改当前currentKey
    public changeKey(data: LeafAst | null = null) {
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
        dataAST: <Array<LeafAst | ContianerAst>>[],
        pageBaseConfig: <PageBaseConfig>{},
        pageInfo: <PageInfo>{},
        size: {
            width: '100%',
            height: '100%'
        },
        scale: 1,
        headerFooterConfig: <HeaderFooterConfig>{
            comp: 'div',
            height: ['0px', '0px'],
            disabled: false,
            props: [[], []],
        },
        global: {
            hostVue: null, // 宿主vue实例
            isProduction: true, // 宿主所在环境是否是生产环境
            preview: false, // 是否是预览模式
            debug: false, // 是否开启debug模式
            propsAop: null, // 组件渲染前置事件
            currentKey: '', // 当前选中的key
            addDraging: false, // 是否正在新增拖拽
            updateDraging: false, // 是否正在更新拖拽
            isInner: true // 鼠标是否是处于编辑区域
        },
        provide: null
    })
    // 渲染函数
    public render($el: HTMLElement) {
        DragImg.hostEl = $el
        const that = this
        const state = that.state
        const component = Vue.extend({
            provide: state.provide,
            render(h: CreateElement): VNode {
                return h('div', {
                    class: {
                        'vue-typesetting': true
                    },
                    style: {
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        right: 0,
                        left: 0,
                        top: 0,
                        bottom: 0,
                        paddingLeft: state.pageBaseConfig?.leftMargin || '10px',
                        paddingRight: state.pageBaseConfig?.rightMargin || '10px',
                        paddingTop: state.pageBaseConfig?.topMargin || '10px',
                        paddingBottom: state.pageBaseConfig?.bottomMargin || '10px',
                        backgroundColor: state.pageBaseConfig?.bgColor || '#FFF',
                        '-webkit-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        'user-select': 'none',
                        transform: `scale(${state.scale})`,
                        transformOrigin: '0 0',
                        width: state.size.width,
                        height: state.size.height,
                        boxSizing: 'border-box'
                    },
                    on: {
                        click: (e: Event) => {
                            Utils.stopBubble(e)
                            that.changeKey()
                        },
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
                        nativeOn: {
                            click: Utils.stopBubble
                        },
                        props: {
                            type: 'header',
                            comp: state.headerFooterConfig.comp,
                            height: state.headerFooterConfig.height[0] || 0,
                            flexes: state.pageBaseConfig.headerFlexes,
                            disabled: !that.permission.header,
                            changeKey: that.changeKey.bind(that),
                            config: state.headerFooterConfig.props[0],
                            global: state.global,
                            pageInfo: state.pageInfo,
                            scale: state.scale
                        }
                    }),
                    h('div', {
                        style: {
                            flex: 1,
                            display: 'flex',
                            fontFamily: state.pageBaseConfig?.fontFamily || '微软雅黑',
                            pointerEvents: that.permission.comp ? 'auto' : 'none'
                        }
                    }, state.dataAST.length === 0
                    ? [
                        h('div', {
                            style: {
                                flex: 1,
                                position: 'relative'
                            },
                            on: {
                                mouseup: (e: Event) => {
                                    if (state.global.addDraging) { // 新增
                                        that.updateData(null, DragImg.dragData)
                                    }
                                }
                            }
                        }, [
                            h('div', {
                                style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    fontFamily: '微软雅黑',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: `${12 / state.scale}px`,
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: '2em',
                                    display: state.global.preview ? 'none' : 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    borderRadius: `${10 / state.scale}px`
                                }
                            }, [
                                h('img', {
                                    domProps: {
                                        src: require('../assets/tip.png')
                                    },
                                    style: {
                                        height: `${16 / state.scale}px`,
                                        width: `${16 / state.scale}px`,
                                        marginRight: `${8 / state.scale}px`
                                    }
                                }),
                                h('span', null, '可拖拽组件至此区域，如删除组件需拖拽组件脱离此区域')
                            ])
                        ])
                    ]
                    : state.dataAST.map((childAst: ContianerAst | LeafAst) => {
                        const params = {
                            key: childAst.key,
                            props: {
                                dataAST: childAst,
                                updateData: that.updateData.bind(that),
                                changeKey: that.changeKey.bind(that),
                                global: state.global,
                                scale: state.scale
                            },
                            nativeOn: {
                                click: Utils.stopBubble,
                            },
                        }
                        if ('comp' in childAst) {
                            return h(Leaf, params)
                        } else {
                            return h(Container, params)
                        }
                    })),
                    h(Watermark, {
                        props: {
                            global: state.global,
                            src: state.pageBaseConfig?.watermark || ''
                        },
                        style: {
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }
                    }),
                    h(HeaderFooter, {
                        nativeOn: {
                            click: Utils.stopBubble
                        },
                        props: {
                            type: 'footer',
                            comp: state.headerFooterConfig.comp,
                            height: state.headerFooterConfig.height[1] || 0,
                            flexes: state.pageBaseConfig.footerFlexes,
                            disabled: !that.permission.footer,
                            changeKey: that.changeKey.bind(that),
                            config: state.headerFooterConfig.props[1],
                            global: state.global,
                            pageInfo: state.pageInfo,
                            scale: state.scale
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
    public updateByName(key: string, name: string, data: unknown = {}) {
        try {
            let ast: ContianerAst | LeafAst = null
            if (/header|footer/.test(key)) {
                // 页眉页脚只支持props内容的修改
                const target: object[] = this.state.headerFooterConfig.props[/header/.test(key) ? 0 : 1]
                Vue.prototype.$set(target, Number(key[key.length - 1]), JSON.parse(JSON.stringify(data)))
                this.handleEvent('update', {
                    type: 'update-header-footer',
                    attr: 'props',
                    allData: JSON.parse(JSON.stringify(this.state.headerFooterConfig)),
                    data: <LeafAst>{
                        key,
                        props: JSON.parse(JSON.stringify(data))
                    }
                })
            } else {
                ast = this.findAst(key)?.ast
                if (ast && (JSON.stringify((<any>ast)[name]) != JSON.stringify(data))) {
                    Vue.prototype.$set(ast, name, JSON.parse(JSON.stringify(data)))
                } // 数据相同则不执行
                this.handleEvent('update', {
                    type: 'update',
                    attr: name,
                    allData: JSON.parse(JSON.stringify(this.state.dataAST)),
                    data: ast ? JSON.parse(JSON.stringify(ast)) : null
                })
            }
        } catch (e) {
            console.error(e)
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
            attr: newLeaf ? undefined : 'p',
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

    // 删除节点，将id节点的父节点更改为key节点的兄弟节点
    private deleteAst(key: string) {
        const findAst: FindAst = this.findAst(key)
        if (findAst.father) {
            // fatherChildren只有两个元素，!findAst.index非0即1，非1即0，便是其兄弟节点
            const sibling: ContianerAst | LeafAst = findAst.fatherChildren[Number(!findAst.index)]
            Object.keys(sibling).forEach((key: keyof (ContianerAst | LeafAst)) => {
                Vue.prototype.$set(findAst.father, key, <any>sibling[key])
            })
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
            data: findAst.ast ? JSON.parse(JSON.stringify(findAst.ast)) : null
        })
    }
}

type FindAst = {
    ast: ContianerAst | LeafAst,
    fatherChildren: Array<ContianerAst | LeafAst>,
    father?: ContianerAst,
    index: number
}