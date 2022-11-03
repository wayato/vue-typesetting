interface Page extends Layout<PageProps> {
    id: string
    children: Reactive<Array<AllNode>>

    add(comp: VueComp): string
    delete(id: string): boolean
    update(id: string, node: AllNode): boolean
    find(id: string): AllNode
    select(id: string): LeafNode
}

type PageProps = {
    fatherNode: PageList
}