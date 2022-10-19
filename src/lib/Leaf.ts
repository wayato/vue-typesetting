import Vue, { PropType, VNode } from 'vue'
import Line from './Line'
import Utils from './Utils'
import DragImg from './DragImg'


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
            type: Object as PropType<LeafAst>
        },
        flex: {
            type: Number,
            default: 1
        },
        global: {
            type: Object
        },
        scale: {
            type: Number
        }
    },
    data() {
        return {
            tipAreaIndex: -1, // 当前展示提示的阴影区域 0上 1右 2下 3左
            tipAreaAll: false, // 是否显示整个提示区域
            dragSelf: false, // 是否在拖拽自身
            compProps: null, // 传入组件的props
        }
    },
    watch: {
        'dataAST.props': {
            handler(newValue, oldValue) {
                const obj = this.global.propsAop?.(JSON.parse(JSON.stringify(this.dataAST)))
                if (typeof obj === 'object') {
                    if (typeof obj.then === 'function') {
                        obj.then((res: any) => {
                            if (typeof res !== 'object') {
                                console.warn('额外props传入有误')
                                return
                            }
                            this.compProps = {
                                ...newValue,
                                ...res
                            }
                        })
                    } else {
                        this.compProps = {
                            ...newValue,
                            ...obj
                        }
                    }
                } else if (obj === undefined) {
                    // 没有aop事件，则没有额外参数
                    this.compProps = {
                        ...newValue
                    }
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
            return (!!this.global.propsAop && !!this.compProps) || !this.global.propsAop
        },
        renderComp() {
            return this.global.hostVue.$options.components[this.dataAST.comp] || 'div'
        }
    },
    render(h) {
        const allArea: VNode[] = []
        AREA_CONFIG.forEach((item: [TPosition, string, string], index: number) => {
            allArea.push(h('div', {
                class: {
                    'vue-typesetting__leaf--clip': this.global.addDraging
                },
                style: {
                    position: 'absolute',
                    top: item[1].split(' ')[0],
                    right: item[1].split(' ')[1],
                    bottom: item[1].split(' ')[2],
                    left: item[1].split(' ')[3],
                    opacity: 0,
                    clipPath: item[2],
                    zIndex: 10,
                },
                on: {
                    mouseup: (e: Event) => {
                        if (this.global.addDraging) { // 新增
                            const key: string = Utils.getUuid()
                            const newLeaf: LeafAst = {
                                ...DragImg.dragData,
                                key
                            }
                            const children = [
                                this.dataAST,
                                newLeaf
                            ]
                            this.updateData(this.dataAST.key, {
                                key: key + '-c', // 给容器的id
                                dir: /left|right/.test(item[0]) ? 1 : 2,
                                p: 0.5,
                                children: /bottom|right/.test(item[0]) ? children : children.reverse()
                            }, newLeaf)
                            this.changeKey(newLeaf)
                        }
                    }
                }
            }))
            allArea.push(h('div', {
                style: {
                    position: 'absolute',
                    background: '#FFF',
                    top: item[1].split(' ')[0],
                    right: item[1].split(' ')[1],
                    bottom: item[1].split(' ')[2],
                    left: item[1].split(' ')[3],
                    transition: 'opacity .3s',
                    opacity: 0,
                    border: `${Line.getWeight(this.scale)}px dashed ${Line.color}`,
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
                    this.global.updateDraging = true
                    this.global.isInner = true
                    DragImg.show(e.x, e.y, this.dataAST, () => {
                        this.global.updateDraging = false
                        if (this.global.isInner === false) {
                            this.updateData(this.dataAST.key)
                        }
                    })
                    this.dragSelf = true
                },
                mouseup: () => {
                    this.dragSelf = false
                },
                click: () => {
                    if (!this.global.updateDraging && this.isRender) {
                        this.changeKey(this.dataAST)
                    }
                }
            }
        }, [
            this.global.debug ? h('div', {
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
                }, '节点数据'),
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
                }, '传入props'),
                h('button', {
                    style: {
                        marginRight: '10px',
                        fontSize: '20px'
                    },
                    on: {
                        click: (e: Event) => {
                            Utils.stopBubble(e)
                            Reflect.set(window, 'debugVue', this.$refs[this.dataAST.key])
                            console.log('实例数据已赋值变量：debugVue')
                            console.log(this.$refs[this.dataAST.key])
                        }
                    }
                }, '组件实例'),
            ]) : null,
            this.isRender ? h(this.renderComp, {
                ref: this.dataAST.key,
                props: this.compProps,
                style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                }
            }) : h('div', null, '加载中……'),
            h('div', {
                style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    boxSizing: 'border-box'
                }
            }, [
                // 内部拖拽时显示的线框和背景
                h('div', {
                    class: {
                        'vue-typesetting__leaf--all': this.global.updateDraging
                    },
                    style: {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        border: `${Line.getWeight(this.scale)}px dashed ${Line.color}`,
                        background: '#FFF',
                        transition: 'opacity .3s',
                        zIndex: (this.global.updateDraging && !this.dragSelf) ? 15 : 1,
                        opacity: 0,
                    },
                    on: {
                        mouseup: () => {
                            if (this.dataAST.key === DragImg.dragData?.key) return
                            if (this.global.updateDraging) { // 移动
                                this.updateData(this.dataAST.key, DragImg.dragData?.key)
                            }
                        }
                    },
                }),
                // 选中线框
                h('div', {
                    style: {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        border: `${Line.getWeight(this.scale)}px solid ${Line.color}`,
                        opacity: this.global.currentKey === this.dataAST.key ? 1 : 0,
                        pointerEvents: 'none'
                    }
                }),
                ...allArea
            ])
        ])
    }
})

type TPosition = 'top' | 'left' | 'right' | 'bottom'