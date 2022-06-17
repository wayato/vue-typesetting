import type { VueConstructor, VNode, Component, AsyncComponent } from 'vue'
import Utils from './Utils'
import Vue from 'vue'

export enum BlockType {
    Extru, // 挤压
    Float // 悬浮
}

export interface Entity extends Vue {
    isSelected: boolean
}
/**
 * Block 组件与可操作壳的整体
 */
export class Block {
    // 当前block的vue实例
    private blockEntity: Entity

    // 布局信息
    private layout: [number, number, number, number] = [0, 0, 0, 0]

    /**
     * 根据组件生成相应的block，返回dom节点
     * @param component 即将渲染的组件
     * @param clickEvent block点击事件
     * @param dropEvent block着陆事件
     * @returns 真实dom节点
     */
    public createElement(
        component: Component<any, any, any, any> | AsyncComponent<any, any, any, any>, 
        clickEvent: (e: Event) => void, 
        dropEvent: (e: DragEvent) => void
    ): Element {
        const ComponentCtr: VueConstructor = Vue.extend({
            data() {
                return {
                    isSelected: false, // 是否选中
                    tipAreaIndex: -1 // 当前展示提示的阴影区域 0上 1右 2下 3左
                }
            },
            render(h): VNode {
                const AREA_CONFIG: [string, string][] = [
                    ['0 0 0 50%', 'polygon(100% 0, 50% 50%, 100% 100%)', ],
                    ['50% 0 0 0', 'polygon(0 100%, 50% 50%, 100% 100%)'],
                    ['0 50% 0 0', 'polygon(0 0, 50% 50%, 0 100%)'],
                    ['0 0 50% 0', 'polygon(0 0, 50% 50%, 100% 0)']
                ]
                const tipArea: VNode[] = []
                const determineArea: VNode[] = []
                const lineArea: VNode[] = []
                AREA_CONFIG.forEach((item: [string, string], index: number) => {
                    tipArea.push(h('div', {
                        style: {
                            position: 'absolute',
                            background: '#000',
                            inset: item[0],
                            transition: 'opacity .3s',
                            opacity: this.tipAreaIndex === index ? '0.3' : '0'
                        }
                    }))
                    determineArea.push(h('div', {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            clipPath: item[1]
                        },
                        on: {
                            dragover: () => this.tipAreaIndex = index,
                            dragleave: () => this.tipAreaIndex = -1,
                            drop: (e: DragEvent) => {
                                this.tipAreaIndex = -1
                                dropEvent(e)
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
                        draggable: this.isSelected
                    },
                    style: {
                        position: 'absolute',
                    }
                }, [
                    h(component),
                    h('div', {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            boxSizing: 'border-box'
                        },
                        on: {
                            click: (e: Event) => {
                                Utils.stopBubble(e)
                                clickEvent(e)
                            }
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
        this.blockEntity = new ComponentCtr()
        return this.blockEntity.$mount().$el
    }

    // 选中该block
    public setSelected(isSelected: boolean) {
        this.blockEntity.isSelected = isSelected
    }
}