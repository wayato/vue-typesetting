// 组件信息
type ComponentInfo = {
    readonly id: string
    readonly comp: Component
    props?: any
    style?: any
    extra?: any
}

// 可修改的组件信息
type ComponentInfoBeChange = Omit<ComponentInfo, 'id' | 'comp'>

// TODO 组件
type Component = {}

// TODO 挤出放置位置
type ExtruPosition = {}

// 悬浮放置位置
type FloatPosition = {
    left: number
    top: number
    width: number
    height: number
}

// 数据仓库
type DataDesp = {
    [id: ComponentInfo['id']]: ComponentInfo
}

// 页面列表
type PageList = Page[]

// 每页布局
type Page = {
    readonly id: string
    layout: Array<FloatNode | ExtruNode | ExtruNodeLeaf>
}

// 悬浮节点
type FloatNode = {
    id: string
    dataId: ComponentInfo['id']
} & FloatPosition

// 挤压节点
type ExtruNode = {
    id: string
    ratio: number // 占比: children[0] : children[1]
    children: [ExtruNode | ExtruNodeLeaf, ExtruNode | ExtruNodeLeaf]
}

// 挤压叶子节点
type ExtruNodeLeaf = {
    id: string
    dataId: ComponentInfo['id']
}

