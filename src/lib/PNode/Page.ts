import PNode from "./PNode"
import Utils from "../Utils"
import Container from "./Container"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import { PNodeAST, PageBaseConfig } from "../type"
import type { VNode } from "vue/types/vnode"
import '../../style/page.less'
import Line from "./Line"
import Typesetting from "../Typesetting"

/**
 * 页面
 */
export default class Page extends PNode<PNodeAST[]> {

    public typesetting: Typesetting

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
        this.keyChange('', '')
    }

    public setEvent(key: string, event: (e: unknown) => void) {
        this.events.set(key, event)
    }

    private keyChange(key: string, comp: string, data?: any, extraData?: any) {
        if (this.currentKey === key) return
        this.currentKey = key
        if (this.events.has('keyChange')) {
            this.events.get('keyChange')({ key, comp, data: data || null, extraData: extraData || null })
        }
    }

    // 更新数据
    public updateData(key: string, param?: string | PNodeAST) {
        if (typeof param === 'string') {
            this.exchangeAst(key, param)
        } else if (param === undefined) {
            this.deleteAst(key)
        } else {
            this.updateAst(key, param)
        }
        if (this.events.has('update')) {
            this.events.get('update')(JSON.parse(JSON.stringify(this.dataAST)))
        }
    }

    // 找到节点
    public findAst(key: string, fatherChildren: PNodeAST[] = this.dataAST, father?: PNodeAST): FindAst | undefined {
        for (let i: number = 0; i < fatherChildren.length; i++) {
            if (fatherChildren[i].key === key) {
                return {
                    ast: fatherChildren[i],
                    fatherChildren,
                    father,
                    index: i
                }
            } else {
                if (fatherChildren[i].children) {
                    const result: FindAst | undefined = this.findAst(key, fatherChildren[i].children, fatherChildren[i])
                    if (result) return result
                }
            }
        }
    }

    // 找到key的节点，把更改后的数据更新进去
    private updateAst(key: string, targetAst: PNodeAST) {
        if (key === null) {
            key = Utils.getUuid()
            // page第一层插入元素
            this.dataAST.push({
                ...targetAst,
                key
            })
            this.keyChange(key, targetAst.comp, targetAst.data, targetAst.extraData)
            return
        }
        const findAst: FindAst = this.findAst(key)
        this.vue.$set(findAst.fatherChildren, findAst.index, targetAst)
    }

    // 交换两个节点
    private exchangeAst(key1: string, key2: string) {
        const findAst1: FindAst = this.findAst(key1)
        const findAst2: FindAst = this.findAst(key2)
        this.vue.$set(findAst1.fatherChildren, findAst1.index, findAst2.ast)
        this.vue.$set(findAst2.fatherChildren, findAst2.index, findAst1.ast)
    }

    // 将id节点的父节点更改为key节点的兄弟节点
    private deleteAst(key: string) {
        const findAst: FindAst = this.findAst(key)
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
        if (key === this.currentKey) {
            this.keyChange('', '')
        } 
    }
    
    protected layout(h: CreateElement): VNode {
        function headerFooter (type: 'header' | 'footer'): VNode {
            const height: string = (type === 'header' ? this.baseConfig?.headerHeight : this.baseConfig?.footerHeight) || 0
            const heightIs0: boolean = /^0/.test(height.toString())
            return h('div', {
                style: {
                    height,
                    display: 'flex',
                    // border: heightIs0 ? 0 : '1px dashed #E6E6FF',
                    boxSizing: 'border-box'
                }
            }, new Array(3).fill(null).map((_, index: number) => {
                const selectSelf: boolean = this.currentKey === `${type}-${index}`
                return h('div', {
                    class: {
                        'vue-typesetting__headerFooter': true
                    },
                    style: {
                        flex: 1,
                        borderStyle: selectSelf ? 'solid' : 'dashed',
                        borderColor: selectSelf ? Line.color : '#E6E6FF',
                        borderWidth: heightIs0 ? 0 : (selectSelf ? '2px' : '1px'),
                    },
                    on: {
                        click: (e: Event) => {
                            Utils.stopBubble(e)
                            this.keyChange(`${type}-${index}`, type)
                        }
                    }
                })
            }))
        }
        return h('div', {
            style: {
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                inset: 0,
                paddingLeft: this.baseConfig?.paddingLeft || '10px',
                paddingRight: this.baseConfig?.paddingRight || '10px',
                paddingTop: this.baseConfig?.paddingTop || '10px',
                paddingBottom: this.baseConfig?.paddingBottom || '10px',
                backgroundColor: this.baseConfig?.backgroundColor || '#FFF'
            },
            on: {
                click: () => this.keyChange('', '')
            }
        }, [
            headerFooter.call(this, 'header'),
            h('div', {
                style: {
                    flex: 1,
                    display: 'flex'
                },
                on: {
                    dragover: Utils.stopBubble,
                    drop: this.pageDrop.bind(this)
                }
            }, this.dataAST.length === 0 ? [
                h('div', {
                    style: {
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }
                }, '可拖曳组件至此区域，如删除组件需拖曳组件脱离此区域')
            ] : this.dataAST.map((childAst: PNodeAST) => {
                const params = {
                    key: childAst.key,
                    props: {
                        // 获取或设置当前选中的key
                        pageCurrentKey: (key?: string): string | void =>  {
                            if (key) {
                                const ast: PNodeAST = this.findAst(key).ast
                                this.keyChange(key, ast.comp, ast.data, ast.extraData)
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
                if (!this.PNodeMAP.get(childAst.key)) {
                    if (childAst.comp) {
                        this.PNodeMAP.set(childAst.key, new Leaf())
                    } else {
                        this.PNodeMAP.set(childAst.key, new Container())
                    }
                }
                return this.PNodeMAP.get(childAst.key).render(h, childAst, params)
            })),
            headerFooter.call(this, 'footer')
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
            const findAst: FindAst = this.findAst(res.key)
            if (!findAst) return // 将新节点放入删除区域会触发此条件
            this.updateData(res.key)
        })
    }
}

type FindAst = {
    ast: PNodeAST,
    fatherChildren: PNodeAST[],
    father?: PNodeAST,
    index: number
}