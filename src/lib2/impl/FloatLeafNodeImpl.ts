import MyVue from '../utils/MyVue'

export default class FloatLeafNodeImpl implements FloatLeafNode {
    id: string;
    compId: string;
    left: string | number;
    top: string | number;
    width: string | number;
    height: string | number;
    zIndex: number;
    
    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__float-leaf'
        }, '悬浮叶子节点') 
    }
}