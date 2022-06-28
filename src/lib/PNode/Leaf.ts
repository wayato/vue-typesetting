import PNode from "./PNode"
import { CreateElement, Vue } from "vue/types/vue"
import Line from "./Line"
import Typesetting from "../Typesetting"
import type { VNode } from "vue"
import Utils from "../Utils"

/**
 * 叶子节点
 */
export default class Leaf extends PNode<PNodeAST> {

    // 当前展示提示的阴影区域 0上 1右 2下 3左
    private tipAreaIndex: number =  -1

    // 是否显示整个提示区域
    private tipAreaAll: boolean = false

    // 是否在拖拽自身
    private dragSelf: boolean = false

    // 点击
    private click() {
        this.vue.$pageCurrentKey = this.dataAST.key
    }

    // 开始拖拽
    private dragstart(e: DragEvent) {
        Utils.setDragImg(e)
        Utils.setConfig(e, this.dataAST)
        this.dragSelf = true
        this.vue.$pageInnerDraging = true
    }

    // 拖拽中
    // index: 拖拽至的阴影区域标识
    private dragover(e: DragEvent, index: number) {
        Utils.stopBubble(e)
        if (this.dragSelf) return
        if (!this.vue.$pageInnerDraging) {
            this.tipAreaIndex = index
        } else {
            this.tipAreaAll = true
        }
    }

    // 拖拽离开
    private dragleave(e: DragEvent) {
        this.tipAreaIndex = -1
        this.tipAreaAll = false
    }

    // 拖拽结束
    private dragend(e: DragEvent) {
        this.dragSelf = false
        this.vue.$pageInnerDraging = false
    }

    // 放置事件 
    // position: 放置的方位
    private drop(e: DragEvent, position: TPosition) {
        Utils.stopBubble(e)
        // 拖拽的是自身则不执行放置事件
        if (this.dragSelf) return
        this.tipAreaIndex = -1
        Utils.getConfig(e).then(res => {
            if (res.key) {
                // 有key代表是已经在画布上的元素进行交换
                this.$emit('updateData', this.dataAST.key, {
                    ...res,
                    key: Utils.getUuid()

                })
                this.$emit('updateData', res.key, {
                    ...this.dataAST,
                    key: Utils.getUuid()
                })
            } else {
                // 没有key代表新加入的元素
                const children = [
                    {
                        key: Utils.getUuid(),
                        component: this.dataAST.component
                    },
                    {
                        key: Utils.getUuid(),
                        component: res.component
                    }
                ]
                this.$emit('updateData', this.dataAST.key, {
                    key: Utils.getUuid(),
                    direction: /left|right/.test(position) ? Direction.ROW : Direction.COLUMN,
                    proportion: 0.5,
                    children: /bottom|right/.test(position) ? children : children.reverse()
                })
            }

        })
    }
    
    protected layout(h: CreateElement) {
        const AREA_CONFIG: [TPosition, string, string][] = [
            ['top', '0 0 50% 0', 'polygon(0 0, 50% 100%, 100% 0)'],
            ['right', '0 0 0 50%', 'polygon(100% 0, 0 50%, 100% 100%)'],
            ['bottom', '50% 0 0 0', 'polygon(0 100%, 50% 0, 100% 100%)'],
            ['left', '0 50% 0 0', 'polygon(0 0, 100% 50%, 0 100%)']
        ]
        const tipArea: VNode[] = [] // 着陆阴影提示区域
        const determineArea: VNode[] = [] // 实际着陆面区域
        AREA_CONFIG.forEach((item: [TPosition, string, string], index: number) => {
            tipArea.push(h('div', {
                style: {
                    position: 'absolute',
                    background: '#FFF',
                    inset: item[1],
                    transition: 'opacity .3s',
                    opacity: this.tipAreaIndex === index ? '0.5' : '0',
                    border: `2px dashed ${Line.color}`
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
                        this.dragover(e, index)
                    },
                    drop: (e: DragEvent) => {
                        this.drop(e, item[0])
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
            style: {
                overflow: 'hidden',
                position: 'relative',
                flex: this.vue.flex,
                opacity: 1
            },
            on: {
                dragstart: this.dragstart.bind(this),
                dragover: Utils.stopBubble,
                dragleave: this.dragleave.bind(this),
                dragend: this.dragend.bind(this),
                drop: Utils.stopBubble,
                click: this.click.bind(this)
            }
        }, [
            h(Typesetting.getComponent(this.dataAST.component), {
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
                        border: `2px solid ${Line.color}`,
                        opacity: this.vue.$pageCurrentKey === this.dataAST.key ? 1 : 0
                    }
                }),
                // 内部拖拽时显示的线框和背景
                h('div', {
                    style: {
                        position: 'absolute',
                        inset: 0,
                        border: `2px dashed ${Line.color}`,
                        background: '#FFF',
                        transition: 'opacity .3s',
                        opacity: this.tipAreaAll ? 0.5 : 0
                    }
                }),
                ...tipArea,
                ...determineArea
            ])
        ])
    }
}

type TPosition = 'top' | 'left' | 'right' | 'bottom'

declare global{
    enum Direction {
        ROW = 'row',
        COLUMN = 'column'
    }
} 

enum Direction {
    ROW = 'row',
    COLUMN = 'column'
}