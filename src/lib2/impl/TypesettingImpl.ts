import PageList from './PageListImpl'
import Drag from '../utils/Drag'
import MyVue from '../utils/MyVue'

export default class TypesettingImpl implements Typesetting {

    init(vue: Vue, domId: string): void {
        MyVue.init(vue)
        const el: Element = document.getElementById(domId)

        // 初始化拖拽
        Drag.init()

        // 初始化画布
        const pageList = new PageList()
        pageList.render(el)

    }

    startDrag(e: MouseEvent, vueComp: VueComp): void {
        Drag.show(e)
    }

    endDrag() {

    }

    insertComp(comp: Component): boolean {
        throw new Error("Method not implemented.");
    }
    selectComp(id: string): Component {
        throw new Error("Method not implemented.");
    }
    updateComp(id: string, data: Partial<Omit<Component, "id">>): boolean {
        throw new Error("Method not implemented.");
    }
    removeComp(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    exchangeComp(id1: string, id2: string): boolean {
        throw new Error("Method not implemented.");
    }
}