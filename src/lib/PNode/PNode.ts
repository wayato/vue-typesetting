import Vue from 'vue'
import type { VNode } from 'vue'
import type { CreateElement } from 'vue/types/vue'
import { PNodeAST } from '../type'

export default abstract class PNode<T extends PNodeAST | PNodeAST[]> {

    protected vue: Vue & {
        [key: string]: any
    }

    protected dataAST: T

    protected rect: DOMRect

    constructor(dataAst: T) {
        this.dataAST = dataAst
    }

    // 创建
    public create(config?: any) {
        const _this = this
        const keys: string[] = config ? Object.keys(config.props) : []
        return Vue.extend({
            props: keys,
            data: () => this,
            computed: this.createComputed(keys),
            mounted() {
                this.$nextTick(() => {
                    _this.rect = this.$el.getBoundingClientRect()
                })
            },
            render(h) {
                _this.vue = this
                return _this.layout(h)
            }
        })
    }

    // 将props转成$开头的计算属性
    private createComputed(keys: string[]) {
        const computed: {
            [key: string]: {
                get: () => any,
                set: (val: any) => void
            }
        } = {}
        keys.forEach((key: string) => {
            computed['$' + key] = {
                get() {
                    return this[key]()
                },
                set(val: any) {
                    this[key](val)
                }
            }
        })
        return computed
    }

    public render(h: CreateElement, config?: any) {
        return h(this.create(config), config)
    }

    // 布局
    protected abstract layout(h: CreateElement): VNode

    protected $emit(eventName: string, ...arg: any[]) {
        this.vue.$emit(eventName, ...arg)
    }
}