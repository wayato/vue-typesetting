import MyVue from '../utils/MyVue'
import Utils from '../utils/Utils'
import Component from './ComponentImpl'
import ComponentDesp from './ComponentDespImpl'

export default class DivideLeafNodeImpl implements DivideLeafNode {
    id: string
    compId: string

    constructor() {
        this.id = Utils.getUUID()
    }

    init(vueComp: VueComp): void {
        this.compId = ComponentDesp.add(vueComp)
    }
    
    getLayout(): VNode {
        const comp: Component = ComponentDesp.find(this.compId)
        console.log(ComponentDesp.currentId.value, comp.id, ComponentDesp.currentId.value === comp.id)
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-leaf',
            style: {
                background: ComponentDesp.currentId.value === comp.id ? '#ccc' : '#fff'
            },
            on: {
                click: () => {
                    ComponentDesp.select(comp.id)
                    console.log(ComponentDesp)
                }
            }
        }, [
            MyVue.h(comp.vueComp, {
                props: comp.props
            })
        ])
    }
}