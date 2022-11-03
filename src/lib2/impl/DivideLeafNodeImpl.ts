import MyVue from '../utils/MyVue'
import Utils from '../utils/Utils'
import Component from './ComponentImpl'
import ComponentDesp from './ComponentDespImpl'
import Drag from '../utils/Drag'
import DivideContainerNode from './DivideContainerNodeImpl'
import Page from './PageImpl'

export default class DivideLeafNodeImpl implements DivideLeafNode {
    id: string
    compId: string
    fatherNode: Page | DivideContainerNode

    constructor() {
        this.id = Utils.getUUID()
    }

    init(fatherNode: Page | DivideContainerNode, vueComp: VueComp): void {
        this.compId = ComponentDesp.add(vueComp)
        this.fatherNode = fatherNode
    }
    
    getLayout(): VNode {
        const comp: Component = ComponentDesp.find(this.compId)
        return MyVue.h('div', {
            class: {
                'vue-typesetting__divide-leaf': true,
                'vue-typesetting__divide-leaf__selected': ComponentDesp.currentId.value === comp.id
            },
            on: {
                click: () => {
                    ComponentDesp.select(comp.id)
                },
                mouseup: () => {
                    const vueComp: VueComp = Drag.getComp()
                    if (vueComp) {
                        console.log('组件上方搁置')
                        const divideContainerNode = new DivideContainerNode()
                        const divideLeafNode = new DivideLeafNodeImpl()
                        divideLeafNode.init(divideContainerNode, vueComp)
                        divideContainerNode.init(this.fatherNode, this, divideLeafNode, this.id)
                        this.fatherNode = divideContainerNode
                    }
                }
            }
        }, [
            MyVue.h(comp.vueComp, {
                props: comp.props
            })
        ])
    }
}