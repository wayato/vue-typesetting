import type { Component, AsyncComponent, VNode } from "vue"
import Vue from 'vue'
import Utils from "./Utils"
import Store from "./Store"

export class PNode {

    // PNode所生成的vue组件
    private vueComponent: Component

    // 拖拽时的图像
    private dragImg: HTMLElement

    constructor(ast: PNodeAST) {
        this.createDragImg()
        // ast数据中存在component组件名称，则代表是叶子节点
        if (ast.component) {
            this.vueComponent = this.createLeaf(ast, Store.getComponent(ast.component))
        } else {
            this.vueComponent = this.createContainer(ast)
        }
    }

    // 创建拖动时图像
    private createDragImg() {
        const dom: HTMLElement = document.createElement('img')
        dom.style.height = '100px'
        dom.style.width = '100px'
        dom.style.background = 'red'
        dom.style.width = '100px'
        this.dragImg = dom
    }

    // 创建容器
    private createContainer(ast: PNodeAST): Component {
        // console.log('容器', ast.key)

        const _this = this
        return Vue.extend({
            props: {
                updateData: Function
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
                            props: {
                                updateData: this.updateData
                            },
                            key: childAst.key
                        })
                    } else {
                        return h(_this.createContainer(childAst), {
                            props: {
                                updateData: this.updateData
                            },
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
                // 是否选中
                isSelected: {
                    type: Boolean,
                    default: false
                },
                updateData: Function,

            },
            data: () => {
                return {
                    dragSelf: false, // 是否正在拖拽自己
                    tipAreaIndex: -1 // 当前展示提示的阴影区域 0上 1右 2下 3左
                }
            },
            render(h): VNode {
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
                            background: '#000',
                            inset: item[1],
                            transition: 'opacity .3s',
                            opacity: this.tipAreaIndex === index ? '0.3' : '0'
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
                                if (!this.dragSelf) {
                                    this.tipAreaIndex = index
                                }
                            },
                            dragleave: (e: DragEvent) => {
                                Utils.stopBubble(e)
                                this.tipAreaIndex = -1
                            },
                            drop: (e: DragEvent) => {
                                Utils.stopBubble(e)
                                if (this.dragSelf) return
                                this.tipAreaIndex = -1
                                Utils.getConfig(e).then(res => {
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
                            this.dragSelf = true
                            Utils.setDragImg(e)
                        },
                        dragend: () => {
                            this.dragSelf = false
                        },
                        click: (e: Event) => {
                            
                            // this.$emit('blockClick')
                        }
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
                        h('div', {
                            style: {
                                position: 'absolute',
                                inset: 0,
                                border: '2px solid red',
                                opacity: this.isSelected ? 1 : 0
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