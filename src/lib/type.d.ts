// Page基本配置项
type PageBaseConfig = {
    bgColor: string // 页面背景颜色
    watermark: string // 水印
    leftMargin: string // 左边距
    rightMargin: string // 右边距
    topMargin: string // 上边距
    bottomMargin: string // 下边距
    fontFamily: string // 全局字体
    headerFlexes: [number, number, number] // 页眉3块区域的占比
    footerFlexes: [number, number, number] // 页脚3块区域的占比
}

// 可能需要展示在某处的信息
type PageInfo = {
    page: number // 当前页
    total: number // 总页码
}

// 页眉页脚配置
type HeaderFooterConfig = {
    comp: string // 组件名称
    disabled: boolean // 是否禁用操作
    height: [string, string] // 页眉、页脚分别高度
    props: [object[], object[]] // 页眉、页脚分别传入的props
}

type ContianerAst = {
    key: string // 唯一标识，用于查找更新
    dir: 1 | 2 // 排列方式 水平1 垂直2
    p: number // 容器节点的元素占比
    children: Array<ContianerAst | LeafAst>
}

type LeafAst = {
    key: string // 唯一标识，用于查找更新
    comp: string // 组件名称
    props?: any // 需要传入组件的参数
    extraData?: any // 额外的一些需要记录的参数
}