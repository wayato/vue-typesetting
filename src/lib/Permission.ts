export default class Permission {
    private _header: boolean = false
    private _footer: boolean = false
    private _comp: boolean = false

    public setProps(props?: PermissionProps) {
        const {header, footer, comp} = props ?? {}
        this._header = header || false
        this._footer = footer || false
        this._comp = comp || false
    }

    public get header(): boolean {
        return this._header
    }

    public set header(val: boolean) {
        this._header = val
    }

    public get footer(): boolean {
        return this._footer
    }

    public set footer(val: boolean) {
        this._footer = val
    }

    public get comp(): boolean {
        return this._comp
    }

    public set comp(val: boolean) {
        this._comp = val
    }
}

export interface PermissionProps {
    header?: boolean
    footer?: boolean
    comp?: boolean
}
