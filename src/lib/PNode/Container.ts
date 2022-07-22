import PNode from "./PNode"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import Utils from "../Utils"
import Line from "./Line"
import { PNodeAST, Direction } from "../type"
import '../../style/container.less'
import Page from "./Page"
import Vue from 'vue'

/**
 * 容器
 */
export default class Container extends PNode<PNodeAST> {

    private page: Page

    protected data = {
        dataAST: {},
        dragLineShow: false, // 是否显示跟随线
        isDraging: false, // 是否正在拖拽
        dragLineProportion: 0.5 // 跟随线显示的位置比例
    }

    constructor(page: Page) {
        super()
        this.page = page
        this.observer = Vue.observable(this.data)
    }

    protected layout(h: CreateElement, vm: any) {
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
            class: {
                'vue-typesetting__container': true
            },
            style: {
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                flex: this.vm.flex,
                flexDirection: vm.dataAST.dir
            },
            on: {
                drop: Utils.stopBubble,
                mousemove: (e: MouseEvent) => {
                    if (!vm.isDraging) return
                    if (vm.dataAST.dir === Direction.ROW) {
                        vm.dragLineProportion = Number(((e.clientX - this.rect.left) / this.rect.width).toFixed(2))
                    } else {
                        vm.dragLineProportion = Number(((e.clientY - this.rect.top) / this.rect.height).toFixed(2))
                    }
                    if (vm.dragLineProportion > 1) vm.dragLineProportion = 1
                    if (vm.dragLineProportion < 0) vm.dragLineProportion = 0
                    vm.dragLineShow = true
                },
                mouseup: (e: MouseEvent) => {
                    if (!vm.isDraging || !vm.dragLineShow) return
                    vm.dragLineShow = false
                    vm.isDraging = false
                    this.PNodeMAP.clear() // 清理掉Vue子类，以触发重新加载
                    this.$emit('updateData', vm.dataAST.key, {
                        ...vm.dataAST,
                        p: vm.dragLineProportion
                    })
                }
            }
        }, [
            ...vm.dataAST.children.map((childAst: PNodeAST, index: number) => {
                const params = {
                    props: {
                        ...this.vm.$props,
                        flex: index === 0 ? vm.dataAST.p : (1 - vm.dataAST.p)
                    },
                    key: childAst.key
                }
                if (!this.PNodeMAP.get(childAst.key)) {
                    if (childAst.comp) {
                        this.PNodeMAP.set(childAst.key, new Leaf(this.page))
                    } else {
                        this.PNodeMAP.set(childAst.key, new Container(this.page))
                    }
                }
                return this.PNodeMAP.get(childAst.key).render(h, childAst, params)
            }),
            // 跟随线
            h('div', {
                style: {
                    position: 'absolute',
                    background: Line.color,
                    opacity: vm.dragLineShow ? 0.5 : 0,
                    ...getLine(vm.dataAST.dir, vm.dragLineProportion)
                }
            }),
            // 分割线
            h('div', {
                attrs: {
                    draggable: false
                },
                class: {
                    'vue-typesetting__container-split-line': true
                },
                style: {
                    position: 'absolute',
                    background: Line.color,
                    cursor: 'grabbing',
                    ...getLine(vm.dataAST.dir, vm.dataAST.p)
                },
                on: {
                    mousedown: (e: MouseEvent) => {
                        Utils.stopBubble(e)
                        vm.isDraging = true
                    },
                    mouseup: (e: MouseEvent) => {
                        Utils.stopBubble(e)
                        vm.isDraging = false
                    },
                    click: Utils.stopBubble
                },
            })
        ])
    }
}