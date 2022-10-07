interface Vue {
    version: number | string
    h(tag: string, option: VNodeOption, content: string | VNode[]): VNode
    reactive <T> (target: T): Reactive<T>
    render: any
}

type Reactive <T> = T extends object ? T : { value: T }

type VNode = {
    el: unknown
    key: unknown
    [key: string]: unknown
}

type VNodeOption = {
    [key: string]: unknown
}

type VueComp = {
    [key: string]: unknown
}

type DivideNode = DivideContainerNode | DivideLeafNode
type LeafNode = FloatLeafNode | DivideLeafNode
type AllNode = LeafNode | DivideContainerNode