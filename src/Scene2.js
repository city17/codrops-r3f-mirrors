import React, { useMemo, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import { Text, useMatcapTexture, Octahedron, useGLTFLoader } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import fragment from './fragment.frag'
import vertex from './vertex.vert'

import useSlerp from './use-slerp'
import useRenderTarget from './use-render-target'
import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'
import { mirrorsData as diamondsData } from './data'
import useLayers from './use-layers'

const TEXT_PROPS = {
  fontSize: 3,
  font: 'https://fonts.gstatic.com/stats/Roboto+Mono/normal/400'
}

function Title({ material, texture, map, layers, ...props }) {
  const textRef = useLayers(layers)

  return (
    <group {...props}>
      <Text ref={textRef} name="text-olga" depthTest={false} position={[0, -1, 0]} {...TEXT_PROPS}>
        METAALGEIT
        <meshPhysicalMaterial envMap={texture} map={map} roughness={0} metalness={1} color="#FFFFFF" />
      </Text>
    </group>
  )
}

function Diamond({ map, texture, matcap, layers, nodes, ...props }) {
  const ref = useLayers(layers)

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001
      ref.current.rotation.z += 0.01
    }
  })

  // const material = useMemo(() => new THREE.MeshMatcapMaterial({ color }), [color])

  return (
    <group ref={ref} {...props}>
      <mesh material={nodes.mesh_0.material} geometry={nodes.mesh_0.geometry}>
        <meshMatcapMaterial attach="material" matcap={matcap} transparent opacity={0.75} color="#14CEFF" />
      </mesh>
    </group>
    // <group ref={ref} {...props}>
    // </primitive>
  )
}

function Diamonds({ layers, ...props }) {
  const [matcapTexture] = useMatcapTexture('3B3B3B_C7C7C7_878787_A4A4A4')
  // const { nodes } = useGLTFLoader(process.env.PUBLIC_URL + '/logo.glb')
  const { nodes } = useGLTFLoader(process.env.PUBLIC_URL + '/logo.glb')
  // console.log(logo)

  const [active, setActive] = useState(true)

  const { scale } = useSpring({
    scale: active ? [0.02, 0.02, 0.02] : [0.05, 0.05, 0.05]
  })

  return (
    <group name="diamonds" {...props}>
      {diamondsData.mirrors.map((mirror, index) => {
        const AnimatedDiamond = animated(Diamond)

        return (
          <AnimatedDiamond
            key={`diamond-${index}`}
            name={`diamond-${index}`}
            {...mirror}
            // geometry={nodes.Cylinder.geometry}
            // geometry={logo}
            nodes={nodes}
            // object={logo.scene}
            matcap={matcapTexture}
            scale={scale}
            layers={layers}
            onClick={(e) => setActive(!active)}></AnimatedDiamond>
        )
      })}
    </group>
  )
}

function Background({ layers, ...props }) {
  const ref = useLayers(layers)
  const [matcapTexture] = useMatcapTexture('385862_6D8B8D_647B80_1A2E2F')

  const uniforms = {
    u_color: { value: 0.0 },
    u_time: { value: 0.0 },
    u_resolution: { value: { x: 0, y: 0 } }
  }

  useThree(({ size }) => {
    uniforms.u_resolution.value.x = size.width
    uniforms.u_resolution.value.y = size.height
  })

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime()
  })

  return (
    <Octahedron ref={ref} three={useThree()} name="background" args={[20, 4, 4]} {...props}>
      {/* <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} color="#FFFFFF" /> */}
      <shaderMaterial
        attach="material"
        args={[
          {
            uniforms: uniforms,
            vertexShader: vertex,
            fragmentShader: fragment
          }
        ]}
      />
    </Octahedron>
  )
}

function Scene() {
  const [cubeCamera, renderTarget] = useRenderTarget()
  const thinFilmFresnelMap = useMemo(() => new ThinFilmFresnelMap(410, 0, 5, 1024), [])
  const group = useSlerp()
  return (
    <>
      <Background layers={[0, 11]} position={[0, 0, -5]} />
      <cubeCamera
        layers={[11]}
        name="cubeCamera"
        ref={cubeCamera}
        args={[0.1, 100, renderTarget]}
        position={[0, 0, -12]}
      />
      <group name="sceneContainer" ref={group}>
        <Diamonds layers={[0, 11]} />
        <group name="text" position={[0, 0, -5]}>
          <Title layers={[0]} name="title" texture={renderTarget.texture} map={thinFilmFresnelMap} />
        </group>
      </group>
    </>
  )
}

export default Scene
