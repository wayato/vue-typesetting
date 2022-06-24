import Vue from 'vue'
import type { VNode } from 'vue'
import type { CreateElement, ExtendedVue } from 'vue/types/vue'

export default abstract class PNode<T extends PNodeAST | PNodeAST[]> {

    protected vue: Vue

    protected dataAST: T

    constructor(dataAst: T) {
        this.dataAST = dataAst
    }

    // 创建
    public create(): ExtendedVue<Vue, unknown, unknown, unknown, Record<never, any>> {
        const _this = this
        return Vue.extend({
            // props: this.props,
            data: () => this,
            render(h) {
                _this.vue = this
                return _this.layout(h)
            }
        })
    }

    // 布局
    protected abstract layout(h: CreateElement): VNode
}