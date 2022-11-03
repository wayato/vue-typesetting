import MyVue from '../utils/MyVue'
import Page from './PageImpl'

export default class DivideContainerNodeImpl implements DivideContainerNode {
    id: string;
    ratio: Reactive<number>
    children: Reactive<[DivideNode, DivideNode]>
    fatherNode: Page | DivideContainerNode

    constructor() {
        this.children = MyVue.reactive<[DivideNode, DivideNode]>([null, null])
    }
    
    init(fatherNode: Page | DivideContainerNode, node1: DivideNode, node2: DivideNode, replaceId: string): void {
        this.children[0] = node1
        this.children[1] = node2
        fatherNode.update(replaceId, this)
        this.fatherNode = fatherNode
    }

    update(id: string, node: DivideNode): boolean {
        const nodeIndex: number = this.children.findIndex((item: DivideNode) => item.id === id)
        this.children.splice(nodeIndex, 1, node)
        return nodeIndex != -1
    }

    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-container'
        }, this.children.map((node: DivideNode) => node.getLayout()))
    }
}