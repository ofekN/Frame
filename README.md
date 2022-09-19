# Frame
Frame is a lightweight JavaScript animation library, Frame is fast,light and smooth.


### CDN
```html
<script src="https://cdn.jsdelivr.net/gh/ofekN/Frame/frame.js"></script>
```


### ES6
```javascript
import Frame from 'https://cdn.jsdelivr.net/gh/ofekN/Frame/frame.js'
```

### run and runFrom
```javascript

Motion.run(_box,{duration:2,rotateX:50,top:'50px',background:'rgb(155,225,55)',repeat:1})

Motion.runFrom(_box,{rotate:-50},{x:'100%',fontWeight:900,duration:2,repeat:2,onEnd:()=>{console.log('eneded')}})

```

### Sequence
```javascript
let sequence = Frame.sequence({ease:'frame-out',pong:false})
sequence.run(_box,{duration:1,top:'150px'})
sequence.runFrom(_box1,{left:'-100px'},{duration:1,left:'200px'})
sequence.run(_box,{duration:1,top:'50px'})
```