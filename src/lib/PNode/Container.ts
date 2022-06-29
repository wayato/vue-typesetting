import PNode from "./PNode"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import Utils from "../Utils"
import Line from "./Line"
import { PNodeAST, Direction } from "../type"

/**
 * 容器
 */
export default class Container extends PNode<PNodeAST> {
    // 是否显示分割线
    private splitLineShow: boolean = false

    // 是否显示跟随线
    private dragLineShow: boolean = false

    // 是否正在拖拽
    private isDraging: boolean = false

    // 跟随线显示的位置比例
    private dragLineProportion: number = 0.5

    protected layout(h: CreateElement) {
        const getLine = (direction: Direction, proportion: number) => {
            if (direction === Direction.COLUMN) {
                return {
                    left: 0,
                    right: 0,
                    height: '4px',
                    top: `calc(${proportion} * 100% - 2px)`
                }
            } else {
                return {
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    left: `calc(${proportion} * 100% - 2px)`
                }
            }
        }
        return h('div', {
            style: {
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                flex: this.vue.flex,
                flexDirection: this.dataAST.direction
            },
            on: {
                drop: Utils.stopBubble,
                mousemove: (e: MouseEvent) => {
                    if (!this.isDraging) return
                    if (this.dataAST.direction === Direction.ROW) {
                        this.dragLineProportion = (e.clientX - this.rect.left) / this.rect.width
                    } else {
                        this.dragLineProportion = (e.clientY - this.rect.top) / this.rect.height
                    }
                    if (this.dragLineProportion > 1) this.dragLineProportion = 1
                    if (this.dragLineProportion < 0) this.dragLineProportion = 0
                    this.dragLineShow = true
                },
                mouseup: () => {
                    this.dragLineShow = false
                    if (!this.isDraging) return
                    this.isDraging = false
                    this.$emit('updateData', this.dataAST.key, {
                        ...this.dataAST,
                        proportion: this.dragLineProportion
                    })
                }
            }
        }, [
            ...this.dataAST.children.map((childAst: PNodeAST, index: number) => {
                const params = {
                    props: {
                        ...this.vue.$props,
                        flex: index === 0 ? this.dataAST.proportion : (1 - this.dataAST.proportion)
                    },
                    on: this.vue.$listeners,
                    key: childAst.key
                }
                if (childAst.component) {
                    return new Leaf(childAst).render(h, params)
                } else {
                    return new Container(childAst).render(h, params)
                }
            }),
            // 跟随线
            h('div', {
                style: {
                    position: 'absolute',
                    background: Line.color,
                    opacity: this.dragLineShow ? 0.5 : 0,
                    ...getLine(this.dataAST.direction, this.dragLineProportion)
                }
            }),
            // 分割线
            h('div', {
                style: {
                    position: 'absolute',
                    background: Line.color,
                    cursor: 'grabbing',
                    opacity: this.splitLineShow ? 1 : 0,
                    ...getLine(this.dataAST.direction, this.dataAST.proportion)
                },
                on: {
                    mouseover: () => {
                        this.splitLineShow = true
                    },
                    mouseleave: () => {
                        if (this.isDraging) return
                        this.splitLineShow = false
                    },
                    mousedown: () => {
                        this.splitLineShow = true
                        this.isDraging = true
                    }
                },
            })
        ])
    }
}