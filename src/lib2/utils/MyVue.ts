export default class MyVue {
    static version: number | string
    static h: Vue['h']
    static render: Vue['render']
    static reactive: Vue['reactive']

    static init(vue: Vue): void {
        MyVue.version = vue.version
        MyVue.h = MyVue.hToCompatible(vue)
        MyVue.render = MyVue.renderToCompatible(vue)
        MyVue.reactive = MyVue.reactiveToCompatible(vue)
    }

    static hToCompatible(vue: Vue): Vue['h'] {
        return (tag: string, option: VNodeOption, content: string | VNode[]): VNode => {
            if (MyVue.version == 3) {
                const events: { [key: string]: Function } = Reflect.get(option, 'on')
                for (const key in events) {
                    Reflect.set(option, `on${key.slice(0, 1).toUpperCase() + key.slice(1)}`, Reflect.get(events, key))
                }
                Reflect.deleteProperty(option, 'on')
            }
            return vue.h(tag, option, content)
        }
    }

    static renderToCompatible(vue: Vue): Vue['render'] {
        return (getLayout: () => VNode, el: Element): void => {
            if (MyVue.version == 3) {
                vue.render(getLayout).mount(el)
            } else {
                const comClazz = vue.render.extend({
                    render: getLayout
                })
                el.append(new comClazz().$mount().$el)
            }
        }
    }

    static reactiveToCompatible(vue: Vue): Vue['reactive'] {
        return <T> (target: T): Reactive<T> => {
            if (typeof target === 'object') {
                return vue.reactive<T>(target)
            } else {
                return vue.reactive<T>({
                    value: target
                } as any) // 这里不是很懂为什么要any才不报错
            }
        }
    }
}