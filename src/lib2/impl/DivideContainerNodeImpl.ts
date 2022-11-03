import MyVue from '../utils/MyVue'
import { Direction } from '../enum'

export default class DivideContainerNodeImpl implements DivideContainerNode {
    id: string;
    ratio: Reactive<number>
    direction: Reactive<Direction>
    children: Reactive<[DivideNode, DivideNode]>

    constructor() {
        this.children = MyVue.reactive<[DivideNode, DivideNode]>([null, null])
        this.direction = MyVue.reactive<Direction>(Direction.COLUMN)
    }
    
    
    init(node1: DivideNode, node2: DivideNode, direction: Direction): void {
        this.children[0] = node1
        this.children[1] = node2
        this.direction.value = direction  
    }

    update(id: string, node: DivideNode): boolean {
        const nodeIndex: number = this.children.findIndex((item: DivideNode) => item.id === id)
        this.children.splice(nodeIndex, 1, node)
        return nodeIndex != -1
    }

    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-container',
            style: {
                flexDirection: this.direction.value
            }
        }, this.children.map((node: DivideNode) => node.getLayout({
            fatherNode: this
        })))
    }
}