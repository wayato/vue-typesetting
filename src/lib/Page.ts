import type { VNode } from 'vue'
import Vue from 'vue'
import { PNode } from './PNode'
import Utils from './Utils'
export class Page {

    // 基本配置
    private baseConfig: PageBaseConfig

    // PNode抽象语法树数据
    private dataAST: PNodeAST[] = []

    constructor(config: PageBaseConfig) {
        this.baseConfig = config
    }

    // 设置页面基本配置
    public setConfig(config: PageBaseConfig) {
        this.baseConfig = Object.assign(this.baseConfig, config)
    }

    // 注入抽象语法树数据
    public setData(data: PNodeAST[]) {
        this.dataAST = data
    }

    // 渲染
    public render($el: HTMLElement) {
        $el.style.position = 'relative' // 保证是相对定位
        const _this = this
        const ComponentCtr = Vue.extend({
            render(h): VNode {
                return h('div', {
                    style: {
                        position: 'absolute',
                        display: 'flex',
                        inset: 0
                    },
                    on: {
                        dragover: (e: DragEvent) => {
                            Utils.stopBubble(e)
                        },
                        drop: (e: DragEvent) => {
                            Utils.stopBubble(e)
                            Utils.getConfig(e).then(res => {
                                _this.setData([
                                    {
                                        key: Utils.getUuid(),
                                        component: res.component
                                    }
                                ])
                                console.log((JSON.stringify(this.page.dataAST)))
                            })
                        },
                        click: () => {
                            // console.log(this)
                            this.page.dataAST = JSON.parse('[{"key":"733f785c-2c01-4b60-be41-eda836539fce","direction":"column","proportion":0.5,"children":[{"key":"520a5cf9-d80f-463b-939c-3569c905f8a5","direction":"row","proportion":0.5,"children":[{"key":"c1b63014-8d32-4444-8d42-e09bf26e2f97","direction":"row","proportion":0.5,"children":[{"key":"29fc0d43-202b-416d-b5e0-d5861d1d1fec","direction":"row","proportion":0.5,"children":[{"key":"7c3c5a96-c825-4173-b356-296ad60eb3b4","direction":"column","proportion":0.5,"children":[{"key":"311f609e-c178-4076-8a93-adb9f8d49a50","component":"comp5"},{"key":"59077b8f-e11f-4090-8b6c-b2381039c8f9","component":"comp4"}]},{"key":"36c0f5a2-a877-4926-8a2c-7efb6875989f","component":"comp1"}]},{"key":"f12675e4-07d2-4d8c-ac0e-c1ec7ab7780b","direction":"column","proportion":0.5,"children":[{"key":"f7eb2b48-aedd-4068-b976-15a6cefae03c","component":"comp2"},{"key":"10821d34-516f-4115-96de-89b50fe8defd","component":"comp5"}]}]},{"key":"4eaa2ee4-0d62-479e-b2ec-078716c44aaf","direction":"column","proportion":0.5,"children":[{"key":"865ed5f5-f745-4448-b8c9-af12d719814d","component":"comp1"},{"key":"e4eff1b4-d991-413f-85fc-b172d904832d","direction":"row","proportion":0.5,"children":[{"key":"06aeadd8-294a-4cac-a855-420961fe11c2","component":"comp3"},{"key":"88f2f10b-4daf-495e-93af-c47b94ed6683","component":"comp2"}]}]}]},{"key":"b4e721cf-9b2a-4bb2-a7de-ece44d381039","direction":"column","proportion":0.5,"children":[{"key":"b4b71bce-d94a-40b1-a52b-5f49217c8ef1","direction":"row","proportion":0.5,"children":[{"key":"12ae0036-91fc-440b-a35a-8af74b063f0e","component":"comp3"},{"key":"2fcc2faf-bb9c-4325-9c12-982d5a103872","direction":"column","proportion":0.5,"children":[{"key":"3234f9f2-8808-4447-a6ea-5f2997568b82","component":"comp1"},{"key":"385d54a0-e902-4d5b-bcec-570b14f18304","direction":"row","proportion":0.5,"children":[{"key":"677b2188-6566-4ec5-8073-2adcaa148296","component":"comp2"},{"key":"5c21af93-1d2b-413a-8f51-b998cfc17272","component":"comp3"}]}]}]},{"key":"0eb36897-8003-4b38-80d3-5a02326b250b","direction":"row","proportion":0.5,"children":[{"key":"a9540a1c-68d1-4463-850f-772f864f8bc2","direction":"column","proportion":0.5,"children":[{"key":"b935aaab-a542-4faf-9e75-e85fee581cc5","component":"comp4"},{"key":"bd38d7f2-c862-4e6e-8872-caf2c83f6f3e","component":"comp3"}]},{"key":"7fc54f51-6c3d-4caf-bde2-71f1ae04b463","direction":"row","proportion":0.5,"children":[{"key":"4d581969-bc55-4e5b-bbb2-957eb429f9d1","component":"comp5"},{"key":"7a18ff78-b0e4-4b35-a06b-3cdccc1f91da","component":"comp1"}]}]}]}]}]')
                        }
                    }
                }, this.page.dataAST.map((ast: PNodeAST) => h(new PNode(ast).getComponent(), {
                    props: {
                        updateData: this.updateData,
                        operateCurrentKey: this.operateCurrentKey,
                        operateInnerDraging: this.operateInnerDraging
                    },
                    key: ast.key
                })))
            }
        })
        $el.append(new ComponentCtr({
            data: {
                page: this,
                currentKey: '', // 当前选中的key
                innerDraging: false // 当前是否在进行内部拖拽
            },
            methods: {
                /**
                 * 更新page的dataAST
                 * @param key 需要替换的数据key
                 * @param targetAst 更新进去的数据
                 * @param originAsts 节点列表
                 */
                updateData(key: string, targetAst: PNodeAST, originAsts: PNodeAST[] = this.page.dataAST) {
                    for (let i: number = 0; i < originAsts.length; i++) {
                        if (originAsts[i].key === key) {
                            this.$set(originAsts, i, targetAst)
                            console.log((JSON.stringify(this.page.dataAST)))
                            break
                        } else if (originAsts[i].children) {
                            this.updateData(key, targetAst, originAsts[i].children)
                        }
                    }
                },
                // 获取或设置当前选中的key
                operateCurrentKey(key?: string): string | void {
                    if (key) {
                        this.currentKey = key
                    } else {
                        return this.currentKey
                    }
                },
                // 获取或设置内部正在拖拽的状态
                operateInnerDraging(status?: boolean): boolean | void {
                    if (typeof status === 'boolean') {
                        this.innerDraging = status
                    } else {
                        return this.innerDraging
                    }
                }
            }
        }).$mount().$el)
    }
}