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
        this.ratio = MyVue.reactive<number>(0.5)
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

    getLayout(props: DivideContainerNodeProps): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-container',
            style: {
                flexDirection: this.direction.value,
                flex: props.flex
            }
        }, [
            // this.getLineLayout(),
            ...this.children.map((item: DivideNode, index: number) => {
                return item.getLayout({
                    fatherNode: this,
                    flex: index === 0 ? this.ratio.value : 1 - this.ratio.value
                })
            })
        ])
    }

    getLineLayout(): VNode {
        type Line = {
            width: string
            height: string
            left: string
            right: string
        }
        // const Line1: Line = {
        //     width: '100%',
        //     height: 
        // }
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-container__line',
            style: {

            }
        })
    }
}