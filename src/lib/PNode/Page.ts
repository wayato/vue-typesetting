import PNode from "./PNode"
import Utils from "../Utils"
import Container from "./Container"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"
import Vue from 'vue'

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
     * @param targetAst 更新进去的数据
     * @param originAsts 节点列表
     * @returns 返回true代表已经找到需要更新的节点
     */
    private updateData(key: string, targetAst: PNodeAST, originAsts: PNodeAST[] = this.dataAST): boolean {
        for (let i: number = 0; i < originAsts.length; i++) {
            if (originAsts[i].key === key) {
                this.vue.$set(originAsts, i, targetAst)
                console.log((JSON.stringify(this.dataAST)))
                return true
            } else if (originAsts[i].children) {
                if (this.updateData(key, targetAst, originAsts[i].children)) return true
            }
        }
    }
    
    protected layout(h: CreateElement) {
        const params = {
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
        return h('div', {
            style: {
                position: 'absolute',
                display: 'flex',
                inset: 0
            },
            on: {
                dragover: Utils.stopBubble,
                drop: this.drop.bind(this)
            }
        }, this.dataAST.map((childAst: PNodeAST) => {
            if (childAst.component) {
                return new Leaf(childAst).render(h, params)
            } else {
                return new Container(childAst).render(h, params)
            }
        }))
    }

    // 降落事件
    drop(e: DragEvent) {
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
}