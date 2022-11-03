interface PageList extends Layout<PageListProps> {
    children: Reactive<Page[]>
    currentId: Reactive<string>

    add(index: number): string
    delete(id: string): boolean
    update(id: string): boolean
    find(id: string): Page
    render(el: Element): void
}

type PageListProps = {}