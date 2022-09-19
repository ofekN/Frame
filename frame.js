import './utilities/bezierEasing.js'
import { checkEase } from './utilities/bezierEasing.js'
const Version = '1.0'


const supportTransforms = ['x','y','z','rotate','rotateX','rotateY','rotateZ','scale']
const supportCss = ['width','height','top','left','right','bottom','marginRight','marginLeft','marginTop','marginBottom','paddingRight','paddingLeft','paddingTop','paddingBottom','borderRadius','fontSize','fontWeight','lineHeight','letterSpacing','opacity']
const settings = ['isObj','duration','repeat','onRun','onEnd','onStart','object','repeated','pong','ease']

const hexToRgb = (hex) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
}

const getValue = (elm,t) => {
    let isObj = ''
    if(elm.style === undefined) isObj = true
    else isObj = false

    if(isObj === false) 
    {
       let f =  window.getComputedStyle(elm)[t]
       if(f.includes('px')) f = parseFloat(f.replace('px','') )
       else if(f.includes('rgb')) f = parseColor(f)
       else { f = parseFloat(f)}

       return f
    }
    else
    {
        let f = elm[t]
        if(f.includes('rgb')) f = parseColor(f)

        return f;
    }

}

const _getTransform = (element)=> {
    var matrix = window.getComputedStyle(element).transform,
         final = {},
        rotateX = 0,
        rotateY = 0,
        rotateZ = 0,
        x=0,
        y=0,
        z=0,
        angle=0,
        scale=0

    if (matrix !== 'none') {
        const matrixType = matrix.includes('3d') ? '3d' : '2d'
        const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
        let rad = 180 / Math.PI
        var angle =0
        // do some magic
        if (matrixType === '2d') {
            x = matrixValues[4]
            y = matrixValues[5]
            var values = matrix.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
             const a = values[0];
            const b = values[1];
            var radians = Math.atan2(b, a);
            var angle = Math.round( radians * (180/Math.PI));
            var scale = Math.sqrt(a*a + b*b);
             final = {
                x:x,
                y:y,
                rotate:angle,
                scale:scale,
                type:'2d'
            }



          }
          if (matrixType === '3d') {
          

            x = matrixValues[12]
            y = matrixValues[13]
            z = matrixValues[14]
        

            var values = matrix.split('(')[1].split(')')[0].split(','),
                pi = Math.PI,
                sinB = parseFloat(values[8]),
                b = Math.round(Math.asin(sinB) * 180 / pi),
                cosB = Math.cos(b * pi / 180),
                matrixVal10 = parseFloat(values[9]),
                a = Math.round(Math.asin(-matrixVal10 / cosB) * 180 / pi),
                matrixVal1 = parseFloat(values[0]),
                c = Math.round(Math.acos(matrixVal1 / cosB) * 180 / pi);
                var scale = Math.sqrt(values[0]*values[0] + values[1]*values[1]);

            rotateX = a;
            rotateY = b;
            rotateZ = c;

           final = {
                x:x,
                y:y,
                z:z,
                rotateX:rotateX,
                rotateY:rotateY,
                rotateZ:rotateZ,
                scale:scale,
                type:'3d'

            }

        }

    }
    
    
    return final

 

}

const getTransformValue = (elm,t)=>{
    let o = _getTransform(elm)
    let key = t

    if(o.type === '3d' && key === 'rotate') key = 'rotateZ' 

    return parseFloat(o[key])
}

