import Page from './PageImpl'
import MyVue from '../utils/MyVue'
import ComponentDesp from './ComponentDespImpl'

export default class PageListImpl implements PageList {
    children: Reactive<Page[]>
    currentId: Reactive<string>

    constructor() {
        ComponentDesp.clear()
        this.children = MyVue.reactive<Page[]>([])
        this.add(0)
    }

    add(index: number): string {
        const page = new Page()
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
            class: 'vue-typesetting',
            draggable: false
        }, this.children.map((page: Page) => page.getLayout()))
    }

    render(el: Element): void {
        MyVue.render(this.getLayout.bind(this), el)
    }
}