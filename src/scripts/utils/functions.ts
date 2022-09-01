/**
 * Copyright © 2021 Chris Pikul, All Rights Reserved.
 * 
 * This code base (ts-toolbox or big-toolbox) is under the MIT license. See the 
 * file at the project root "LICENSE" for more information.
 * -----------------------------------------------------------------------------
 * 
 * Provides utilities for functions, and event callbacks.
 * 
 * @module Functions
 */

/**
 * Simple type for anonymous functions, intended for use with callbacks
 */
 export type CallbackFunction = (...args:any) => any;

 /**
  * Simple type for anonymous functions, where no return is expected
  */
 export type CallbackFunctionVoid = (...args:any) => void;
 
 /**
  * Describes a function that has been wrapped by another function
  */
 export type WrappedFunction<T extends CallbackFunction> = (...args:Parameters<T>) => ReturnType<T>;
 
 export type WrappedFunctionVoid<T extends CallbackFunctionVoid> = (...args:Parameters<T>) => void;
 
 /**
  * Throttles a function by a given millisecond delay.
  * 
  * This means that any subsequent calls during this delay are ignored until
  * enough time has elapsed. The first call will be executed as normal.
  * 
  * @param {function} cb Callback to execute
  * @param {number} delay Milliseconds to delay
  * @returns {function} New function
  */
 export function throttle<CB extends CallbackFunction>(cb:CB, delay:number):WrappedFunction<CB> {
   let lastTime = 0;
 
   // Wrap the callback with a new function
   return function(this:any):ReturnType<CB> {
     const now = Date.now();
     if(now - lastTime < delay)
       return;
     lastTime = now;
 
     return cb.apply(this, arguments);
   };
 }
 
 /**
  * Debounces a function using the given millisecond delay.
  * 
  * This means, that until the given delay has elapsed with no further calls
  * to this event, nothing will be performed. Once no more calls to this event
  * are performed for the delay duration, then the function will be called.
  * 
  * @param {function} cb Callback to execute
  * @param {number} delay illiseconds to delay
  * @returns {function} New callback function
  */
 export function debounce<CB extends CallbackFunctionVoid>(cb:CB, delay:number):WrappedFunctionVoid<CB> {
   let timerID:number;
 
   return function(this:any):void {
     // eslint-disable-next-line @typescript-eslint/no-this-alias
     const context = this;
     const args = arguments;
 
     if(timerID)
       clearTimeout(timerID);
 
     timerID = setTimeout(() => {
       cb.apply(context, args);
       timerID = null;
     }, delay);
   };
 }
 