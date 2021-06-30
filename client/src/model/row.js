export default class row{
    constructor(k,v,r,c,type,s = true){
        console.log(k,v,r,c)
        this.key = k
        this.value = v
        this.random = r
        this.Commitment = c
        this.type = type
        this.share = s
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
}