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
     */
     private updateData(key: string, targetAst: PNodeAST, originAsts: PNodeAST[] = this.dataAST) {
        for (let i: number = 0; i < originAsts.length; i++) {
            if (originAsts[i].key === key) {
                this.vue.$set(originAsts, i, targetAst)
                console.log((JSON.stringify(this.dataAST)))
                break
            } else if (originAsts[i].children) {
                this.updateData(key, targetAst, originAsts[i].children)
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
                dragover: (e: DragEvent) => Utils.stopBubble(e),
                drop: (e: DragEvent) => {
                    Utils.stopBubble(e)
                    this.drop(e)
                }
            }
        }, this.dataAST.map((childAst: PNodeAST) => {
            if (childAst.component) {
                return h(new Leaf(childAst).create(), {
                    on: {
                        updateData: this.updateData.bind(this)
                    }
                })
            } else {
                return h(new Container(childAst).create(), {
                    on: {
                        updateData: this.updateData.bind(this)
                    }
                })
            }
        }))
    }

    // 降落事件
    drop(e: DragEvent) {
        Utils.getConfig(e).then(res => {
            // _this.setData([
            //     {
            //         key: Utils.getUuid(),
            //         component: res.component
            //     }
            // ])
        })
    }
}