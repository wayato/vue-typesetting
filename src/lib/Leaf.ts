import Vue, { VNode } from 'vue'
import Line from './Line'
import Utils from './Utils'
import Global from './Global'
import { Direction, LeafAst } from './type'


const AREA_CONFIG: [TPosition, string, string][] = [
    ['top', '0 0 50% 0', 'polygon(0 0, 50% 100%, 100% 0)'],
    ['right', '0 0 0 50%', 'polygon(100% 0, 0 50%, 100% 100%)'],
    ['bottom', '50% 0 0 0', 'polygon(0 100%, 50% 0, 100% 100%)'],
    ['left', '0 50% 0 0', 'polygon(0 0, 100% 50%, 0 100%)']
]
export default Vue.component('typesetting-leaf', {
    props: {
        changeKey: {
            type: Function
        },
        updateData: {
            type: Function
        },
        dataAST: {
            // TODO 修改类型
            type: Object
        },
        flex: {
            type: Number,
            default: 1
        },
    },
    data() {
        return {
            tipAreaIndex: -1, // 当前展示提示的阴影区域 0上 1右 2下 3左
            tipAreaAll: false, // 是否显示整个提示区域
            dragSelf: false, // 是否在拖拽自身
            extraProps: null // 额外的props，通过执行aop事件获得
        }
    },
    mounted() {
        if (Global.debug) {
            console.log(`%c **渲染组件** ${this.dataAST.key}`, "color: green")
        }
    },
    watch: {
        'dataAST.props': {
            handler(newValue, oldValue) { 
                if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
                const obj = Global.propsAop(JSON.parse(JSON.stringify(this.dataAST)))
                if (typeof obj === 'object') {
                    if (typeof obj.then === 'function') {
                        obj.then((res: any) => {
                            if (typeof res !== 'object') {
                                console.warn('额外props传入有误')
                                return
                            }
                            this.extraProps = res
                            if (Global.debug) {
                                console.log(`%c **props** ${this.dataAST.key}：`, "color: green", JSON.parse(JSON.stringify({
                                    ...this.dataAST.props,
                                    ...this.extraProps
                                })))
                            }
                        })
                    } else {
                        this.extraProps = obj
                    }
                } else if (obj === undefined) {
                    // 没有返回值，不做任何操作，也不会渲染组件
                } else {
                    console.warn('额外props传入有误')
                }
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        // 是否该渲染组件了
        isRender() {
            return (!!Global.propsAop && !!this.extraProps) || !Global.propsAop
        },
        compProps() {
            return {
                ...this.dataAST.props,
                ...this.extraProps
            }
        }
    },
    render(h) {
        const allArea: VNode[] = []
        AREA_CONFIG.forEach((item: [TPosition, string, string], index: number) => {
            allArea.push(h('div', {
                class: {
                    'vue-typesetting__leaf--clip': Global.state.addDraging
                },
                style: {
                    position: 'absolute',
                    inset: item[1],
                    opacity: 0,
                    clipPath: item[2],
                    zIndex: 10,
                },
                on: {
                    mouseup: (e: Event) => {
                        if (Global.state.addDraging) { // 新增
                            if (Global.debug) {
                                console.log(`%c **新增组件，层级变化，会导致相关组件重渲** `, "color: red")
                            }
                            const key: string = Utils.getUuid()
                            const newLeaf: LeafAst = {
                                ...Global.getDragData(),
                                key
                            }
                            const children = [
                                this.dataAST,
                                newLeaf
                            ]
                            this.updateData(this.dataAST.key, {
                                key: Utils.getUuid(),
                                dir: /left|right/.test(item[0]) ? Direction.ROW : Direction.COLUMN,
                                p: 0.5,
                                children: /bottom|right/.test(item[0]) ? children : children.reverse()
                            })
                            this.changeKey(newLeaf)
                        }
                    }
                }
            }))
            allArea.push(h('div', {
                style: {
                    position: 'absolute',
                    background: '#FFF',
                    inset: item[1],
                    transition: 'opacity .3s',
                    opacity: 0,
                    border: `2px dashed ${Line.color}`,
                    zIndex: 5
                }
            }))
        })
        return h('div', {
            class: {
                'vue-typesetting__leaf': true
            },
            style: {
                overflow: 'hidden',
                position: 'relative',
                flex: this.flex || 1,
                opacity: 1
            },
            on: {
                mousedown: (e: MouseEvent) => {
                    Global.state.updateDraging = true
                    Global.state.isInner = true
                    Global.setDragData(this.dataAST)
                    this.dragSelf = true
                },
                mouseup: () => {
                    this.dragSelf = false
                },
                click: () => {
                    this.changeKey(this.dataAST)
                }
            }
        }, [
            Global.debug ? h('div', {
                style: {
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.5)',
                    color: '#000',
                    zIndex: 100
                },
                on: {
                    mousedown: Utils.stopBubble,
                }
            }, [
                h('button', {
                    style: {
                        marginRight: '10px',
                        fontSize: '20px'
                    },
                    on: {
                        click: (e: Event) => {
                            Utils.stopBubble(e)
                            console.log(JSON.parse(JSON.stringify(this.dataAST)))
                        }
                    }
                }, '此节点的数据'),
                h('button', {
                    style: {
                        marginRight: '10px',
                        fontSize: '20px'
                    },
                    on: {
                        click: (e: Event) => {
                            Utils.stopBubble(e)
                            console.log(JSON.parse(JSON.stringify(this.compProps)))
                        }
                    }
                }, '真实传入的props'),
            ]) : null,
            this.isRender ? h(Global.getComponent(this.dataAST.comp), {
                props: this.compProps,
                style: {
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                }
            }) : h('div', null, '加载中'),
            h('div', {
                style: {
                    position: 'absolute',
                    inset: 0,
                    boxSizing: 'border-box'
                }
            }, [
                // 内部拖拽时显示的线框和背景
                h('div', {
                    class: {
                        'vue-typesetting__leaf--all': Global.state.updateDraging
                    },
                    style: {
                        position: 'absolute',
                        inset: 0,
                        border: `2px dashed ${Line.color}`,
                        background: '#FFF',
                        transition: 'opacity .3s',
                        zIndex: (Global.state.updateDraging && !this.dragSelf) ? 15 : 1,
                        opacity: 0,
                    },
                    on: {
                        mouseup: () => {
                            if (this.dataAST.key === Global.getDragData().key) return
                            if (Global.state.updateDraging) { // 移动
                                this.updateData(this.dataAST.key, Global.getDragData().key)
                            }
                        }
                    },
                }),
                // 选中线框
                h('div', {
                    style: {
                        position: 'absolute',
                        inset: 0,
                        border: `2px solid ${Line.color}`,
                        opacity: Global.state.currentKey === this.dataAST.key ? 1 : 0,
                        zIndex: 0
                    }
                }),
                ...allArea
            ])
        ])
    }
})

type TPosition = 'top' | 'left' | 'right' | 'bottom'