const setStartValue = (elm,obj,obj0)=>{

    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            if(obj.isObj === false)
            {
                if(supportTransforms.indexOf(key) > -1) obj[key].startValue = getTransformValue(elm,key)
                else if(settings.indexOf(key) === -1) obj[key].startValue = getValue(elm,key)

                if(obj0)
                {
                    if(key in obj0 && key === 'color' || key === 'background' || key === 'backgroundColor' || key === 'borderColor') obj[key].startValue = parseColor(obj0[key])
                    else if(key in obj0) 
                    {
                        if(typeof obj0[key] === 'string' && obj0[key].includes('px')) obj[key].startValue = parseFloat(obj0[key].replace('px',''))
                        else if(typeof obj0[key] === 'string' && obj0[key].includes('%')) obj[key].startValue = parseFloat(obj0[key].replace('%',''))
                        else obj[key].startValue = obj0[key]
                    }
                }
            }
            else if(obj.isObj === true)
            {
                if(settings.indexOf(key) === -1) 
                {
                    if(key === 'color' || key === 'backgroundColor' || key === 'background')
                    {
                        obj[key].startValue = parseColor(elm[key])
                    }
                    else obj[key].startValue = elm[key]

                    if(obj0)
                    {
                        if(key in obj0 && key === 'color' || key === 'background' || key === 'backgroundColor' ) obj[key].startValue = parseColor(obj0[key])
                        else if(key in obj0) 
                        {
                            if(typeof obj0[key] === 'string' && obj0[key].includes('px')) obj[key].startValue = obj0[key]
                            if(typeof obj0[key] === 'string' && obj0[key].includes('%')) obj[key].startValue = obj0[key]
                        }
                    }
                }
            }


            if(settings.indexOf(key) === -1)
            {
                let betweenArr = []

                if(Array.isArray(obj[key].value))
                {
                    obj[key].value.forEach((v,i)=>{
                        betweenArr.push(checkValues(obj[key].startValue[i],v))
                    })
                }
                else{
                    betweenArr.push(checkValues(obj[key].startValue,obj[key].value))
                }
                obj[key].betweenValues = betweenArr

            }


           
        }
    } 



    return obj
    
}

const parseColor = (color)=>{
    let final  = []
    if(color.includes('rgba')) final = color.replace('rgba(','').replace(')','').split(',')
    else if(color.includes('rgb')) final = color.replace('rgb(','').replace(')','').split(',')
    else if(color.includes('#')) final = hexToRgb(color).replace('rgb(','').replace(')','').split(',')

    for (let i = 0; i < final.length; i++) {
       final[i] = parseFloat(final[i])

       if(i  === final.length - 1 && i < 3)
       {
        final.push(1)
       }
      
      
    }

    return final

}

const parseOptions = (el,opt)=>{
  // check if element is an obj or html element
    let final = {isObj:''}
    if(el.style === undefined) final.isObj = true
    else final.isObj = false

    for (const key in opt) {
            if (Object.hasOwnProperty.call(opt, key)) {
                const element = opt[key];
                if(typeof element === 'string' && element.includes('px')) final[key] = {value:parseFloat(element.replace('px','') ),semantic:'px',calculatedValue:[]}
                else if(typeof element === 'string' && element.includes('%')) final[key] = {value:parseFloat(element.replace('%','') ),semantic:'%',calculatedValue:[]}
                else if(typeof element === 'string' && element.includes('rgb')) final[key] = {value:parseColor(element),calculatedValue:[]}
                else if(typeof element === 'string' && element.includes('#')) final[key] = {value:parseColor(element),calculatedValue:[]}
                else final[key] = {value:element,calculatedValue:[]}
            }
    }
    return final;
}

const checkValues = (start,endVal)=>
{
    if(start === endVal) return start;
    else if(Math.sign(start) === 1 || Math.sign(start) === 0 && Math.sign(endVal) === 1 )
    {
        return Math.abs(start-endVal);
    }
    //senario two +start and 0end
    else if(Math.sign(start) === 1 || Math.sign(start) === 0 && Math.sign(endVal) === 0 )
    {

        return Math.abs(start-endVal)
    }
    //senario three -start and +end
    else if(Math.sign(start) === -1  && Math.sign(endVal) === 1  ||  Math.sign(endVal) === 0)
    {
        return Math.abs(start-endVal)
    }
    //senario four -start and -end
    else if(Math.sign(start) === -1 || Math.sign(start) === 0 && Math.sign(endVal) === -1 )
    {
        return Math.abs(-start+endVal)
    }
}

