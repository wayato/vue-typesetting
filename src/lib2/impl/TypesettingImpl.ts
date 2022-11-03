import PageList from './PageListImpl'
import Drag from '../utils/Drag'
import MyVue from '../utils/MyVue'
import Dispatch from '../utils/Dispatch'
import ComponentDesp from './ComponentDespImpl'

export default class TypesettingImpl implements Typesetting {
    listenerEvents: Map<string, Function> = new Map()

    init(option: InitialOption): void {
        MyVue.init(option.vue)
        Drag.init()
        const pageList = new PageList()
        pageList.render(option.el)
    }

    startDrag(e: MouseEvent, vueComp: VueComp): void {
        Drag.show(e)
        Drag.setComp(vueComp)
    }
    insertComp(comp: Component): boolean {
        throw new Error("Method not implemented.");
    }
    selectComp(id: string): Component {
        throw new Error("Method not implemented.");
    }
    updateComp(id: string, data: Partial<Omit<Component, 'id' | 'vueComp'>>): void {
        ComponentDesp.find(id).update(data)
    }
    removeComp(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    exchangeComp(id1: string, id2: string): boolean {
        throw new Error("Method not implemented.");
    }
    
    on(eventName: OperEvent, callback: Function): void {
        Dispatch.on(eventName, callback)
    }
}