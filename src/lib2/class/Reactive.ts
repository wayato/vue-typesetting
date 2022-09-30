class Reactive implements ReactiveImpl {
    initLayout(h: any): void {
        throw new Error("Method not implemented.");
    }
    initReactiveData<T>(pageList: PageList): T {
        throw new Error("Method not implemented.");
    }
    render(hostEL: Element): void {
        throw new Error("Method not implemented.");
    }
    

    constructor(vue: any) {
        this.initLayout()
    }
}