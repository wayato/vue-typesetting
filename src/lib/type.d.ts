// Page基本配置项
type PageBaseConfig = {
    bg_color: string // 页面背景颜色
    watermark: string // 水印
    header_height: string // 页眉高度
    headerConfig: any // 页眉配置
    footer_height: string // 页脚高度
    footerConfig: any // 页脚配置
    left_margin: string // 左边距
    right_margin: string // 右边距
    paddingTop: string // 上边距
    paddingBottom: string // 下边距
    fontFamily: string // 全局字体
    title: PageTitleType
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