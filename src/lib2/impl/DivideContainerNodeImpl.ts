import MyVue from '../utils/MyVue'
export default class DivideContainerNodeImpl implements DivideContainerNode {
    id: string;
    ratio: number;
    children: [DivideNode, DivideNode];
    
    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-container'
        }, this.children.map((node: DivideNode) => node.getLayout()))
    }
}