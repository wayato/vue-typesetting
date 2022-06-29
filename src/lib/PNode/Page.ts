import PNode from "./PNode"
import Utils from "../Utils"
import Container from "./Container"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import { PNodeAST, PageBaseConfig } from "../type"

/**
 * 页面
 */
export default class Page extends PNode<PNodeAST[]> {

    // 基本配置
    private baseConfig: PageBaseConfig

    // 是否正在内部拖拽
    // 该状态为true的情况下，需要通知到所有后代节点，显示相应的样式
    private isDragInner: boolean = false

    // 当前选中的key
    private currentKey: string = ''

    public setConfig(baseConfig: PageBaseConfig) {
        this.baseConfig = baseConfig
    }

    public setData(dataAst: PNodeAST[]) {
        this.dataAST = dataAst
    }
    
    /**
     * 更新dataAST
     * @param key 需要替换的数据key
     * @param targetAst 更新进去的数据,如果为空，则删除这个节点
     * @param originAsts 节点列表
     * @returns 返回true代表已经找到需要更新的节点
     */
    private updateData(key: string, targetAst: PNodeAST = null, originAsts: PNodeAST[] = this.dataAST, fatherAsts?: PNodeAST[], index?: number): boolean {

        for (let i: number = 0; i < originAsts.length; i++) {
            if (originAsts[i].key === key) {
                if (targetAst) {
                    this.vue.$set(originAsts, i, targetAst)
                } else {
                    this.vue.$delete(originAsts, i)
                    if (originAsts.length === 1) {
                        this.vue.$set(fatherAsts, index, originAsts[0])
                        console.log(fatherAsts)
                    }
                }
                console.log((JSON.stringify(this.dataAST)))
                return true
            } else if (originAsts[i].children) {
                if (this.updateData(key, targetAst, originAsts[i].children, originAsts, i)) return true
            }
        }
    }
    
    protected layout(h: CreateElement) {
        return h('div', {
            style: {
                position: 'absolute',
                display: 'flex',
                inset: 0
            },
            on: {
                dragover: Utils.stopBubble,
                drop: this.pageDrop.bind(this)
            }
        }, this.dataAST.map((childAst: PNodeAST) => {
            const params = {
                key: childAst.key,
                props: {
                    // 获取或设置当前选中的key
                    pageCurrentKey: (key?: string): string | void =>  {
                        if (key) {
                            this.currentKey = key
                        } else {
                            return this.currentKey
                        }
                    },
                    // 获取或设置内部正在拖拽的状态
                    pageInnerDraging: (status?: boolean): boolean | void => {
                        if (typeof status === 'boolean') {
                            this.isDragInner = status
                        } else {
                            return this.isDragInner
                        }
                    }
                },
                on: {
                    updateData: this.updateData.bind(this)
                }
            }
            if (childAst.component) {
                return new Leaf(childAst).render(h, params)
            } else {
                return new Container(childAst).render(h, params)
            }
        }))
    }

    // 放置事件
    public pageDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then(res => {
            this.setData([
                {
                    key: Utils.getUuid(),
                    component: res.component
                }
            ])
        })
    }

    // 移除事件
    public outerDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then(res => {
            this.updateData(res.key)
        })
    }
}