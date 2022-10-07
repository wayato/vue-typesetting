import Page from './PageImpl'
import Utils from '../utils/Utils'
import MyVue from '../utils/MyVue'

export default class PageListImpl implements PageList {
    children: Reactive<Page[]>
    currentId: string

    constructor() {
        this.children = MyVue.reactive<Page[]>([])
        this.add(0)
    }

    add(index: number): string {
        const page = new Page()
        page.id = Utils.getUUID()
        this.children.splice(index, 0, page)
        return page.id
    }
    delete(id: string): boolean {
        throw new Error("Method not implemented.")
    }
    update(id: string): boolean {
        throw new Error("Method not implemented.")
    }
    find(id: string): Page {
        throw new Error("Method not implemented.")
    }

    getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting'
        }, this.children.map((page: Page) => page.getLayout()))
    }

    render(el: Element): void {
        MyVue.render(this.getLayout.bind(this), el)
    }
}