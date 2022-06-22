import type { Component, AsyncComponent, VNode } from 'vue'
import Vue from 'vue'
import { PNode } from './PNode'




export class Page {
    // 基本配置
    private baseConfig: PageBaseConfig

    // vue实例中已注册组件的仓库
    private vueComponents: VueComponents

    // PNode抽象语法树数据
    private dataAST: PNodeAST[]

    constructor(config: PageBaseConfig, vueComponents: VueComponents) {
        this.baseConfig = config
        this.vueComponents = vueComponents
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
        const ComponentCtr = Vue.extend({
            render(h): VNode {
                return h('div', {
                    style: {
                        position: 'absolute',
                        inset: 0
                    },
                    on: {
                        click: () => {
                            // console.log(this)
                            this.page.dataAST = JSON.parse('[{"key":"1","direction":"row","children":[{"key":"3ef66f55-b230-410a-b622-8370a8e3ff21","direction":"column","children":[{"key":"4cc3049b-54ef-4fe8-98bb-1fd367656a7c","direction":"row","children":[{"key":"e9b506b7-253a-4a02-9925-319c529d67ac","direction":"column","children":[{"key":"415ca153-289e-4f80-96d3-3e29c0b04798","direction":"row","children":[{"key":"0518722e-2cbe-4bb6-9b4f-2a095e4c14b9","direction":"row","children":[{"key":"103a4365-2e33-4b79-81dc-259808ae2e62","component":"comp1"},{"key":"22d29280-b0db-438a-886b-ebdcdd3f8c19","direction":"column","children":[{"key":"4d61c87f-506f-4b27-a42d-4ec905d64aac","component":"comp1"},{"key":"d31ad8f7-6192-47fa-8d5e-c6336028b1f9","component":"comp2"}]}]},{"key":"aa5b69a7-e264-4edf-b52d-a3addb60daf9","component":"comp3"}]},{"key":"ff859f31-0f93-4632-a064-2819ea86eee0","direction":"row","children":[{"key":"afa455f6-6a59-4ff7-a8b4-7040caab2fc0","component":"comp1"},{"key":"bd020d71-b632-49a2-9256-556384d7acd6","component":"comp3"}]}]},{"key":"737964f5-a156-47a8-b6d5-57dc8453f966","direction":"column","children":[{"key":"8512fcb4-d37e-4525-9242-3806d5589666","component":"comp2"},{"key":"a6561078-f753-4132-a7d7-d812af024ef2","component":"comp4"}]}]},{"key":"21deb1e1-0f20-4057-9893-31f2d5fdab79","direction":"column","children":[{"key":"876ca34f-ffb7-4603-8689-a03782dce4bb","direction":"row","children":[{"key":"8980be80-8017-4f26-a2a7-fc096a5a45b8","direction":"row","children":[{"key":"0f29ee81-c816-4926-97be-69deecf11426","component":"comp3"},{"key":"1b573260-b330-49df-b780-ee598e4f8914","component":"comp1"}]},{"key":"efef65c1-d550-4773-b898-f192ced8ae02","direction":"column","children":[{"key":"85693aa4-6da8-47d0-8860-c13d0e65aeda","direction":"column","children":[{"key":"8b23d4c0-a3ce-485d-8a8d-b865b2822de2","component":"comp5"},{"key":"8faf362e-2ca7-4c75-8c34-61f4790f66cb","component":"comp4"}]},{"key":"d92c6fda-04d0-424d-a1fb-45ba091cf629","component":"comp4"}]}]},{"key":"2e777890-2702-4bf6-81be-9e968aa5bffb","direction":"column","children":[{"key":"60599a29-0466-4e92-860c-0a5e3f915fa7","component":"comp1"},{"key":"bafa92c6-0418-46ff-a664-7584607a90e5","direction":"row","children":[{"key":"d1d6a1f0-a647-4e6e-9614-8d1f4d0bf1b6","component":"comp4"},{"key":"76133c51-7530-4e48-98e6-80b28034ddb8","component":"comp5"}]}]}]}]}]}]')
                        }
                    }
                }, this.page.dataAST.map((ast: PNodeAST) => h(new PNode(ast, this.page.vueComponents).getComponent(), {
                    props: {
                        updateData: this.updateData,
                        dataAST: ast
                    },
                    key: ast.key
                })))
            }
        })
        $el.append(new ComponentCtr({
            data: {
                page: this
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
                }
            }
        }).$mount().$el)
    }
}

export type VueComponents = {
    [key: string]: Component<any, any, any, any> | AsyncComponent<any, any, any, any>
}