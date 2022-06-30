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
                flexDirection: this.dataAST.dir
            },
            on: {
                drop: Utils.stopBubble,
                mousemove: (e: MouseEvent) => {
                    if (!this.isDraging) return
                    if (this.dataAST.dir === Direction.ROW) {
                        this.dragLineProportion = Number(((e.clientX - this.rect.left) / this.rect.width).toFixed(2))
                    } else {
                        this.dragLineProportion = Number(((e.clientY - this.rect.top) / this.rect.height).toFixed(2))
                    }
                    if (this.dragLineProportion > 1) this.dragLineProportion = 1
                    if (this.dragLineProportion < 0) this.dragLineProportion = 0
                    this.dragLineShow = true
                },
                mouseup: (e: MouseEvent) => {
                    if (!this.isDraging || !this.dragLineShow) return
                    this.dragLineShow = false
                    this.isDraging = false
                    this.PNodeMAP.clear() // 清理掉Vue子类，以触发重新加载
                    this.$emit('updateData', this.dataAST.id, {
                        ...this.dataAST,
                        p: this.dragLineProportion
                    })
                }
            }
        }, [
            ...this.dataAST.children.map((childAst: PNodeAST, index: number) => {
                const params = {
                    props: {
                        ...this.vue.$props,
                        flex: index === 0 ? this.dataAST.p : (1 - this.dataAST.p)
                    },
                    on: this.vue.$listeners,
                    key: childAst.id
                }
                if (!this.PNodeMAP.get(childAst.id)) {
                    if (childAst.comp) {
                        this.PNodeMAP.set(childAst.id, new Leaf())
                    } else {
                        this.PNodeMAP.set(childAst.id, new Container())
                    }
                }
                return this.PNodeMAP.get(childAst.id).render(h, childAst, params)
            }),
            // 跟随线
            h('div', {
                style: {
                    position: 'absolute',
                    background: Line.color,
                    opacity: this.dragLineShow ? 0.5 : 0,
                    ...getLine(this.dataAST.dir, this.dragLineProportion)
                }
            }),
            // 分割线
            h('div', {
                attrs: {
                    draggable: false
                },
                style: {
                    position: 'absolute',
                    background: Line.color,
                    cursor: 'grabbing',
                    opacity: this.splitLineShow ? 1 : 0,
                    ...getLine(this.dataAST.dir, this.dataAST.p)
                },
                on: {
                    mouseover: (e: MouseEvent) => {
                        this.splitLineShow = true
                    },
                    mouseleave: (e: MouseEvent) => {
                        if (this.isDraging) return
                        this.splitLineShow = false
                    },
                    mousedown: (e: MouseEvent) => {
                        Utils.stopBubble(e)
                        this.isDraging = true
                    },
                    mouseup: (e: MouseEvent) => {
                        Utils.stopBubble(e)
                        this.isDraging = false
                    },
                    click: Utils.stopBubble
                },
            })
        ])
    }
}