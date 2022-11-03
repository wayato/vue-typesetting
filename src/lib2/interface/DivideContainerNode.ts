interface DivideContainerNode {
    id: string
    ratio: Reactive<number> // 占比: children[0] : children[1]
    children: Reactive<[DivideNode, DivideNode]>
    fatherNode: Page | DivideContainerNode

    init(fatherNode: Page | DivideContainerNode, node1: DivideNode, node2: DivideNode, replaceId: string): void
    update(id: string, node: DivideNode): boolean
    getLayout(): VNode
}