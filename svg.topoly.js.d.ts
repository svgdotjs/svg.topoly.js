import { PathArray, PointArray, Polygon, Polyline } from '@svgdotjs/svg.js'

declare module "@svgdotjs/svg.js" {
  interface PathArray {
    toPoly(sample?: string | number): PointArray
  }

  interface Path {
    toPoly(sample?: string | number, replace?: boolean): Polygon
    toPoly(sample?: string | number, replace?: boolean): Polyline
  }
}
