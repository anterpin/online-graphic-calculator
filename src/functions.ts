
export default interface Function{
    calculate:(x: number)=>number
    derivate:Function
    text: string
}

export class Costant implements Function{
    value: number
    constructor(value: number){
        this.value = value
    }
    calculate(x:number){
        return this.value
    }
    get derivate(){
        return new Costant(0)
    }
    get text(){
        return this.value.toString()
    }
}
export class Multiply implements Function{
    f: Function[]
    constructor(...f:Function[]){
        if(f.length<=1)throw new Error('multiply costructor arg length ' + f.length)
        f.filter(f=>!(f instanceof Costant && f.value===1))

        for(const _f of f){
            if(_f instanceof Costant && _f.value===0){
                    this.f = [new Costant(0)]
                    return
            }
        }
        this.f = f
    }
    calculate(x:number){
        let sum = 1
        for(const f of this.f){
            const res = f.calculate(x)
            if((Number.isNaN(res) && sum===0) || (Number.isNaN(sum) && res===0)){
                sum = 0
                continue
            }
            sum *= f.calculate(x)
        }
        return sum
    }
    get derivate(){
        let func = this.f[0]
        for(let i = 1; i < this.f.length; i++){
            func = new Add(new Multiply(func.derivate,this.f[i]),new Multiply(func,this.f[i].derivate))
        }
        return func
    }
    get text(){
        let text = ''
        for(const f of this.f)text += `(${f.text})`
        return text
    }
}
export class Abs implements Function{
    a: Function
    constructor(a: Function){
        this.a = a
    }
    calculate(x:number){
        return Math.abs(this.a.calculate(x))
    }
    get derivate():Function{
        return new Abs(this.a.derivate)
        return new Multiply(new Divide(new Variable(),new Abs(new Variable())),this.a.derivate)
    }
    get text(){
        return `|${this.a.text}|`
    }
}
export class Divide implements Function{
    f: Function[]
    constructor(...f:Function[]){
        if(f.length<=1)throw new Error('divide costructor arg length ' + f.length)
        this.f = f
    }
    calculate(x:number){
        let sum = this.f[0].calculate(x)
        for(let i=1;i<this.f.length;i++){
            const res = this.f[i].calculate(x)
            if((Number.isNaN(res) && sum===0) || (Number.isNaN(sum) && res===0)){
                sum = 0
                continue
            }
            sum /= this.f[i].calculate(x)
        }
        return sum
    }
    get derivate(){
        let sum = this.f[0]
        for(let i=1;i<this.f.length;i++){
            const d = this.f[i]
            sum = new Divide(new Sub(new Multiply(sum.derivate,d),new Multiply(sum,d.derivate)),new Pow(d,new Costant(2))) 
        }
        return sum
    }
    get text(){
        return this.f.map(f=>`(${f.text})`).join('/')
    }
}
export class Add implements Function {
    f: Function[]
    constructor(...f: Function[]){
        if(f.length<=1)throw new Error('add costructor arg length ' + f.length)
        this.f = f
    }
    calculate(x:number){
        let sum = 0
        for(const f of this.f){
            sum += f.calculate(x)
        }
        return sum
    }
    get derivate(){
        return new Add(...this.f.map(f => f.derivate))
    }
    get text(){
        return this.f.map(f => f.text).join('+')
    }
}
export class Negative implements Function{
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return -this.f.calculate(x)
    }
    get derivate():Function{
        return new Negative(this.f.derivate) 
    }
    get text(){
        return '-' + this.f.text
    }
}
export class Sub implements Function {
    f: Function[]
    constructor(...f:Function[]){
        if(f.length<=1)throw new Error('sub costructor arg length ' + f.length)
        this.f = f
    }
    calculate(x:number){
        let sum = this.f[0].calculate(x)
        for(let i=1;i<this.f.length;i++){
            sum -= this.f[i].calculate(x)
        }
        return sum
    }
    get derivate(){
        return new Sub(...this.f.map(f => f.derivate))
    }
    get text(){
        return this.f.map(f => f.text).join('-')
    }
}
export class Log implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.log(this.f.calculate(x))
    }
    get derivate(){
        return new Divide(this.f.derivate,new Abs(this.f))
    }
    get text(){
        return `log(${this.f.text})` 
    }
}
export class Exp implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.exp(this.f.calculate(x))
    }
    get derivate():Function{
        return new Multiply(this,this.f.derivate)
    }
    get text(){
        return `e^(${this.f.text})`
    }
}
export class Sin implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.sin(this.f.calculate(x))
    }
    get derivate():Function{
        return new Multiply(new Cos(this.f),this.f.derivate)
    }
    get text(){
        return `sin(${this.f.text})`
    }
}
export class Cos implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.cos(this.f.calculate(x))
    }
    get derivate(){
        return new Multiply(new Sub(new Costant(0),new Sin(this.f)),this.f.derivate)
    }
    get text(){
        return `cos(${this.f.text})`
    }
}
export class Tan implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.tan(this.f.calculate(x))
    }
    get derivate(){
        return new Divide(this.f.derivate,new Pow(new Cos(this.f),new Costant(2)))
    }
    get text(){
        return `tan(${this.f.text})`
    }
}
export class Sinh implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.sinh(this.f.calculate(x))
    }
    get derivate():Function{
        return new Multiply(new Cosh(this.f),this.f.derivate)
    }
    get text(){
        return `sinh(${this.f.text})` 
    }
}
export class Cosh implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.cosh(this.f.calculate(x))
    }
    get derivate(){
        return new Multiply(new Sinh(this.f),this.f.derivate)
    }
    get text(){
        return `cosh(${this.f.text})` 
    }
}
export class Tanh implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.tanh(this.f.calculate(x))
    }
    get derivate(){
        return new Divide(this.f.derivate,new Pow(new Cosh(this.f),new Costant(2)))
    }
    get text(){
        return `tanh(${this.f.text})` 
    }
}
export class Asin implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.asin(this.f.calculate(x))
    }
    get derivate(){
        return new Divide(this.f.derivate,new Sqrt(new Sub(new Costant(1),new Pow(this.f,new Costant(2)))))
    }
    get text(){
        return  `asin(${this.f.text})` 
    }
}
export class Acos implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.acos(this.f.calculate(x))
    }
    get derivate(){
        return new Sub(new Costant(0),new Asin(this.f).derivate)
    }
    get text(){
        return `acos(${this.f.text})` 
    }
}
export class Atan implements Function {
    f: Function
    constructor(f: Function){
        this.f = f
    }
    calculate(x:number){
        return Math.atan(this.f.calculate(x))
    }
    get derivate(){
        return new Divide(this.f.derivate,new Add(new Costant(1),new Pow(this.f,new Costant(2))))
    }
    get text(){
        return `atan(${this.f.text})` 
    }
}
export class Pow implements Function {
    base: Function
    exp: Function
    constructor(base: Function,exp: Function){
        this.base = base
        this.exp = exp 
    }
    calculate(x:number){
        return Math.pow(this.base.calculate(x),this.exp.calculate(x))
    }
    get derivate():Function{
        if(this.exp instanceof Costant){
            return new Multiply(this.exp,new Pow(this.base,new Costant(this.exp.value-1)),this.base.derivate)
        }
        const brackets_div = new Divide(new Multiply(this.exp,this.base.derivate),this.base)
        const brakets = new Add(new Multiply(this.exp.derivate,new Log(this.base)),brackets_div)
        return new Multiply(this,brakets)
    }
    get text(){
        return `(${this.base.text})^(${this.exp.text})` 
    }
}
export class Sqrt implements Function {
    base: Function
    constructor(base: Function){
        this.base = base
    }
    calculate(x:number){
        return Math.sqrt(this.base.calculate(x))
    }
    get derivate():Function{
        return new Multiply(new Divide(this.base.derivate,this),new Costant(-1.2))
    }
    get text(){
        return `sqrt(${this.base.text})`
    }
}
export class Variable implements Function{
    calculate(x:number){
        return x
    }
    get derivate(){
        return new Costant(1)
    }
    get text(){
        return 'x'
    }
}

export class Der implements Function {
    f: Function
    constructor(f: Function){
        this.f = f.derivate
    }
    calculate(x:number){
        return this.f.calculate(x)
    }
    get derivate(){
        return this.f.derivate
    }
    get text(){
        return this.f.text
    }
}