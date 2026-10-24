import { BoxGeometry, ConeGeometry, ExtrudeGeometry, LatheGeometry, Shape, SphereGeometry, Vector2 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { BufferGeometry } from 'three'
import type { ChessKind } from '../../shared/chess'

export function createPieceGeometry(kind: ChessKind) {
  const heights = { p: .58, r: .72, n: .8, b: .88, q: 1, k: 1.12 }
  const h = heights[kind]
  const profile = [[0,0],[.27,0],[.29,.045],[.27,.1],[.22,.13],[.21,.19],[.15,.22],[.105,h*.65],[.19,h*.7],[.19,h*.76],[.12,h*.78],[0,h*.78]]
  const parts: BufferGeometry[] = [new LatheGeometry(profile.map(([r,y]) => new Vector2(r,y)),12)]
  const box = (x: number,y: number,z: number,px: number,py: number,pz: number) => parts.push(new BoxGeometry(x,y,z).translate(px,py,pz))
  if (kind === 'p') parts.push(new SphereGeometry(.18,10,7).translate(0,h*.91,0))
  if (kind === 'r') {
    parts.push(new LatheGeometry([[0,0],[.25,0],[.25,.15],[0,.15]].map(([r,y]) => new Vector2(r,y)),12).translate(0,h*.76,0))
    for (const [x,z] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) box(.13,.16,.13,x,h+.015,z)
  }
  if (kind === 'b') {
    parts.push(new SphereGeometry(.2,10,8).scale(.8,1.35,.8).translate(0,h*.94,0))
    box(.025,.18,.32,0,h*1.02,0)
  }
  if (kind === 'q') {
    for (let i=0;i<6;i++) parts.push(new ConeGeometry(.065,.22,5).translate(Math.cos(i*Math.PI/3)*.18,h*.93,Math.sin(i*Math.PI/3)*.18))
    parts.push(new SphereGeometry(.075,8,6).translate(0,h*1.03,0))
  }
  if (kind === 'k') { box(.075,.37,.075,0,h*.98,0); box(.25,.075,.075,0,h*1.04,0) }
  if (kind === 'n') {
    const horse = new Shape()
    horse.moveTo(-.16,.45); horse.lineTo(.12,.45); horse.lineTo(.1,.67); horse.lineTo(.33,.72); horse.lineTo(.32,.88)
    horse.lineTo(.13,1.03); horse.lineTo(.1,1.17); horse.lineTo(-.01,1.08); horse.lineTo(-.15,1.13); horse.lineTo(-.19,.85); horse.closePath()
    parts.push(new ExtrudeGeometry(horse,{depth:.22,bevelEnabled:false}).translate(0,-.05,-.11))
  }
  // Remove UVs so all parts have the same attribute layout before merging.
  const plain = parts.map(part => { const geometry = part.index ? part.toNonIndexed() : part.clone(); geometry.deleteAttribute('uv'); return geometry })
  const geometry = mergeGeometries(plain)!
  parts.forEach(part => part.dispose()); plain.forEach(part => part.dispose())
  geometry.computeBoundingSphere()
  return geometry
}
