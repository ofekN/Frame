/**
 * BezierEasing - use bezier curve for transition easing function
 * by GaÃ«tan Renaudeau 2014 â€“ MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
 * spline(x) => returns the easing value | x must be in [0, 1] range
 * 
 *Credit: GaÃ«tan Renaudeau
 */
 (function (definition) {
    if (typeof exports === "object") {
      module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
      define([], definition);
    } else {
      window.BezierEasing = definition();
    }
  }(function () {
    const global = this;
  
    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    var mX1 = 0,mX2=0
  
    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
  
    // var float32ArraySupported = 'Float32Array' in global;
  
    function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
    function C (aA1)      { return 3.0 * aA1; }
  
    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function calcBezier (aT, aA1, aA2) {
      return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
    }
  
    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function getSlope (aT, aA1, aA2) {
      return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }
  
    function binarySubdivide (aX, aA, aB) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }
  
    function BezierEasing (mX1, mY1, mX2, mY2) {
      // Validate arguments
      if (arguments.length !== 4) {
        throw new Error("BezierEasing requires 4 arguments.");
      }
      for (var i=0; i<4; ++i) {
        if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
          throw new Error("BezierEasing arguments should be integers.");
        }
      }
      if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
        throw new Error("BezierEasing x values must be in [0, 1] range.");
      }
  
      var mSampleValues = new Float32Array(kSplineTableSize) 
  
      function newtonRaphsonIterate (aX, aGuessT) {
        for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
          var currentSlope = getSlope(aGuessT, mX1, mX2);
          if (currentSlope === 0.0) return aGuessT;
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
      }
  
      function calcSampleValues () {
        for (var i = 0; i < kSplineTableSize; ++i) {
          mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }
  
      function getTForX (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;
  
        for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }
        --currentSample;
  
        // Interpolate to provide an initial guess for t
        var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
  
        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
        }
      }
  
      var _precomputed = false;
      function precompute() {
        _precomputed = true;
        if (mX1 != mY1 || mX2 != mY2)
          calcSampleValues();
      }
  
      var f = function (aX) {
        if (!_precomputed) precompute();
        if (mX1 === mY1 && mX2 === mY2) return aX; // linear
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (aX === 0) return 0;
        if (aX === 1) return 1;
        return calcBezier(getTForX(aX), mY1, mY2);
      };
  
      f.getControlPoints = function() { return [{ x: mX1, y: mY1 }, { x: mX2, y: mY2 }]; };
  
      var args = [mX1, mY1, mX2, mY2];
      var str = "BezierEasing("+args+")";
      f.toString = function () { return str; };
  
   
      return f;
    }
  

  
    return BezierEasing;
  
  }));

export function checkEase(ease)
{
  if(typeof ease === 'string')
  {
    switch (ease) {
      case 'linear':
         return [1,1,1,1];
        break;
      case 'sine-in':
         return [0.12, 0, 0.39, 0];
        break;  
      case 'sine-out':
         return [0.61, 1, 0.88, 1];
        break;  
      case 'sine-inOut':
         return [0.37, 0, 0.63, 1];
        break;  
      case 'cubic-in':
         return [0.32, 0, 0.67, 0];
        break;  
      case 'cubic-out':
         return [0.33, 1, 0.68, 1];
        break;  
      case 'cubic-inOut':
         return [0.65, 0, 0.35, 1];
        break;  
      case 'expo-in':
         return [0.7, 0, 0.84, 0];
        break;  
      case 'expo-out':
         return [0.16, 1, 0.3, 1];
        break;  
      case 'expo-inOut':
         return [0.87, 0, 0.13, 1];
        break;  
      case 'motion-in':
         return [1,.99,.96,.78];
        break;  
      case 'motion-out':
         return [1,.99,.71,.92];
        break;  
      case 'motion-inOut':
         return [1,1,.86,.49];
        break;  
    }
  }
  else if(Array.isArray(ease))
  {
    if(ease.length === 4)
    {
      return 'array' + ease;
    }
    else 
    {
      return console.warn(`Custom ease must be Array of 4 Numbers : "${ease}"`),null
    }
  }
  return console.warn(`this type of ease is not valid : "${ease}"`), null
}