// Page基本配置项
export type PageBaseConfig = {
    backgroundColor: string // 页面背景颜色
    watermark: string // 水印
    headerHeight: string // 页眉高度
    footerHeight: string // 页脚高度
    leftMargin: string // 左边距
    rightMargin: string // 右边距
    fontFamily: string // 全局字体
    title: PageTitleType
}

// Page标题配置
export type PageTitleType = {
    fontFamily: string // 字体
    fontSize: string // 字号
    color: string // 颜色
    bold: boolean // 是否加粗
    italic: boolean // 是否斜体
    underline: boolean // 是否下划线
}

export type PNodeAST = {
    id: string // 唯一标识，用于查找更新
    comp?: string // 组件名称
    data?: any // 需要传入组件的参数
    extraData?: any // 额外的一些需要记录的参数
    dir?: Direction // 排列方式 水平row 垂直column
    p?: number // 容器节点的元素占比
    layout?: any // 组件位置，只有在悬浮排列的情况下才有
    children?: PNodeAST[]
}

export enum Direction {
    ROW = 'row',
    COLUMN = 'column'
}