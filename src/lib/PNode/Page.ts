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
    public currentKey: string = ''

    public setConfig(baseConfig: PageBaseConfig) {
        this.baseConfig = baseConfig
    }

    public setData(dataAst: PNodeAST[]) {
        this.dataAST = dataAst
    }

    // 更新数据
    private updateData(id: string, param?: string | PNodeAST) {
        if (typeof param === 'string') {
            this.exchangeAst(id, param)
        } else if (param === undefined) {
            this.deleteAst(id)
        } else {
            this.updateAst(id, param)
        }
        console.log(JSON.stringify(this.dataAST))
    }

    // 找到节点
    private findAst(id: string, fatherChildren: PNodeAST[] = this.dataAST, father?: PNodeAST): FindAst | undefined {
        for (let i: number = 0; i < fatherChildren.length; i++) {
            if (fatherChildren[i].id === id) {
                return {
                    ast: fatherChildren[i],
                    fatherChildren,
                    father,
                    index: i
                }
            } else {
                if (fatherChildren[i].children) {
                    const result: FindAst | undefined = this.findAst(id, fatherChildren[i].children, fatherChildren[i])
                    if (result) return result
                }
            }
        }
    }

    // 找到id的节点，把更改后的数据更新进去
    private updateAst(id: string, targetAst: PNodeAST) {
        if (id === null) {
            // page第一层插入元素
            this.dataAST.push({
                ...targetAst,
                id: Utils.getUuid()
            })
            return
        }
        const findAst: FindAst = this.findAst(id)
        this.vue.$set(findAst.fatherChildren, findAst.index, targetAst)
    }

    // 交换两个节点
    private exchangeAst(id1: string, id2: string) {
        const findAst1: FindAst = this.findAst(id1)
        const findAst2: FindAst = this.findAst(id2)
        this.vue.$set(findAst1.fatherChildren, findAst1.index, findAst2.ast)
        this.vue.$set(findAst2.fatherChildren, findAst2.index, findAst1.ast)
    }

    // 将id节点的父节点更改为id节点的兄弟节点
    private deleteAst(id: string) {
        const findAst: FindAst = this.findAst(id)
        if (findAst.father) {
            // fatherChildren只有两个元素，!findAst.index非0即1，非1即0，便是其兄弟节点
            const sibling: PNodeAST = findAst.fatherChildren[Number(!findAst.index)]
            findAst.father.children = undefined
            findAst.father.p = undefined
            findAst.father.dir = undefined
            findAst.father.comp = sibling.comp
            findAst.father.id = sibling.id
        } else {
            this.vue.$delete(findAst.fatherChildren, findAst.index)
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
                key: childAst.id,
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
            if (!this.PNodeMAP.get(childAst.id)) {
                if (childAst.comp) {
                    this.PNodeMAP.set(childAst.id, new Leaf())
                } else {
                    this.PNodeMAP.set(childAst.id, new Container())
                }
            }
            return this.PNodeMAP.get(childAst.id).render(h, childAst, params)
        }))
    }

    // 放置事件
    public pageDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then((res: PNodeAST) => {
            this.updateAst(null, res)
        })
    }
 
    // 移除事件
    public outerDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then((res: PNodeAST) => {
            this.updateData(res.id)
        })
    }
}

type FindAst = {
    ast: PNodeAST,
    fatherChildren: PNodeAST[],
    father?: PNodeAST,
    index: number
}