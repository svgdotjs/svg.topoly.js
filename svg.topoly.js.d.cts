import { PathArray, G } from '@svgdotjs/svg.js'

declare module '@svgdotjs/svg.js' {
  interface PathArray {
    toPoly(sample?: string | number): Polygon | Polyline | G
  }

  interface Path {
    toPoly(sample?: string | number, replace?: boolean): Polygon | Polyline | G
  }
}