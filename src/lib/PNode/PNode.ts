import Vue from 'vue'
import type { VNode, } from 'vue'
import type { CreateElement, VueConstructor } from 'vue/types/vue'
import { PNodeAST } from '../type'

export default abstract class PNode<T extends PNodeAST | PNodeAST[]> {

    // 抽象属性，每个PNode需要实现的响应式数据
    protected abstract data: any

    // 抽象方法，每个PNode需要实现的布局
    protected abstract layout(h: CreateElement, vm: any): VNode

    public observer: any = {}

    // 该节点的vue实例
    public vm: Vue & {
        [key: string]: any
    }

    protected rect: DOMRect

    // 存放当前PNode下所有直属关系的后代PNode
    protected PNodeMAP: Map<string, PNode<PNodeAST>> = new Map()

    // 用来生成当前vue实例的类，每个Key只生成一次该类，否则会引起组件重新加载
    private vueCtr: VueConstructor = null

    // 创建Vue的子类
    public create(propKeys: string[] = [], dataAST: T): VueConstructor {
        if (this.vueCtr) return this.vueCtr // 如果已经有该类，不需要二次创建
        this.data.dataAST = dataAST
        const _this = this
        const computed = this.createComputed(Object.keys(this.data))
        if ('appendComputed' in this) { // 如果有额外的计算属性，通过该方法额外添加
            Object.assign(computed, (<any>this).appendComputed())
        }
        this.vueCtr = Vue.extend({
            props: propKeys,
            computed,
            mounted() {
                this.$nextTick(() => {
                    if (this.$el) _this.rect = this.$el.getBoundingClientRect()
                })
            },
            watch: this.createWatch(Object.keys(this.data)),
            render(h: CreateElement) {
                _this.vm = this
                return _this.layout(h, this)
            }
        })
        
        return this.vueCtr
    }

    // 将props转成$开头的计算属性
    private createComputed(keys: string[]) {
        const computed: any = {}
        keys.forEach((key: string) => {
            computed[key] = {
                get: () => this.observer[key],
                set: (val: any) => {
                    this.observer[key] = val
                }
            }
        })
        return computed
    }

    // 将props转成$开头的计算属性
    private createWatch(keys: string[]) {
        const watch: any = {}
        keys.forEach((key: string) => {
            watch[key] = {
                handler(val: any) {
                    console.log(key)
                    this[key] = val
                }
            }
        })
        return watch
    }

    public render(h: CreateElement, dataAST: T, config?: any) {
        this.clearPNodeMAP()
        const keys: string[] = config.props ? Object.keys(config.props) : []
        return h(this.create(keys, dataAST), config)
    }

    protected $emit(eventName: string, ...arg: any[]) {
        this.vm.$emit(eventName, ...arg)
    }

    // 当容器内的节点发生变化，需要清除用不到的
    private clearPNodeMAP() {
        if (!Array.isArray(this.observer.dataAST)) {
            if (this.observer.dataAST.children) {
                this.observer.dataAST.children.forEach((item: PNodeAST) => {
                    if (!this.PNodeMAP.has(item.key)) {
                        this.PNodeMAP.delete(item.key)
                    }
                })
            }
        }
    }
}