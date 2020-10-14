import {vec2} from './math'
import Function,* as F from './functions'

declare var Hammer:any

var canvas: HTMLCanvasElement = null
var ctx: CanvasRenderingContext2D = null
var plane: Plane = null
var manager: EquationsManager = null
var functions: {color: string,func: Function}[] = []

class Converter{
    //  (-1,1)------(0,1)------(1,1)
    //     |          |          |
    //  (-1,0)------(0,0)------(1,0)
    //     |          |          |
    //  (-1,-1)-----(0,-1)-----(1,-1)

    //  (0,0)-------(w/2,0)---------(w,0)
    //    |             |             |
    // (0,h/2)------(w/2,h/2)-------(w,h/2)
    //    |             |             |
    //  (0,h)-------(w/2,h)---------(w,h)

    // (bl,tr)--------(c,tr)-------(tr,tr)
    //    |             |             |
    // (bl,c)---------(c,c)--------(tr,c)
    //    |             |             |
    // (bl,bl)--------(c,bl)-------(tr,bl)
    static coords_to_viewport(point: vec2, rect: Rect): vec2{
        const diff = point.sub(rect.center)
        const half_borders = rect.borders.mul(0.5)
        return new vec2(diff.x/half_borders.x, diff.y/half_borders.y)
    }
    static viewport_to_pixel(v: vec2): vec2{
        const translate = new vec2(canvas.width/2,canvas.height/2)
        const shrink = new vec2(v.x * translate.x,-v.y * translate.y)
        return shrink.add(translate)
    }
    static coords_to_pixel(point: vec2, rect: Rect): vec2{
        return Converter.viewport_to_pixel(Converter.coords_to_viewport(point,rect))
    }
    static pixel_to_viewport(pixel: vec2): vec2{
        const translate = new vec2(canvas.width/2,canvas.height/2)
        const shrink = pixel.sub(translate)
        return new vec2(shrink.x / translate.x, - shrink.y / translate.y)
    }
    static viewport_to_coords(v:vec2, rect: Rect): vec2{
        const half_borders = rect.borders.mul(0.5)
        const diff = new vec2(v.x * half_borders.x, v.y * half_borders.y)
        return diff.add(rect.center)
    }
    static pixel_to_coords(pixel: vec2, rect: Rect): vec2{
        return Converter.viewport_to_coords(Converter.pixel_to_viewport(pixel),rect)
    }
    static coords_step_per_pixel(rect: Rect):number{
        const pixel1 = new vec2(1,0)
        const pixel2 = pixel1.add(new vec2(1,0))
        
        const coord1 = Converter.pixel_to_coords(pixel1,rect)
        const coord2 = Converter.pixel_to_coords(pixel2,rect)
        return coord2.sub(coord1).x
    }
}
class Rect{
    bottom_left_corner: vec2
    top_right_corner: vec2

    constructor(bl: vec2, tr: vec2){
        this.bottom_left_corner = bl
        this.top_right_corner = tr
    }
    x_check(x: number):boolean{
        return this.bottom_left_corner.x <= x && x <= this.top_right_corner.x
    }
    y_check(y: number):boolean{
        return this.bottom_left_corner.y <= y && y <= this.top_right_corner.y
    }
    contains(point: vec2):boolean{
        return this.x_check(point.x) && this.y_check(point.y)
    }
    get center():vec2{
        return this.bottom_left_corner.add(this.top_right_corner).mul(0.5)
    }
    get borders():vec2{
        return this.top_right_corner.sub(this.bottom_left_corner)
    }
}
       
class Plane{
    center: vec2 
    zoom: number 
    scale: number
    numbers_per_zoom: number
    visible_region: Rect
    step_divider: number
    grabbed_point: vec2
    center_position_on_grab: vec2
    visible_region_on_grab: Rect
    zoom_sensibility: number

