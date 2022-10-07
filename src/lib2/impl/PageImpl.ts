import MyVue from '../utils/MyVue'

export default class PageImpl implements Page {
    id: string
    children: AllNode[] = []

    add(comp: Component, containerId: string): string {
        throw new Error("Method not implemented.");
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
                click: () => {
                    console.log('插入第一个组件')
                }
            }
        }, this.children.map((node: AllNode) => node.getLayout()))
    }
}