import { G, PointArray } from '@svgdotjs/svg.js'

declare module '@svgdotjs/svg.js' {
  interface PathArray {
    toPoly(sample?: string | number): PointArray | PointArray[]
  }

  interface Path {
    toPoly(sample?: string | number, replace?: boolean): Polygon | Polyline | G
  }
}

export {}