    reset(){
        this.numbers_per_zoom = 8
        this.center = new vec2(0,0)
        this.zoom = 1
        this.zoom_sensibility = 0.94
        this.defineVisibleRegion()
    }
    get_mantix_and_exponent(n: number): {mantix:number,order:number}{
        if(n < 0) return null

        const order = Math.floor(Math.log10(n))
        const mantix = n / (Math.pow(10,order))
        return {mantix,order}
    }
    setScaleByVisibleRegion(){
        const number_range = this.visible_region.borders.x
        const scale = (number_range/6)
        const {mantix,order}= this.get_mantix_and_exponent(scale)
        const orden = Math.pow(10,order)
        const step = 10/3
        const limit = 4.6 - step * (1- canvas.width/1500)
        if(mantix <= limit - step){
            this.step_divider = 5
            this.scale = orden
        }else if(mantix <= limit){
            this.step_divider = 4
            this.scale = 2 * orden
        }else if(mantix <= limit + step){
            this.step_divider = 5
            this.scale = 5 * orden
        }else{
            this.step_divider = 5
            this.scale = 10 * orden 
        }
    }
 
    get aspect():number{
        return canvas.offsetHeight/canvas.offsetWidth
    }
    constructor(){
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        var start_zoom:number = 1
        const zoom_start = ()=>{start_zoom = plane.zoom}
        const zoom = (delta:number,x_center: number, y_center: number, custom_zoom: number=null)=>{ 
            let scale = (delta < 0) ? plane.zoom_sensibility : 1/plane.zoom_sensibility
            plane.zoom *= scale
            if(custom_zoom){
                plane.zoom = start_zoom * (1/custom_zoom) * plane.zoom_sensibility
            }

            const pixel_zoom = new vec2(x_center,y_center)
            const pixel_center = Converter.coords_to_pixel(plane.center,plane.visible_region)
            const diff = pixel_zoom.sub(pixel_center)
            
            plane.center = Converter.pixel_to_coords(pixel_zoom,plane.visible_region)
            plane.defineVisibleRegion()
            // the zoom center coords should occupy the same pixels during the zoom transform
            const pixel_new_center = pixel_center.sub(diff) 
            plane.center = Converter.pixel_to_coords(pixel_new_center,plane.visible_region)

            plane.drawChart()
        }
        const mousewheel = (e: WheelEvent) => {
            zoom(e.deltaY,e.x,e.y)
        }
        const down = (x_center:number,y_center:number)=>{
            if(plane.grabbed_point){
                plane.grabbed_point = null
                return
            }
            plane.grabbed_point = Converter.pixel_to_coords(new vec2(x_center,y_center),plane.visible_region) 
            plane.center_position_on_grab = plane.center
            plane.visible_region_on_grab = plane.visible_region
        }
        const mousedown = (e: MouseEvent) => {
            down(e.x,e.y)
        }
        const move = (x_center:number,y_center:number)=>{
            if(!plane.grabbed_point){
                return
            }
            const grabbed_point_new_position = Converter.pixel_to_coords(new vec2(x_center,y_center),plane.visible_region_on_grab)
            const diff = grabbed_point_new_position.sub(plane.grabbed_point)
            plane.center = plane.center_position_on_grab.sub(diff)

            plane.drawChart()
        }
        const mousemove = (e: MouseEvent) => {
            move(e.x,e.y)
        }
        const mouseup = (e: MouseEvent) => {
            plane.grabbed_point = null
            plane.center_position_on_grab = null
            plane.visible_region_on_grab = null
        }
        //canvas.addEventListener('mousedown',mousedown)
        //canvas.addEventListener('mouseup',mouseup)
        //canvas.addEventListener('mouseout',mouseup)
        canvas.addEventListener('mousewheel',mousewheel)
        //canvas.addEventListener('mousemove',mousemove)
        var mc = new Hammer.Manager(canvas)
        mc.add(new Hammer.Pan())
        mc.add(new Hammer.Pinch())
        mc.on('pinchstart', zoom_start)
        mc.on('pinch', (e:any) => zoom(e.deltaY,e.center.x,e.center.y,e.scale))
        mc.on('panstart',(e:any)=>down(e.center.x,e.center.y))
        mc.on('panmove',(e:any)=>move(e.center.x,e.center.y))
        mc.on('panend',(e:any)=>mouseup(null))
        window.addEventListener('resize', event => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
            plane.drawChart()
        })
        this.reset()
        this.drawChart()
    } 
    drawLabels(color1: string = 'black', color2: string = 'grey', font: string = 'Arial', size: number = 15){
        const nearest_line_point_x = Math.trunc(this.center.x/this.scale) * this.scale
        const nearest_line_point_y = Math.trunc(this.center.y/this.scale) * this.scale

        const offset_x = new vec2(0.5,0).mul(size)
        const offset_y = new vec2(0,-1).mul(size)
        const {order} = this.get_mantix_and_exponent(this.scale)
        const digits = order >= 0 ? 0 : -order
        // horizontal lines
        const pixel_step = Converter.coords_step_per_pixel(this.visible_region)
        const offset_x_axes_visible = this.visible_region.y_check(pixel_step*offset_y.y*2)
        const x_axes_visible = offset_x_axes_visible && this.visible_region.y_check(0)
        
        for(let i = nearest_line_point_x; this.visible_region.x_check(i); i += this.scale){
            if(i === 0)continue
            let center: vec2 = null
            ctx.font = `${size}px ${font}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            if(x_axes_visible){
                ctx.fillStyle = color1
                center = new vec2(i,0)
            }else{
                const y_coord =  nearest_line_point_y > 0 ? this.visible_region.bottom_left_corner.y : this.visible_region.top_right_corner.y
                center = new vec2(i,y_coord)
                ctx.fillStyle = color2
            }
            let pixel_center = Converter.coords_to_pixel(center,this.visible_region)
            // offsets
            if(!x_axes_visible && nearest_line_point_y > 0){
                pixel_center = pixel_center.add(offset_y) 
            }else{
                pixel_center = pixel_center.sub(offset_y)
            }
            ctx.fillText(i.toFixed(digits),pixel_center.x,pixel_center.y)
        }
        for(let i = nearest_line_point_x - this.scale; this.visible_region.x_check(i); i -= this.scale){
            if(i === 0)continue
            let center: vec2 = null
            ctx.font = `${size}px ${font}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            if(x_axes_visible){
                ctx.fillStyle = color1
                center = new vec2(i,0)
            }else{
                const y_coord =  nearest_line_point_y > 0 ? this.visible_region.bottom_left_corner.y : this.visible_region.top_right_corner.y
                center = new vec2(i,y_coord)
                ctx.fillStyle = color2
            }
            let pixel_center = Converter.coords_to_pixel(center,this.visible_region)
            // offsets
            if(!x_axes_visible && nearest_line_point_y > 0){
                pixel_center = pixel_center.add(offset_y) 
            }else{
                pixel_center = pixel_center.sub(offset_y)
            }
            
            ctx.fillText(i.toFixed(digits),pixel_center.x,pixel_center.y)
        }
        // vertical lines
        const offset_y_axes_visible = this.visible_region.x_check(-pixel_step*offset_x.x*4)
        const y_axes_visible = offset_y_axes_visible && this.visible_region.x_check(0)
        for(let i = nearest_line_point_y; this.visible_region.y_check(i); i += this.scale){
            if(i === 0)continue
            let center: vec2 = null
            ctx.font = `${size}px ${font}`
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            if(y_axes_visible){
                ctx.fillStyle = color1
                center = new vec2(0,i)
            }else{
                const x_coord =  nearest_line_point_x > 0 ? this.visible_region.bottom_left_corner.x : this.visible_region.top_right_corner.x
                center = new vec2(x_coord,i)
                ctx.fillStyle = color2
            }
            let pixel_center = Converter.coords_to_pixel(center,this.visible_region)
            // offsets
            if(!y_axes_visible && nearest_line_point_x > 0){
                ctx.textAlign = 'left'
                pixel_center = pixel_center.add(offset_x) 
            }else{
                pixel_center = pixel_center.sub(offset_x)
            }
            ctx.fillText(i.toFixed(digits),pixel_center.x,pixel_center.y)
        }
        for(let i = nearest_line_point_y - this.scale; this.visible_region.y_check(i); i -= this.scale){
            if(i === 0)continue
            let center: vec2 = null
            ctx.font = `${size}px ${font}`
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            if(y_axes_visible){
                ctx.fillStyle = color1
                center = new vec2(0,i)
            }else{
                const x_coord =  nearest_line_point_x > 0 ? this.visible_region.bottom_left_corner.x : this.visible_region.top_right_corner.x
                center = new vec2(x_coord,i)
                ctx.fillStyle = color2
            }
            let pixel_center = Converter.coords_to_pixel(center,this.visible_region)
            // offsets
            if(!y_axes_visible && nearest_line_point_x > 0){
                ctx.textAlign = 'left'
                pixel_center = pixel_center.add(offset_x) 
            }else{
                pixel_center = pixel_center.sub(offset_x)
            }
           
            ctx.fillText(i.toFixed(digits),pixel_center.x,pixel_center.y)
        }
        
    }
    drawAxes(lineWidth: number, color: string = 'black'){
        ctx.strokeStyle = color
        ctx.beginPath()
        if(this.visible_region.x_check(0)){
            const upper_point = new vec2(0,this.visible_region.top_right_corner.y)
            const upper_point_in_pixel = Converter.coords_to_pixel(upper_point,this.visible_region)
            ctx.moveTo(upper_point_in_pixel.x,upper_point_in_pixel.y)
            
            const lower_point = new vec2(0,this.visible_region.bottom_left_corner.y)
            const lower_point_in_pixel = Converter.coords_to_pixel(lower_point,this.visible_region)
            ctx.lineTo(lower_point_in_pixel.x,lower_point_in_pixel.y) 
        }
        if(this.visible_region.y_check(0)){
            const left_point = new vec2(this.visible_region.bottom_left_corner.x,0)
            const left_point_in_pixel = Converter.coords_to_pixel(left_point,this.visible_region)
            ctx.moveTo(left_point_in_pixel.x,left_point_in_pixel.y)
            
            const right_point = new vec2(this.visible_region.top_right_corner.x,0)
            const right_point_in_pixel = Converter.coords_to_pixel(right_point,this.visible_region)
            ctx.lineTo(right_point_in_pixel.x,right_point_in_pixel.y)
        }
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }
    drawGrid(lineWidth: number, step_divider: number, color: string = 'lightgrey'){
        const nearest_line_point_x = Math.trunc(this.center.x/this.scale) * this.scale
        const nearest_line_point_y = Math.trunc(this.center.y/this.scale) * this.scale
        ctx.strokeStyle = color
        ctx.beginPath()
        // vertical lines draw from nearest point to center
        for(let i = nearest_line_point_x; this.visible_region.x_check(i); i+=(this.scale/step_divider)){
            const upper_point = new vec2(i,this.visible_region.top_right_corner.y)
            const upper_point_in_pixel = Converter.coords_to_pixel(upper_point,this.visible_region)
            ctx.moveTo(upper_point_in_pixel.x,upper_point_in_pixel.y)
            
            const lower_point = new vec2(i,this.visible_region.bottom_left_corner.y)
            const lower_point_in_pixel = Converter.coords_to_pixel(lower_point,this.visible_region)
            ctx.lineTo(lower_point_in_pixel.x,lower_point_in_pixel.y)
        }
        for(let i = nearest_line_point_x-(this.scale/step_divider); this.visible_region.x_check(i); i-=(this.scale/step_divider)){
            const upper_point = new vec2(i,this.visible_region.top_right_corner.y)
            const upper_point_in_pixel = Converter.coords_to_pixel(upper_point,this.visible_region)
            ctx.moveTo(upper_point_in_pixel.x,upper_point_in_pixel.y)
            
            const lower_point = new vec2(i,this.visible_region.bottom_left_corner.y)
            const lower_point_in_pixel = Converter.coords_to_pixel(lower_point,this.visible_region)
            ctx.lineTo(lower_point_in_pixel.x,lower_point_in_pixel.y)
        }
        // horizontal lines draw from nearest point to center
        for(let i = nearest_line_point_y; this.visible_region.y_check(i); i+=(this.scale/step_divider)){
            const left_point = new vec2(this.visible_region.bottom_left_corner.x,i)
            const left_point_in_pixel = Converter.coords_to_pixel(left_point,this.visible_region)
            ctx.moveTo(left_point_in_pixel.x,left_point_in_pixel.y)
            
            const right_point = new vec2(this.visible_region.top_right_corner.x,i)
            const right_point_in_pixel = Converter.coords_to_pixel(right_point,this.visible_region)
            ctx.lineTo(right_point_in_pixel.x,right_point_in_pixel.y)
        }
        for(let i = nearest_line_point_y-(this.scale/step_divider); this.visible_region.y_check(i); i-=(this.scale/step_divider)){
            const left_point = new vec2(this.visible_region.bottom_left_corner.x,i)
            const left_point_in_pixel = Converter.coords_to_pixel(left_point,this.visible_region)
            ctx.moveTo(left_point_in_pixel.x,left_point_in_pixel.y)
            
            const right_point = new vec2(this.visible_region.top_right_corner.x,i)
            const right_point_in_pixel = Converter.coords_to_pixel(right_point,this.visible_region)
            ctx.lineTo(right_point_in_pixel.x,right_point_in_pixel.y)
        }
        ctx.lineWidth = lineWidth 
        ctx.stroke()

    }
    defineVisibleRegion(){
        const range_from_center = new vec2(this.zoom * this.numbers_per_zoom,this.zoom * this.numbers_per_zoom * this.aspect)
        this.visible_region = new Rect(this.center.sub(range_from_center), this.center.add(range_from_center))
        this.setScaleByVisibleRegion()
    }
    check_pixel(y:number,pixel: vec2,func: Function,threshold: number){
        let coords = Converter.pixel_to_coords(pixel,this.visible_region)
        if(Number.isNaN(y))return false
        if(Math.abs(y-coords.y) < threshold)
            return true
        else
            return false
    }
    drawFunction(f: Function,color: string,lineWidth: number = 2){
        const begin = this.visible_region.bottom_left_corner.x
        const end = this.visible_region.top_right_corner.x
        const derivate = f.derivate
        ctx.fillStyle = color
        const pixel_step = Converter.coords_step_per_pixel(this.visible_region)
        let step = null
        let previews = true
        let iterations = 0
        const max_iterations = 130000
        for(let x = begin; x <= end; x += step){
            const y = f.calculate(x)
            if(Number.isNaN(y)){
                step = pixel_step
                previews = false
                continue
            }
            if(!previews){
                // get back some values
                let step1 = null
                for(let i = x; i>x-(1*pixel_step);i -= step1){
                    const y = f.calculate(i)
                    if(Number.isNaN(y))break
                        
                    const pixel = Converter.coords_to_pixel(new vec2(i,y),this.visible_region)
                    ctx.fillRect(pixel.x,pixel.y,lineWidth,lineWidth)
                    if(!this.visible_region.y_check(Converter.pixel_to_coords(pixel,this.visible_region).y))
                        break
                    const der = derivate.calculate(i)
                    let step_increment = Math.abs(pixel_step/der)
                    while(x === x+step_increment && step_increment!==0)
                        step_increment *= 8
                    if(Math.abs(der)>1)
                        step1 = step_increment
                    else
                        step1 = pixel_step
                    if(iterations > max_iterations)break
                    iterations++
                }
            }
            const pixel = Converter.coords_to_pixel(new vec2(x,y),this.visible_region)
            previews = true
            if(!this.visible_region.y_check(Converter.pixel_to_coords(pixel,this.visible_region).y)){
                step = pixel_step
                previews = false
                continue
            }

            ctx.fillRect(pixel.x,pixel.y,lineWidth,lineWidth)
            const der = derivate.calculate(x)
            //console.log(pixel.toString(),x,x + Math.abs(pixel_step/der))
            let step_increment = Math.abs(pixel_step/der)
            while(x === x+step_increment && step_increment!==0)
                step_increment *= 8
            if(Math.abs(der)>1)
                step = step_increment 
            else
                step = pixel_step
            if(iterations>max_iterations)break
            iterations++
        }
    }
    drawEquation(f: Function,color: string,lineWidth: number = 2){
        ctx.fillStyle = color
        for(let x=0;x<canvas.width;x++){
            for(let y=0;y<canvas.width;y++){
                const tl = Converter.pixel_to_coords(new vec2(x,y).add(new vec2(-1,-1)),this.visible_region)
                const tr = Converter.pixel_to_coords(new vec2(x,y).add(new vec2(1,-1)),this.visible_region)
                const bl = Converter.pixel_to_coords(new vec2(x,y).add(new vec2(-1,1)),this.visible_region)
                const br = Converter.pixel_to_coords(new vec2(x,y).add(new vec2(1,1)),this.visible_region)
                const tl_f = f.calculate(tl.x)
                const tr_f = f.calculate(tr.x)
                if(Number.isNaN(tl_f) && Number.isNaN(tr_f))continue
                
                const bl_f = f.calculate(bl.x)
                const br_f = f.calculate(br.x)

                if((tl_f-tl.y) * (br_f-br.y) < 0 || (tr_f-tr.y) * (bl_f-bl.y) < 0) {
                    ctx.fillRect(x,y,lineWidth,lineWidth)
                }
            }
        }
    }
    drawChart(){
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        this.defineVisibleRegion()
        this.drawGrid(1,this.step_divider)
        this.drawGrid(2,1)
        this.drawAxes(2)
        for(const func of functions){
            this.drawFunction(func.func,func.color)
            //this.drawEquation(func.func,func.color)
        }
        this.drawLabels()
    }
}
class EquationsManager{
    
