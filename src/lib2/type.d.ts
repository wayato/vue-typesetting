interface InitialOption {
    el: HTMLElement
    vue: Vue
}

interface Vue {
    version: number | string
    h(tag: string | VueComp, option?: VNodeOption, content?: string | VNode[]): VNode
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

declare enum OperEvent {
    SELECT = 'select',
    CHANGE = 'change'
}

declare enum Direction {
    COLUMN = 'column',
    ROW = 'row'
}