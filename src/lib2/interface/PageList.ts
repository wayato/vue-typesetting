interface PageList {
    children: Reactive<Page[]>
    currentId: string

    add(index: number): string
    delete(id: string): boolean
    update(id: string): boolean
    find(id: string): Page

    getLayout(vue: Vue): VNode
    render(el: Element): void
}