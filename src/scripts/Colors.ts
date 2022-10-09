
export const Shades:Record<string, string> = {
  white: "hsl(32deg, 29%, 91%)",
  shade100: "hsl(31deg, 21%, 84%)",
  shade200: "hsl(32deg, 18%, 75%)",
  shade300: "hsl(34deg, 15%, 65%)",
  shade400: "hsl(35deg, 11%, 55%)",
  shade500: "hsl(35deg, 9%, 47%)",
  shade600: "hsl(35deg, 10%, 38%)",
  shade700: "hsl(35deg, 14%, 23%)",
  shade800: "hsl(34deg, 17%, 14%)",
  shade900: "hsl(34deg, 19%, 11%)",
  black: "hsl(34deg, 20%, 8%)",
} as const;

export const Primary:Record<string, string> = {
  primary100: "hsl(25deg, 65%, 56%)",
  primary200: "hsl(25deg, 65%, 51%)",
  primary300: "hsl(25deg, 71%, 44%)",
  primary400: "hsl(25deg, 75%, 39%)",
  primary500: "hsl(25deg, 75%, 35%)",
  primary600: "hsl(25deg, 79%, 28%)",
  primary700: "hsl(25deg, 76%, 25%)",
} as const;

export const Secondary:Record<string, string> = {
  secondary100: "hsl(155deg, 53%, 55%)",
  secondary200: "hsl(155deg, 48%, 49%)",
  secondary300: "hsl(155deg, 48%, 45%)",
  secondary400: "hsl(155deg, 49%, 40%)",
  secondary500: "hsl(155deg, 52%, 37%)",
  secondary600: "hsl(155deg, 54%, 30%)",
  secondary700: "hsl(155deg, 55%, 23%)",
} as const;

export const Tertiary:Record<string, string> = {
  tertiary100: "hsl(58deg, 66%, 66%)",
  tertiary200: "hsl(58deg, 60%, 58%)",
  tertiary300: "hsl(58deg, 60%, 49%)",
  tertiary400: "hsl(58deg, 63%, 45%)",
  tertiary500: "hsl(58deg, 67%, 40%)",
  tertiary600: "hsl(58deg, 70%, 35%)",
  tertiary700: "hsl(58deg, 74%, 27%)",
} as const;

const Colors:Record<string, string> = {
  ...Shades,
  primary: Primary.primary400,
  ...Primary,
  secondary: Secondary.secondary400,
  ...Secondary,
  tertiary: Tertiary.tertiary400,
  ...Tertiary,
} as const;
export default Colors;