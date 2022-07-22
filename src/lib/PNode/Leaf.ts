import PNode from "./PNode"
import { CreateElement } from "vue/types/vue"
import Line from "./Line"
import type { VNode } from "vue"
import Utils from "../Utils"
import { PNodeAST, Direction } from "../type"
import Page from "./Page"
import Vue from 'vue'

/**
 * 叶子节点
 */
export default class Leaf extends PNode<PNodeAST> {

    private page: Page
    
    protected data = {
        dataAST: {},
        tipAreaIndex: -1, // 当前展示提示的阴影区域 0上 1右 2下 3左
        tipAreaAll: false, // 是否显示整个提示区域
        dragSelf: false // 是否在拖拽自身
    }

    constructor(page: Page) {
        super()
        this.page = page
        this.observer = Vue.observable(this.data)
    }

    // 点击
    private click(e: Event) {
        Utils.stopBubble(e)
        this.page.setCurrentKey(this.observer.dataAST.key)
    }

    // 开始拖拽
    private dragstart(e: DragEvent) {
        Utils.setDragImg(e)
        Utils.setConfig(e, this.observer.dataAST)
        this.observer.dragSelf = true
        this.page.observer.isDragInner = true
    }

    // 拖拽中
    // index: 拖拽至的阴影区域标识
    private dragover(e: DragEvent, index: number) {
        Utils.stopBubble(e)
        if (this.observer.dragSelf) return
        if (!this.page.observer.isDragInner) {
            this.observer.tipAreaIndex = index
        } else {
            this.observer.tipAreaAll = true
        }
    }

    // 拖拽离开
    private dragleave(e: DragEvent) {
        this.observer.tipAreaIndex = -1
        this.observer.tipAreaAll = false
    }

    // 拖拽结束
    private dragend(e: DragEvent) {
        this.observer.dragSelf = false
        this.page.observer.isDragInner = false
    }

    // 放置事件 
    // position: 放置的方位
    private drop(e: DragEvent, position: TPosition) {
        Utils.stopBubble(e)
        this.observer.tipAreaAll = false
        // 拖拽的是自身则不执行放置事件
        if (this.observer.dragSelf) return
        this.observer.tipAreaIndex = -1
        Utils.getConfig(e).then((res: PNodeAST) => {
            if (res.key) {
                // 有key代表是已经在画布上的元素进行交换
                this.page.updateData(this.observer.dataAST.key, res.key)
            } else {
                // 没有key代表新加入的元素
                const key: string = Utils.getUuid()
                const children = [
                    this.observer.dataAST,
                    {
                        ...res,
                        key
                    }
                ]
                this.page.updateData(this.observer.dataAST.key, {
                    key: Utils.getUuid(),
                    dir: /left|right/.test(position) ? Direction.ROW : Direction.COLUMN,
                    p: 0.5,
                    children: /bottom|right/.test(position) ? children : children.reverse()
                })
                this.page.setCurrentKey(key)
            }

        })
    }
    
    protected layout(h: CreateElement, vm: any) {
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
                    opacity: vm.tipAreaIndex === index ? '0.5' : '0',
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
        })
        return h('div', {
            attrs: {
                draggable: true
            },
            style: {
                overflow: 'hidden',
                position: 'relative',
                flex: this.vm.flex || 1,
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
            h(this.page.getComponent(vm.dataAST.comp), {
                props: vm.dataAST.data,
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
                        opacity: vm.currentKey === vm.dataAST.key ? 1 : 0
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
                        opacity: vm.tipAreaAll ? 0.5 : 0
                    }
                }),
                ...tipArea,
                ...determineArea
            ])
        ])
    }
}

type TPosition = 'top' | 'left' | 'right' | 'bottom'
