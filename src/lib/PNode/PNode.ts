import Vue from 'vue'
import type { VNode, } from 'vue'
import type { CreateElement, VueConstructor } from 'vue/types/vue'
import { PNodeAST } from '../type'

export default abstract class PNode<T extends PNodeAST | PNodeAST[]> {

    // 抽象方法，每个PNode需要实现的布局
    protected abstract layout(h: CreateElement): VNode

    public vue: Vue & {
        [key: string]: any
    }

    protected dataAST: T

    protected rect: DOMRect

    // 存放当前PNode下所有直属关系的后代PNode
    protected PNodeMAP: Map<string, PNode<PNodeAST>> = new Map()

    // 用来生成当前vue实例的类，每个Key只生成一次该类，否则会引起组件重新加载
    private vueCtr: VueConstructor = null

    // 创建Vue的子类
    public create(keys: string[] = []): VueConstructor {
        if (this.vueCtr) return this.vueCtr // 如果已经有该类，不需要二次创建
        const _this = this
        this.vueCtr = Vue.extend({
            props: keys,
            data: () => this,
            computed: this.createComputed(keys),
            mounted() {
                this.$nextTick(() => {
                    if (this.$el) _this.rect = this.$el.getBoundingClientRect()
                })
            },
            render(h: CreateElement) {
                _this.vue = this
                return _this.layout(h)
            }
        })
        
        return this.vueCtr
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

    public render(h: CreateElement, dataAST: T, config?: any) {
        this.dataAST = dataAST
        this.clearPNodeMAP()
        const keys: string[] = config ? Object.keys(config.props) : []
        return h(this.create(keys), config)
    }

    protected $emit(eventName: string, ...arg: any[]) {
        this.vue.$emit(eventName, ...arg)
    }

    // 当容器内的节点发生变化，需要清除用不到的
    private clearPNodeMAP() {
        if (!Array.isArray(this.dataAST)) {
            if (this.dataAST.children) {
                this.dataAST.children.forEach((item: PNodeAST) => {
                    if (!this.PNodeMAP.has(item.id)) {
                        this.PNodeMAP.delete(item.id)
                    }
                })
            }
        }
    }
}