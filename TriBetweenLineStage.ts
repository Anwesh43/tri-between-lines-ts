const nodes : number = 5
const lines : number = 2
const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 3
const color : string = "#673AB7"
const backColor : string = "#BDBDBD"

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

const drawParallelLines : Function = (context : CanvasRenderingContext2D, size : number) => {
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
    const xGap : number = (2 * size) / lines
    context.save()
    context.translate(gap * (i + 1), h/2)
    context.rotate(Math.PI/2 * sc2)
    drawParallelLines(context, size/2)
    for (var j = 0; j < lines; j++) {
        const sc = divideScale(sc1, j, lines)
        const sf = 1 - 2 * (j % 2)
        context.save()
        context.translate(-size + j * xGap, sf * size)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(xGap * sc, -sf * size * sc)
        context.stroke()
        context.restore()
    }
    context.stroke()
}

class TriBetweenLineStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : TriBetweenLineStage = new TriBetweenLineStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += updateScale(this.scale, this.dir, lines, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class TBLNode {
    state : State = new State()
    dir : number = 1
    prev : TBLNode
    next : TBLNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new TBLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawTBLNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : TBLNode {
        var curr : TBLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class TriBetweenLine {
    root : TBLNode = new TBLNode(0)
    curr : TBLNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {
    tbl : TriBetweenLine = new TriBetweenLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.tbl.draw(context)
    }

    handleTap(cb : Function) {
        this.tbl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.tbl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
