import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createSVGWindow } from 'svgdom'
import {
  G,
  Path,
  PathArray,
  PointArray,
  Polygon,
  Polyline,
  registerWindow
} from '@svgdotjs/svg.js'

import '../src/svg.topoly.js'

const window = createSVGWindow()
registerWindow(window, window.document)

test('toPoly() from a single open subpath returns a polyline', () => {
  const path = new Path().plot('M50,50 L100,50 L100,100')

  const poly = path.toPoly()

  assert.ok(poly instanceof Polyline)
  assert.equal(poly.attr('points'), '50,50 100,50 100,100')
})

test('toPoly() from a single closed subpath returns a polygon', () => {
  const path = new Path().plot('M50,50 L100,50 L100,100 Z')

  const poly = path.toPoly()

  assert.ok(poly instanceof Polygon)
  assert.equal(poly.attr('points'), '50,50 100,50 100,100')
})

test('toPoly() on a path array returns point data, not elements', () => {
  const path = new Path().plot('M50,50 L100,50 L100,100')

  const points = path.array().toPoly()

  assert.ok(points instanceof PointArray)
  assert.equal(points.toString(), '50,50 100,50 100,100')
})

test('toPoly() from two subpaths returns a group with two polygons', () => {
  const path = new Path().plot('M0,0 L10,0 L10,10 Z M20,0 L30,0 L30,10 Z')

  const group = path.toPoly()

  assert.ok(group instanceof G)
  assert.equal(group.children().length, 2)
  assert.ok(group.children()[0] instanceof Polygon)
  assert.ok(group.children()[1] instanceof Polygon)
  assert.equal(group.children()[0].attr('points'), '0,0 10,0 10,10')
  assert.equal(group.children()[1].attr('points'), '20,0 30,0 30,10')
})

test('toPoly() on a path array with two subpaths returns one point array per subpath', () => {
  const pathArray = new PathArray('M0,0 L10,0 L10,10 Z M20,0 L30,0 L30,10 Z')

  const pointArrays = pathArray.toPoly()

  assert.ok(Array.isArray(pointArrays))
  assert.equal(pointArrays.length, 2)
  assert.ok(pointArrays[0] instanceof PointArray)
  assert.equal(pointArrays[0].toString(), '0,0 10,0 10,10')
  assert.equal(pointArrays[1].toString(), '20,0 30,0 30,10')
})

test('toPoly() from three subpaths returns a group with three children', () => {
  const path = new Path().plot('M0,0 L10,0 Z M20,0 L30,0 Z M40,0 L50,0 Z')

  const group = path.toPoly()

  assert.ok(group instanceof G)
  assert.equal(group.children().length, 3)
  group.children().each((poly) => {
    assert.ok(poly instanceof Polygon)
  })
})

test('toPoly() from merged subpaths with curves returns a group with sampled curves', () => {
  const d = 'M0,0 C50,0 100,0 100,100 Z M200,0 C250,0 300,0 300,100 Z'
  const path = new Path().plot(d)

  const group = path.toPoly()

  assert.ok(group instanceof G)
  assert.equal(group.children().length, 2)
  group.children().each((poly) => {
    assert.ok(poly instanceof Polygon)
    // the curve is sampled into multiple points
    assert.ok(poly.array().length > 3)
  })
})

test('toPoly() with a percentage sample rate samples the path', () => {
  const path = new Path().plot('M0,0 C50,0 100,0 100,100')

  const fine = path.array().toPoly('1%')
  const coarse = path.array().toPoly('50%')

  assert.ok(fine instanceof PointArray)
  assert.ok(fine.length > coarse.length)
})

test('toPoly() with a pixel sample rate samples the path', () => {
  const path = new Path().plot('M0,0 C50,0 100,0 100,100')

  const fine = path.array().toPoly('5px')
  const coarse = path.array().toPoly('50px')

  assert.ok(fine instanceof PointArray)
  assert.ok(fine.length > coarse.length)
})

test('toPoly() with a number of samples samples the path', () => {
  const path = new Path().plot('M0,0 C50,0 100,0 100,100')

  const points = path.array().toPoly(10)

  assert.ok(points instanceof PointArray)
  assert.equal(points.length, 11)
})

test('toPoly() transfers the presentation attributes', () => {
  const path = new Path()
    .plot('M0,0 L10,0 L10,10 Z')
    .fill({ color: '#f06', opacity: 0.5 })
    .stroke({ color: '#ff6', width: 5, dasharray: '4 2' })
    .opacity(0.8)
    .scale(2)

  const poly = path.toPoly('1%', false)

  assert.equal(poly.attr('fill'), path.attr('fill'))
  assert.equal(poly.attr('stroke'), path.attr('stroke'))
  assert.equal(poly.attr('opacity'), path.attr('opacity'))
  assert.equal(poly.attr('transform'), path.attr('transform'))
  assert.equal(poly.attr('fill-opacity'), 0.5)
  assert.equal(poly.attr('stroke-width'), 5)
  assert.equal(poly.attr('stroke-dasharray'), '4 2')
})

test('toPoly() does not transfer the path data or unrelated attributes', () => {
  const path = new Path()
    .plot('M0,0 L10,0 L10,10 Z')
    .attr({ 'data-fill': 'red', id: 'the-path' })

  const poly = path.toPoly('1%', false)

  assert.equal(poly.node.getAttribute('d'), null)
  assert.equal(poly.node.getAttribute('data-fill'), null)
  assert.equal(poly.node.getAttribute('id'), null)
})

test('toPoly() throws instead of sampling forever with a sample of 0', () => {
  const path = new Path().plot('M0,0 C50,0 100,0 100,100')

  assert.throws(() => path.toPoly('0%'), /sample distance/)
  assert.throws(() => path.toPoly('0px'), /sample distance/)
})

test('toPoly() replaces the path in the document by default', () => {
  const svg = new G().add(new Path().plot('M0,0 L10,0 L10,10 Z'))

  const path = svg.children()[0]
  const poly = path.toPoly()

  assert.equal(svg.children().length, 1)
  assert.equal(svg.children()[0], poly)
})
