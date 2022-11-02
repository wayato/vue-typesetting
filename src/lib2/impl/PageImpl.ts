import Drag from '../utils/Drag'
import MyVue from '../utils/MyVue'
import Utils from '../utils/Utils'
import DivideLeafNode from './DivideLeafNodeImpl'

export default class PageImpl implements Page {
    id: string
    children: Reactive<AllNode[]>

    constructor() {
        this.id = Utils.getUUID()
        this.children = MyVue.reactive<AllNode[]>([])
    }

    add(vueComp: VueComp): string {
        const divideLeafNode = new DivideLeafNode()
        divideLeafNode.init(vueComp)
        this.children.push(divideLeafNode)
        return divideLeafNode.id
    }
    delete(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Omit<AllNode, "id">): boolean {
        throw new Error("Method not implemented.");
    }
    find(id: string): AllNode {
        throw new Error("Method not implemented.");
    }
    select(id: string): LeafNode {
        throw new Error("Method not implemented.");
    }
    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__page',
            on: {
                mouseup: () => {
                    const vueComp: VueComp = Drag.getComp()
                    if (vueComp && this.children.length === 0) {
                        this.add(vueComp)
                    }
                }
            }
        }, this.children.map((node: AllNode) => node.getLayout()))
    }
}