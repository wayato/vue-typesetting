type UnMyType<T> = {
    -readonly [P in keyof T]: T[P]
}
