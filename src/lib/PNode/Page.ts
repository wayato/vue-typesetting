import PNode from "./PNode"
import Utils from "../Utils"
import Container from "./Container"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import { PNodeAST, PageBaseConfig } from "../type"
import type { VNode } from "vue/types/vnode"
import '../../style/page.less'

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

    // 事件集合
    private events: Map<string, (e: unknown) => void> = new Map()

    public setConfig(baseConfig: PageBaseConfig) {
        this.baseConfig = baseConfig
    }

    public setData(dataAst: PNodeAST[]) {
        this.dataAST = dataAst
        this.idChange('', '')
    }

    public setEvent(key: string, event: (e: unknown) => void) {
        this.events.set(key, event)
    }

    private idChange(id: string, comp: string, data?: any, extraData?: any) {
        if (this.currentKey === id) return
        this.currentKey = id
        if (this.events.has('idChange')) {
            this.events.get('idChange')({ id, comp, data: data || null, extraData: extraData || null })
        }
    }

    // 更新数据
    public updateData(id: string, param?: string | PNodeAST) {
        if (typeof param === 'string') {
            this.exchangeAst(id, param)
        } else if (param === undefined) {
            this.deleteAst(id)
        } else {
            this.updateAst(id, param)
        }
        if (this.events.has('update')) {
            this.events.get('update')(JSON.parse(JSON.stringify(this.dataAST)))
        }
    }

    // 找到节点
    public findAst(id: string, fatherChildren: PNodeAST[] = this.dataAST, father?: PNodeAST): FindAst | undefined {
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
            id = Utils.getUuid()
            // page第一层插入元素
            this.dataAST.push({
                ...targetAst,
                id
            })
            this.idChange(id, targetAst.comp, targetAst.data, targetAst.extraData)
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
            Object.assign(findAst.father, sibling)
            delete findAst.father.children
            delete findAst.father.p
            delete findAst.father.dir
        } else {
            this.vue.$delete(findAst.fatherChildren, findAst.index)
        }
        // 如果是删除的选中的节点，清理掉并通知外界
        if (id === this.currentKey) {
            this.idChange('', '')
        } 
    }
    
    protected layout(h: CreateElement): VNode {
        function headerFooter (): VNode {
            return h('div', {
                style: {
                    height: '40px',
                    display: 'flex',
                    border: '1px dashed #E6E6FF'
                }
            }, new Array(3).fill(null).map((_, index: number) => h('div', {
                class: {
                    'vue-typesetting__headerFooter': true
                },
                style: {
                    flex: 1,
                    borderLeft: index === 0 ? 0 : '1px dashed #E6E6FF'
                },
                on: {
                    // TODO 页眉页脚点击事件
                    // click: () => {
                    //     this.currentKey = ''
                    //     if (this.events.has('idChange')) {
                    //         this.events.get('idChange')({
                    //             id: null,
                    //             comp: ''
                    //         })
                    //     }
                    // }
                }
            })))
        }
        return h('div', {
            style: {
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                inset: 0,
                padding: '10px',
                backgroundColor: this.baseConfig?.backgroundColor || '#FFF'
            },
        }, [
            headerFooter.call(this),
            h('div', {
                style: {
                    flex: 1,
                    display: 'flex'
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
                                const ast: PNodeAST = this.findAst(key).ast
                                this.idChange(key, ast.comp, ast.data, ast.extraData)
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
            })),
            headerFooter.call(this)
        ])
    }

    // 放置事件
    public pageDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then((res: PNodeAST) => {
            this.updateData(null, res)
        })
    }
 
    // 移除事件
    public outerDrop(e: DragEvent) {
        Utils.stopBubble(e)
        Utils.getConfig(e).then((res: PNodeAST) => {
            const findAst: FindAst = this.findAst(res.id)
            if (!findAst) return // 将新节点放入删除区域会触发此条件
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