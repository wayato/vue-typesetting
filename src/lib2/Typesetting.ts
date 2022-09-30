export default class Typesetting implements TypesettingImpl {
    public insertComp(comp: Component, position?: ExtruPosition | FloatPosition): boolean {
        throw new Error("Method not implemented.");
    }
    public selectComp(id: string): ComponentInfo {
        throw new Error("Method not implemented.");
    }
    public updateAttr<T extends "props" | "style" | "extra">(id: string, attr: T, data: ComponentInfoBeChange[T]): boolean {
        throw new Error("Method not implemented.");
    }
    
    public init(): void {
        new Reactive()
    }
}