interface ReactiveImpl {

    // 初始化响应式数据
    initReactiveData <T> (pageList: PageList): T
    // 初始化布局
    initLayout(h: any): void
    // 渲染
    render(hostEL: Element): void
}