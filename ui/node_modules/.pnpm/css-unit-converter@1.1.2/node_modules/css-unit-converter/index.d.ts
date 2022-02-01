declare module 'css-unit-converter' {
  export type CSSUnits = 'px' | 'cm' | 'mm' | 'in' | 'pt' | 'pc' | 'deg' | 'grad' | 'rad' | 'turn' | 's' | 'ms' | 'Hz' | 'kHz' | 'dpi' | 'dpcm' | 'dppx';

  export default function (
    value: number,
    sourceUnit: CSSUnits,
    targetUnit: CSSUnits,
    precision?: number
  ): number;
}
