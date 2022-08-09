// Page基本配置项
type PageBaseConfig = {
    bg_color: string // 页面背景颜色
    watermark: string // 水印
    left_margin: string // 左边距
    right_margin: string // 右边距
    fontFamily: string // 全局字体
    title: PageTitleType
}

// 页眉页脚配置
type HeaderFooterConfig = {
    comp: string // 组件名称
    disabled: boolean // 是否禁用操作
    height: [string, string] // 页眉、页脚分别高度
    props: [object[], object[]] // 页眉、页脚分别传入的props
}

// Page标题配置
type PageTitleType = {
    fontFamily: string // 字体
    fontSize: string // 字号
    color: string // 颜色
    bold: boolean // 是否加粗
    italic: boolean // 是否斜体
    underline: boolean // 是否下划线
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