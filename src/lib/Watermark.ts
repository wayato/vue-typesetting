import Vue from 'vue'

export default Vue.component('typesetting-watermark', {
    props: {
        src: {
            type: String,
            default: ''
        },
        global: {
            type: Object
        }
    },
    render(h) {
        return h('img', {
            domProps: {
                src: this.src + '?' + new Date().getTime(),
                crossOrigin: this.global.isProduction ? 'anonymous' : undefined
            }
        })
    }
})