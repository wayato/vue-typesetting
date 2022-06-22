import type { Component, VNode } from "vue"
import Vue from 'vue'
import { VueComponents } from "./Page"

export class PNode {

    // PNode所生成的vue组件
    private vueComponent: Component


    constructor(ast: PNodeAST, vueComponents: VueComponents) {
        // ast数据中存在component组件名称，则代表是叶子节点
        if (ast.component) {
            this.vueComponent = this.createLeaf(ast, <Component>vueComponents[ast.component])
        } else {
            this.vueComponent = this.createContainer(ast, vueComponents)
        }
    }

    // 创建容器
    private createContainer(ast: PNodeAST, vueComponents: VueComponents): Component {
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
                        return h(_this.createLeaf(childAst, <Component>vueComponents[childAst.component]), {
                            props: {
                                updateData: this.updateData
                            },
                            key: childAst.key
                        })
                    } else {
                        return h(_this.createContainer(childAst, vueComponents), {
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
    private createLeaf(ast: PNodeAST, component: Component): Component {
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
                                e.preventDefault()
                                this.tipAreaIndex = index
                            },
                            dragleave: (e: DragEvent) => {
                                e.preventDefault()
                                this.tipAreaIndex = -1
                            },
                            drop: (e: DragEvent) => {
                                e.preventDefault()
                                this.tipAreaIndex = -1
                                const configStr = e.dataTransfer.getData('config')
                                if (configStr !== '') {
                                    const config = JSON.parse(configStr)
                                    const children = [
                                        {
                                            key: (<any>crypto)?.randomUUID() || Math.random().toString(),
                                            component: ast.component
                                        },
                                        {
                                            key: (<any>crypto)?.randomUUID() || Math.random().toString(),
                                            component: config.component
                                        }
                                    ]
                                    this.updateData(ast.key, {
                                        key: (<any>crypto)?.randomUUID() || Math.random().toString(),
                                        direction: /left|right/.test(item[0]) ? 'row' : 'column',
                                        children: /bottom|right/.test(item[0]) ? children : children.reverse()
                                    })
                                }
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
                            flex: 1
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