    error_messages: string[]
    private parse_func(str:string,functions:Function[]):Function{ 
        const known_functions = [
            {t:'sqrt',f:F.Sqrt},
            {t:'asin',f:F.Asin},
            {t:'acos',f:F.Acos},
            {t:'atan',f:F.Atan},
            {t:'sinh',f:F.Sinh},
            {t:'cosh',f:F.Cosh},
            {t:'tanh',f:F.Tanh},
            {t:'sin',f:F.Sin},
            {t:'cos',f:F.Cos},
            {t:'tan',f:F.Tan},
            {t:'exp',f:F.Exp},
            {t:'log',f:F.Log},
            {t:'abs',f:F.Abs},
            {t:'d',f:F.Der}
        ]
        const pow_functions: Function[] = []

        for(const p of str.split('^')){
            let f: Function = null

            for(const k of known_functions){
                const reg_str = `^${k.t}(\\(\\)|x|\d+)$`
                const reg = new RegExp(reg_str,'g')
                const arr = reg.exec(p)
                if(arr===null)continue
                let arg = null
                if(arr[1] ==='x') arg = new F.Variable()
                else if(!Number.isNaN(Number(arr[1]))) arg = new F.Costant(parseInt(arr[1]))
                else arg = functions.shift()
                f = new k.f(arg)
            }

            if(f===null){
                if(p==='x')f = new F.Variable()
                else if(!Number.isNaN(Number(p))){
                    f = new F.Costant(Number(p))
                }else if(p==='()')f = functions.shift()
            }

            if(f===null)throw new Error('undefined ' + p) 
            pow_functions.push(f)
        }
        if(pow_functions.length===1)return pow_functions[0]
        let base = pow_functions[0]
        for(let i=1;i<pow_functions.length;i++){
            base = new F.Pow(base,pow_functions[i])
        }
        return base
    }
    private parse_monome(str:string,functions:Function[]):Function{
        const factors = str.split('*')
        const factors_functions: Function[] = []
        for(const factor of factors){
            if(factor==='') throw new Error('empty value')
            const factors2 = factor.split('/')
            const factors2_functions: Function[] = []
            for(const factor2 of factors2){
                if(factor2==='') throw new Error('empty value')
                     
                const f = this.parse_func(factor2,functions)
                factors2_functions.push(f)
            }
            if(factors2_functions.length===1) factors_functions.push(factors2_functions[0])
            else factors_functions.push(new F.Divide(...factors2_functions))
        }
        if(factors_functions.length===1)return factors_functions[0]
        return new F.Multiply(...factors_functions)
    }
    private retrive_function(str:string,functions:Function[]):Function{
         
        if(str==='')throw new Error('empty value')

        const monomes = str.split('+')
        const monomes_functions: Function[] = []
        for(let i=0;i<monomes.length;i++){
            const m = monomes[i]
            if(m==='')
            if(i===0)continue 
            else throw new Error('empty value')
            const monomes2 = m.split('-')
            const monomes2_functions: Function[] = []
            let subtract = false
            for(let x=0;x<monomes2.length;x++){
                const m2 = monomes2[x]
                if(m2==='')
                if(x===0){
                    subtract = true
                    continue
                }else throw new Error('empty value')
                let f = this.parse_monome(m2,functions)
                if(subtract){
                    subtract = false
                    f = new F.Negative(f)
                }
                monomes2_functions.push(f) 
            }
            if(monomes2_functions.length===1){
                monomes_functions.push(monomes2_functions[0])
            }else{
                monomes_functions.push(new F.Sub(...monomes2_functions))
            }
        }
        if(monomes_functions.length===1){
            //console.log(monomes_functions[0].text)
            return monomes_functions[0]
        }else{
            return new F.Add(...monomes_functions)
        }


    }
    private parse_block(str:string):Function{
        // virtual outer block
        const function_in_block: {index:number,functions:Function[]}[] = []
        function_in_block.push({index:-1,functions:[]})

        const str_arr = str.split('')
        for(let i=0; i< str_arr.length; i++){
            const c = str[i]
            if(c==='('){
                function_in_block.push({index:i,functions:[]})
            }
            else if(c===')'){
                if(function_in_block.length === 1)
                    throw new Error('missing opening (')
                const last_in_stack = function_in_block.pop() 
                const block = str_arr.join('').slice(last_in_stack.index+1,i).split(' ').join('')
                const f = this.retrive_function(block,last_in_stack.functions)
                function_in_block[function_in_block.length-1].functions.push(f)  
                // replace parentheses with white spaces
                for(let x=last_in_stack.index+1;x<i;x++){
                    str_arr[x] = ' '
                }
            }
        }
        if(function_in_block.length===1){
            const block = str_arr.join('').split(' ').join('')
            const fs = function_in_block.pop().functions
            return this.retrive_function(block,fs)
        }else{
            throw new Error('missing closing )')
        }
    }
    parse(str: string):Function{
        try{
            const f = this.parse_block(str)
            this.error_messages.push(null)
            return f
        }catch(e){
            this.error_messages.push(e.toString())
            return null
        }
    }
    constructor(){

        window.addEventListener('message', (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            try{
                let answer : {error_messages?:string[],zoom?:number,center?:vec2} = {}
                if(data.center)
                    plane.center = new vec2(data.center[0],data.center[1])
                if(data.zoom && data.zoom > 0)
                    plane.zoom = data.zoom
                if(data.functions){
                    functions = []
                    this.error_messages = []
                    for(const func_obj of data.functions){
                        const func = manager.parse(func_obj.expression.toLowerCase()) 
                        if(func)functions.push({color: func_obj.color,func})
                    }
                    answer.error_messages = this.error_messages
                }
                if(data.get_center_and_zoom !== undefined && data.get_center_and_zoom){
                   answer.zoom = plane.zoom
                   answer.center = plane.center 
                }
                plane.drawChart()

                window.parent.postMessage(JSON.stringify(answer),'*')
            }catch(e){
                console.log(e)      
            }
        })
    }
}

window.addEventListener('load', event => {
    canvas = <HTMLCanvasElement> document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    manager = new EquationsManager()
    plane = new Plane()
})
