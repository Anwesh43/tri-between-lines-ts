const nodes : number = 5
const lines : number = 2
const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 3

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(0, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) => Math.floor(scale / scDiv)

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}

const updateScale : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawParallelLines : Function = (ctx : CanvasRenderingContext2D, size : number) {
    for (var i = 0; i < 2; i++) {
        const sf : number = 1 - 2 * i
        context.beginPath()
        context.moveTo(-size, -size * sf)
        context.lineTo(-size, -size * sf)
        context.stroke()
    }
}
const drawTBLNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const size : number = gap / (lines + 1)
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const xgap : number = (2 * size) / lines
    context.save()
    context.translate(gap * (i + 1), h/2)
    drawParallelLines(context, size/2)
    for (var j = 0; j < lines; j++) {
        const sf = 1 - 2 * (j % 2)
        context.save()
        context.translate(-size + j * xGap, sf * size)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(xGap, -sf * size)
        context.stroke()
        context.restore()
    }
    context.stroke()
}
