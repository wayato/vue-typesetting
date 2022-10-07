import MyVue from '../utils/MyVue'

export default class DivideLeafNodeImpl implements DivideLeafNode {
    id: string;
    containerId: string;
    compId: string;
    
    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__divide-leaf'
        }, '分裂叶子节点')
    }
}