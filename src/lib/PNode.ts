import type { Component, AsyncComponent, VNode } from "vue"
import Vue from 'vue'
import Utils from "./Utils"
import Store from "./Store"

export class PNode {

    // PNode所生成的vue组件
    private vueComponent: Component

    constructor(ast: PNodeAST) {
        // ast数据中存在component组件名称，则代表是叶子节点
        if (ast.component) {
            this.vueComponent = this.createLeaf(ast, Store.getComponent(ast.component))
        } else {
            this.vueComponent = this.createContainer(ast)
        }
    }

    // 创建容器
    private createContainer(ast: PNodeAST): Component {
        // console.log('容器', ast.key)

        const _this = this
        return Vue.extend({
            props: {
                updateData: Function,
                operateCurrentKey: Function,
                operateInnerDraging: Function
            },
            render(h): VNode {
                return h('div', {
                    style: {
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        flex: 1,
                        flexDirection: ast.direction
                    }
                }, ast.children.map((childAst: PNodeAST) => {
                    if (childAst.component) {
                        return h(_this.createLeaf(childAst, Store.getComponent(childAst.component)), {
                            props: this.$props,
                            key: childAst.key
                        })
                    } else {
                        return h(_this.createContainer(childAst), {
                            props: this.$props,
                            key: childAst.key
                        })
                    }
                }))
            }
        })
    }

    // 创建叶子节点
    private createLeaf(ast: PNodeAST, component: Component<any, any, any, any> | AsyncComponent<any, any, any, any> | string): Component {
        // console.log('叶子', ast.key)

        const _this = this
        return Vue.extend({
            props: {
                operateCurrentKey: Function,
                operateInnerDraging: Function,
                updateData: Function
            },
            data: () => {
                return {
                    dragSelf: false, // 是否正在拖拽自己
                    tipAreaIndex: -1, // 当前展示提示的阴影区域 0上 1右 2下 3左
                    innerDragingStyleShow: false // 内部移动时是否显示相应样式
                }
            },
            computed: {
                currentKey: {
                    get() {
                        return this.operateCurrentKey()
                    },
                    set(val) {
                        this.operateCurrentKey(val)
                    }
                },
                innerDraging: {
                    get() {
                        return this.operateInnerDraging()
                    },
                    set(val) {
                        this.operateInnerDraging(val)
                    }
                }
            },
            render(h): VNode {
                const LINE_COLOR = 'rgba(77, 77, 238, 1)'
                const AREA_CONFIG: [string, string, string][] = [
                    ['top', '0 0 50% 0', 'polygon(0 0, 50% 100%, 100% 0)'],
                    ['right', '0 0 0 50%', 'polygon(100% 0, 0 50%, 100% 100%)'],
                    ['bottom', '50% 0 0 0', 'polygon(0 100%, 50% 0, 100% 100%)'],
                    ['left', '0 50% 0 0', 'polygon(0 0, 100% 50%, 0 100%)']
                ]
                const tipArea: VNode[] = [] // 着陆阴影提示区域
                const determineArea: VNode[] = [] // 实际着陆面区域
                // const lineArea: VNode[] = []
                AREA_CONFIG.forEach((item: [string, string, string], index: number) => {
                    tipArea.push(h('div', {
                        style: {
                            position: 'absolute',
                            background: '#FFF',
                            inset: item[1],
                            transition: 'opacity .3s',
                            opacity: this.tipAreaIndex === index ? '0.5' : '0',
                            border: `2px dashed ${LINE_COLOR}`
                        }
                    }))
                    determineArea.push(h('div', {
                        style: {
                            position: 'absolute',
                            inset: item[1],
                            opacity: 0,
                            clipPath: item[2]
                        },
                        on: {
                            dragover: (e: DragEvent) => {
                                Utils.stopBubble(e)
                                if (this.dragSelf) return
                                if (!this.innerDraging) {
                                    this.tipAreaIndex = index
                                } else {
                                    this.innerDragingStyleShow = true
                                }
                            },
                            dragleave: (e: DragEvent) => {
                                this.tipAreaIndex = -1
                            },
                            drop: (e: DragEvent) => {
                                Utils.stopBubble(e)
                                if (this.dragSelf) return
                                this.tipAreaIndex = -1
                                Utils.getConfig(e).then(res => {
                                    if (res.key) {
                                        // 有key代表是已经在画布上的元素进行交换
                                        this.updateData(ast.key, {
                                            ...res,
                                            key: Utils.getUuid()

                                        })
                                        this.updateData(res.key, {
                                            ...ast,
                                            key: Utils.getUuid()
                                        })
                                    } else {
                                        // 没有key代表新加入的元素
                                        const children = [
                                            {
                                                key: Utils.getUuid(),
                                                component: ast.component
                                            },
                                            {
                                                key: Utils.getUuid(),
                                                component: res.component
                                            }
                                        ]
                                        this.updateData(ast.key, {
                                            key: Utils.getUuid(),
                                            direction: /left|right/.test(item[0]) ? 'row' : 'column',
                                            children: /bottom|right/.test(item[0]) ? children : children.reverse()
                                        })
                                    }

                                })
                            }
                        }
                    }))
                    // lineArea.push(h('div', {
                    //     style: {
                    //         position: 'absolute',
                    //         height: '2px',
                    //         top: 0,
                    //         width: 100%
                    //     }
                    // }))
                })
                return h('div', {
                    attrs: {
                        draggable: true
                    },
                    style: (() => {
                        const style = {
                            overflow: 'hidden',
                            position: 'relative',
                            flex: 1,
                            opacity: this.dragSelf ? 0.5 : 1
                        }
                        if (ast?.layout) {
                            return {
                                ...style,
                                position: 'absolute',
                                left: ast.layout.left + 'px',
                                top: ast.layout.top + 'px',
                                width: ast.layout.width + 'px',
                                height: ast.layout.height + 'px'
                            }
                        }
                        return style
                    })(),
                    on: {
                        dragstart: (e: DragEvent) => {
                            console.log(e)
                            Utils.setDragImg(e)
                            Utils.setConfig(e, ast)
                            this.dragSelf = true
                            this.innerDraging = true
                        },
                        dragover: (e: DragEvent) => {
                            Utils.stopBubble(e)
                        },
                        dragleave: () => {
                            this.innerDragingStyleShow = false
                        },
                        dragend: (e: DragEvent) => {
                            console.log('结束')
                            Utils.stopBubble(e)
                            this.dragSelf = false
                            this.innerDraging = false
                        },
                        click: (e: Event) => {
                            this.currentKey = ast.key
                            // this.$emit('blockClick')
                        },
                    }
                }, [
                    h(component, {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                        }
                    }),
                    h('div', {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            boxSizing: 'border-box'
                        }
                    }, [
                        // 选中线框
                        h('div', {
                            style: {
                                position: 'absolute',
                                inset: 0,
                                border: `2px solid ${LINE_COLOR}`,
                                opacity: this.currentKey === ast.key ? 1 : 0
                            }
                        }),
                        // 内部替换时显示的线框和背景
                        h('div', {
                            style: {
                                position: 'absolute',
                                inset: 0,
                                border: `2px dashed ${LINE_COLOR}`,
                                background: '#FFF',
                                transition: 'opacity .3s',
                                opacity: this.innerDragingStyleShow ? 0.5 : 0
                            }
                        }),
                        ...tipArea,
                        ...determineArea
                    ])
                ])
            }
        })
    }

    // 获取生成的vue组件
    public getComponent(): Component {
        return this.vueComponent
    }
}