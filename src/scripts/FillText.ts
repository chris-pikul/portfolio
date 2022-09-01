/**
 * FillText - Use selectors to automatically make the text fill it's parent
 * content's width.
 */
import { debounce } from './utils/functions';

/**
 * Callback type for calculating a new width value.
 */
export type FillTextCalculatorCB = (parentWidth:number, proposed:number) => number;

export interface FillTextOptions {
  minFontSize ?: number,
  maxFontSize ?: number,
  compression ?: number,
  calculator ?: FillTextCalculatorCB,
};

export const FillTextDefaultOptions:FillTextOptions = {
  minFontSize: 1,
  maxFontSize: Number.POSITIVE_INFINITY,
  compression: 1.0,
} as const;

export default function FillText(selector:(HTMLElement | HTMLElement[] | string), options?:FillTextOptions):void {
  const opts:FillTextOptions = {
    ...FillTextDefaultOptions,
    ...(options ?? {}),
  };

  const fill = (el:HTMLElement):void => {
    if(!el.parentElement)
      return console.warn(`FillText operating on ${el} does not have a parent element`);
    
    const parStyle = window.getComputedStyle(el.parentElement);
    const parWidth = el.parentElement.clientWidth
      - parseFloat(parStyle.paddingLeft)
      - parseFloat(parStyle.paddingRight);

    const ourWidth = el.getBoundingClientRect().width;
    const ourStyle = window.getComputedStyle(el);
    const ourFS = parseFloat(ourStyle.getPropertyValue('font-size'));

    let newSize = Math.max(opts.minFontSize, Math.min((
      ((parWidth / ourWidth) * ourFS) * opts.compression
    ), opts.maxFontSize));

    if(typeof opts.calculator === 'function')
      newSize = opts.calculator(parWidth, newSize);

    el.style.fontSize = `${newSize}px`;
    console.info(`filled text to ${newSize}px`);
  };

  let els:HTMLElement[];
  if(typeof selector === 'string')
    els = [ ...document.querySelectorAll<HTMLElement>(selector) ];
  else if(Array.isArray(selector))
    els = [ ...selector ];
  else
    els = [ selector ];

  for(const el of els) {
    el.style.display = 'inline-block';
    el.style.whiteSpace = 'nowrap';  
  }

  const recalc = debounce(() => els.forEach((el:HTMLElement) => fill(el)), 100);

  window.addEventListener('resize', recalc, null);
  window.addEventListener('orientationchange', recalc, null);
  recalc();
}