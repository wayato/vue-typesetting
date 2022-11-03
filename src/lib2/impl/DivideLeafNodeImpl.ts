import MyVue from '../utils/MyVue'
import Utils from '../utils/Utils'
import Component from './ComponentImpl'
import ComponentDesp from './ComponentDespImpl'
import Drag from '../utils/Drag'
import DivideContainerNode from './DivideContainerNodeImpl'
import { Direction } from '../enum'

export default class DivideLeafNodeImpl implements DivideLeafNode {
    id: string
    compId: string

    constructor() {
        this.id = Utils.getUUID()
    }

    init(vueComp: VueComp): void {
        this.compId = ComponentDesp.add(vueComp)
    }
    
    getLayout(props: DivideLeafNodeProps): VNode {
        const comp: Component = ComponentDesp.find(this.compId)
        return MyVue.h('div', {
            class: {
                'vue-typesetting__divide-leaf': true,
                'vue-typesetting__divide-leaf__selected': ComponentDesp.currentId.value === comp.id
            },
            style: {
                flex: props.flex || 1
            },
            on: {
                click: () => {
                    ComponentDesp.select(comp.id)
                }
            }
        }, [
            ...this.getOperAreaLayout(props),
            MyVue.h(comp.vueComp, {
                props: comp.props
            })
        ])
    }

    getOperAreaLayout(props: DivideLeafNodeProps): VNode[] {
        type Area = {
            feelArea: string
            tipArea: string
        }
        const OPER_AREA: Array<Area> = [
            {
                feelArea: '0 0, 50% 50%, 100% 0',
                tipArea: '0 0, 0 50%, 100% 50%, 100% 0'
            }, 
            {
                feelArea: '100% 100%, 50% 50%, 100% 0',
                tipArea: '50% 0, 100% 0, 100% 100%, 50% 100%'
            },
            {
                feelArea: '0 100%, 50% 50%, 100% 100%',
                tipArea: '0 50%, 100% 50%, 100% 100%, 0 100%'
            },
            {
                feelArea: '0 0, 50% 50%, 0 100%',
                tipArea: '0 0, 50% 0, 50% 100%, 0 100%'
            }
        ]
        return OPER_AREA.map((item: Area, index: number) => [
            MyVue.h('div', {
                class: 'vue-typesetting__divide-leaf__feel-area',
                style: {
                    clipPath: `polygon(${item.feelArea})`
                },
                on: {
                    mouseup: () => {
                        const vueComp: VueComp = Drag.getComp()
                        if (!vueComp) return
                        console.log('组件上方搁置')
                        const newContainer = new DivideContainerNode()
                        const newLeaf = new DivideLeafNodeImpl()
                        newLeaf.init(vueComp)
                        switch (index) {
                            case 0: // 上
                                newContainer.init(newLeaf, this, Direction.COLUMN)
                                break
                            case 1: // 右
                                newContainer.init(this, newLeaf, Direction.ROW)
                                break
                            case 2: // 下
                                newContainer.init(this, newLeaf, Direction.COLUMN)
                                break
                            case 3: // 左
                                newContainer.init(newLeaf, this, Direction.ROW)
                                break
                        }
                        props.fatherNode.update(this.id, newContainer)
                    }
                }
            }),
            MyVue.h('div', {
                class: 'vue-typesetting__divide-leaf__tip-area',
                style: {
                    clipPath: `polygon(${item.tipArea})`
                }
            })
        ]).flat()
    }
}