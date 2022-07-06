1. 设置vue
```
    import Typesetting from 'vue-typesetting'
    Typesetting.setVue(this)
```
2. 实例化
```
    const typesetting = new Typesetting({
        fontSize: '16px',
        backgroundColor: 'red',
    }) // page基本配置
    typesetting.setData() // 初始化布局
```
3. 渲染
```
    typesetting.render(document.querySelector('#center'))
```
4. 拖拽进入
```
    <div @dragstart="(e) => {
        Typesetting.setDragData(e, {
            component: component
        })
    }">
```