const transformValues = (start,endVal,betweenNum,easeNum,easing) =>
{

         // senario five equal 
        if(start === endVal)
         {
            return (start)
         }
       //senario one +start and +end
        else if(Math.sign(start) === 1 && Math.sign(endVal) === 1 )
        {
            if(start > endVal) return (start - (betweenNum * easing(easeNum)))
            else return (start + (betweenNum * easing(easeNum)))
    
        }
    
        else if(Math.sign(start) === 0 && Math.sign(endVal) === 1 )
        {
                return (start + (betweenNum * easing(easeNum)))
        }
        //senario two +start and 0end
        else if(Math.sign(start) === 1 || Math.sign(start) === 0 && Math.sign(endVal) === 0 )
        {
            // console.log('wow')
                return (start - (betweenNum * easing(easeNum)))
        }
        //senario three -start and +end
        else if(Math.sign(start) === -1  && Math.sign(endVal) === 1  ||  Math.sign(endVal) === 0)
        {
                return (start + (betweenNum * easing(easeNum)))
        }
        //senario four -start and -end
        else if(Math.sign(start) === -1 || Math.sign(start) === 0  && Math.sign(endVal) === -1 )
        {
            if(start > endVal) return (start - (betweenNum * easing(easeNum)))
            
            else if(endVal > start) return (start + (betweenNum * easing(easeNum)))
        }

}
 
 class _Frame {
    constructor()
    {
        //*  Motion Hello World   */
        console.log(`%c Frame ${Version} 🙈🙉🙊 https://github.com/ofekN/Frame`, ' background: #040505;text-shadow: 2px 1px #ff0000; color: #fafafa; font-size:1.2em; padding:7.5px;')
        //*  Motion Hello World   */
       
        this.easing =BezierEasing(0, 0, 0.5, 1);

        // animations holder
        this._animations = []
        // sequences holder 
        this._sequences = []

        // bind and init the animation loop 
        this.update = this.update.bind(this);
        this.update()
    }
    run(elm,options)
    {
       let startObj = parseOptions(elm,options)
       let finalObj = setStartValue(elm,startObj)

       finalObj['duration'].value = finalObj['duration'].value *60
       finalObj['duration'].startValue = 0 
       finalObj['duration'].easeNumber = 0
       finalObj['object'] = elm
       finalObj['repeated'] = 0
       finalObj['pong'] = false
       if('ease' in options) finalObj['ease'] = checkEase(options.ease)
       
       this._animations.push(finalObj)

       if('onStart' in options) options.onStart()
    }
    runFrom(elm,options1,options)
    {
       let startObj = parseOptions(elm,options)

       let finalObj = setStartValue(elm,startObj,options1)

       console.log(finalObj)

       finalObj['duration'].value = finalObj['duration'].value *60
       finalObj['duration'].startValue = 0 
       finalObj['duration'].easeNumber = 0
       finalObj['object'] = elm
       finalObj['repeated'] = 0
       finalObj['pong'] = false
       if('ease' in options) finalObj['ease'] = checkEase(options.ease)
       
       this._animations.push(finalObj)

       if('onStart' in options) options.onStart()
    }
    sequence(opt)
    {
       
          
         let  _sequence,sequences = [],sequenceObject = {ease:checkEase(opt.ease) || checkEase('linear'),time:0,maxDuration:0,repeat:opt.repeat || 0,pong:opt.pong || false,ponged:false,repeated:0},
         setMaxDuration = ()=>{
            sequenceObject['maxDuration'] = 0
            sequences.forEach(s=>{
               sequenceObject['maxDuration'] +=  s.opt.duration
            })
         }

         _sequence = 
         {
             run:(elm,options)=>{
                let start = 0
                if(sequences.length > 0) start = (sequences[sequences.length-1].opt.duration + sequences[sequences.length-1].startDuration)
                let startObj = parseOptions(elm,options)
                let finalObj = setStartValue(elm,startObj)
                finalObj['duration'].value = finalObj['duration'].value *60
                finalObj['duration'].startValue = 0 
                finalObj['duration'].easeNumber = 0
                finalObj['object'] = elm
                
                if('ease' in options) finalObj['ease'] = checkEase(options.ease)
                else finalObj['ease'] = sequenceObject.ease

                if('onStart' in options) options.onStart()
                sequences.push({object:elm,opt:options,finalObj,startDuration:start})      

                setMaxDuration()
             },
             runFrom:(elm,options1,options)=>{
                let start = 0
                if(sequences.length > 0) start = (sequences[sequences.length-1].opt.duration + sequences[sequences.length-1].startDuration)
                let startObj = parseOptions(elm,options)
                let finalObj = setStartValue(elm,startObj,options1)
                finalObj['duration'].value = finalObj['duration'].value *60
                finalObj['duration'].startValue = 0 
                finalObj['duration'].easeNumber = 0
                finalObj['object'] = elm
               
                if('ease' in options) finalObj['ease'] = checkEase(options.ease)
                else finalObj['ease'] = sequenceObject.ease

                if('onStart' in options) options.onStart()
                sequences.push({object:elm,opt:options,opt1:options1,startDuration:start})

                setMaxDuration()
             },
             restart:()=>{
                let index = this._sequences.indexOf(sequenceObject)
                 
                this._sequences[index].time = -.9
                this._sequences[index].sequences.forEach(s=>{
                    s.startValue = 0
                    s.easeNumber = 0
                })

             }
         }

         sequenceObject['sequences'] = sequences
       
         this._sequences.push(sequenceObject)
        return _sequence
    }
    calculateValues(a)
    {
        for (const key in a) {
            if (Object.hasOwnProperty.call(a, key)) {

                let ease = ''
                if('ease' in a) ease = BezierEasing(a.ease[0],a.ease[1],a.ease[2],a.ease[3])
                else ease = this.easing

                if(settings.indexOf(key) === -1)
                {
                    a[key].calculatedValue = []
               
                    if(Array.isArray(a[key].value))
                    {
                        a[key].value.forEach((v,ii)=>{
                            if(a[key].calculatedValue.length < a[key].value.length)
                            {
                                a[key].calculatedValue.push(parseFloat(transformValues(a[key].startValue[ii],v,a[key].betweenValues[ii],a['duration'].easeNumber,ease).toFixed(5)))
                            }
                        })
                    }
                    else
                    {
                        if(a[key].calculatedValue.length < a[key].betweenValues.length)
                        {
                            a[key].calculatedValue.push(parseFloat(transformValues(a[key].startValue,a[key].value,a[key].betweenValues[0],a.duration.easeNumber,ease).toFixed(5)))
                        }

                    }
                }
            }
        }
    }
    translateValues(a)
    {
        if(a.isObj === false)
        {
            let x=0,y=0,z=0,rotate=0,rotateX=0,rotateY=0,_scale=1
            if('y' in a) y = a['y'].calculatedValue + (a['y'].semantic || 'px')
            if('x' in a) x = a['x'].calculatedValue + (a['x'].semantic || 'px')
            if('z' in a) x = a['z'].calculatedValue + (a['z'].semantic || 'px')
            if('scale' in a) _scale = a['scale'].calculatedValue[0]
            if('rotate' in a) rotate = a['rotate'].calculatedValue
            if('rotateX' in a) rotateX = a['rotateX'].calculatedValue
            if('rotateY' in a) rotateY = a['rotateY'].calculatedValue

            

            a.object.style.transform = 
            `
            scale(${_scale})
            translateX(${x})
            translateY(${y})
            translateZ(${z})
            rotate(${rotate}deg)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            `
            for (const key in a) {
                if (Object.hasOwnProperty.call(a, key)) {
                    if(supportCss.indexOf(key) > -1 && 'semantic' in  a[key]) a.object.style[key] = a[key].calculatedValue + a[key].semantic
                    else if(supportCss.indexOf(key) > -1) a.object.style[key] = a[key].calculatedValue 
                    if(key === 'color' || key === 'background' || key === 'borderColor') a.object.style[key] = `rgba(${a[key].calculatedValue[0]},${a[key].calculatedValue[1]},${a[key].calculatedValue[2]},${a[key].calculatedValue[3]})`
                
                }
            }
        }
        else if(a.isObj === true)
        {

            for (const key in a) {
                if (Object.hasOwnProperty.call(a, key)) {
                    if(supportCss.indexOf(key) > -1) a.object.style[key] = a[key].calculatedValue + a[key].semantic
                    if(key === 'color' || key === 'background' || key === 'borderColor') a.object[key] = `rgba(${a[key].calculatedValue[0]},${a[key].calculatedValue[1]},${a[key].calculatedValue[2]},${a[key].calculatedValue[3]})`
                    else if(settings.indexOf(key) === -1) a.object[key] = a[key].calculatedValue[0]
                }
            }
        }
    }
    update()
    {

        this._animations.forEach((a,index)=>{
          
            if(a.duration.startValue <  (a.duration.value + 1) && a.pong === false)
            {
                this.calculateValues(a)
               
                a.duration.startValue += 1
                a.duration.easeNumber += 1/a.duration.value

                this.translateValues(a)

                if('onRun' in a) a.onRun.value()
            }
            else
            {
                if(a.repeat) 
                {
                   if(a.repeated < a.repeat.value)
                   {
                    a.repeated +=1
                    a.duration.easeNumber = 0
                    a.duration.startValue = 0
                   }
                   else if(a.repeat.value === -1) 
                   {
                    a.duration.easeNumber = 0
                    a.duration.startValue = 0
                   }
                   else
                   {
                       if('onEnd' in a) a.onEnd.value()
                       this._animations.splice(index,1)
                   }
                }
                else
                {
                    if('onEnd' in a) a.onEnd.value()
                    this._animations.splice(index,1)
                }
               
            }
        })


        this._sequences.forEach((seq,index)=>{


                if(seq.time > seq.maxDuration && seq.ponged === false)
                {
                    if(seq.pong === true) seq.ponged = true
                    else 
                    {
                        if(seq.repeat && seq.repeated < seq.repeat) 
                        {
                            seq.repeated +=1
                            seq.time = 0 
                        }
                    }
                }
                else if(seq.ponged === true && seq.time >  0 )
                {
                     if(seq.time > 0)
                     {
                        seq.time -= parseFloat(1/60)
                        if(seq.time < 0 && seq.repeat && seq.repeated < seq.repeat) 
                        {
                            seq.repeated +=1
                            seq.time = 0 
                            seq.ponged = false
                        }
                     }
                }
                else if(seq.ponged === false && seq.time < seq.maxDuration) seq.time += parseFloat(1/60)
              
          
            seq.sequences.forEach((frame,i)=>{
                if(frame.startDuration > seq.time  || frame.startDuration === seq.time)
                {
                    let ob = parseOptions(frame.object,frame.opt)
                    frame.finalObj = ''
                    if(frame.opt1) frame.finalObj = setStartValue(frame.object,ob,frame.opt1)
                    else frame.finalObj = setStartValue(frame.object,ob)
                    frame.finalObj['duration'].value = frame.finalObj['duration'].value *60
                    frame.finalObj['duration'].startValue = 0 
                    frame.finalObj['duration'].easeNumber = 0
                    frame.finalObj['object'] = frame.object
                    this.calculateValues(frame.finalObj)
                }
                if(frame.startDuration < seq.time && seq.time < frame.startDuration + frame.opt.duration)
                {

                    if(frame.finalObj.duration.startValue <  (frame.finalObj.duration.value + 1) )
                    {
                        this.calculateValues(frame.finalObj)

                       if(seq.ponged === true && seq.time >  0)
                        {
                            frame.finalObj.duration.startValue -= 1
                            frame.finalObj.duration.easeNumber -= 1/frame.finalObj.duration.value
                        }
                        else if(seq.ponged === false && seq.time < seq.maxDuration)
                        {
                            frame.finalObj.duration.startValue += 1
                            frame.finalObj.duration.easeNumber += 1/frame.finalObj.duration.value
                        }
                   
                        this.translateValues(frame.finalObj)
        
                    }
                   
                }
              
            })
            
        })


        window.requestAnimationFrame(this.update)
    }
}

let Frame = new _Frame()
export default Frame
