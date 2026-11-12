import React from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";
import { buildTheater } from "./build-scene";
import { OVERVIEW, TheaterController } from "./camera-controller";

interface Props {
  controller: TheaterController;
  filmFrame: number | string; // bundled image id or image URL shown on the cinema screen
  taken: ReadonlySet<string>;
  mine: ReadonlySet<string>;
  active: boolean; // render continuously; otherwise the loop sleeps
  canLook: boolean;
  onReady?: () => void;
  onLookStart?: () => void;
}

function Theater({
  controller,
  filmFrame,
  taken,
  mine,
  onReady,
  onWarm,
}: Pick<Props, "controller" | "filmFrame" | "taken" | "mine" | "onReady"> & { onWarm: () => void }) {
  const theater = React.useMemo(() => buildTheater(), []);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  React.useEffect(() => () => theater.dispose(), [theater]);

  React.useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load(
      filmFrame as string, // R3F native's loader also accepts bundled asset ids
      (t) => {
        if (!cancelled) theater.setFilmFrame(t);
      },
      undefined,
      () => {}, // keep the plain screen if the frame can't load
    );
    return () => {
      cancelled = true;
    };
  }, [filmFrame, theater]);

  React.useEffect(() => theater.paintSeats(taken, mine), [taken, mine, theater]);

  // Compile shaders up front so the first fly-in doesn't stutter
  React.useEffect(() => {
    controller.step(performance.now(), camera, size);
    gl.compile(scene, camera);
    onReady?.();
    const id = setTimeout(onWarm, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const now = performance.now();
    controller.step(now, camera, size);
    theater.tick(now);
  });

  // eslint-disable-next-line react/no-unknown-property -- `object` is an R3F prop
  return <primitive object={theater.group} />;
}

export default function TheaterView({ controller, filmFrame, taken, mine, active, canLook, onReady, onLookStart }: Props) {
  // Start on "always" so the GL view presents its first frames (starting on
  // "never" left it blank in testing), then sleep while the 2D map covers it.
  const [warm, setWarm] = React.useState(false);
  const onWarm = React.useCallback(() => setWarm(true), []);
  const last = React.useRef({ x: 0, y: 0 });

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Canvas
          frameloop={active || !warm ? "always" : "never"}
          camera={{ fov: 60, near: 0.05, far: 90, position: [OVERVIEW.pos.x, OVERVIEW.pos.y, OVERVIEW.pos.z] }}
          gl={{ antialias: true }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            scene.background = new THREE.Color(0x060507);
            scene.fog = new THREE.Fog(0x060507, 20, 42);
          }}
        >
          <Theater controller={controller} filmFrame={filmFrame} taken={taken} mine={mine} onReady={onReady} onWarm={onWarm} />
        </Canvas>
      </View>
      {/* drag to look around */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => canLook}
        onMoveShouldSetResponder={() => canLook}
        onResponderGrant={(e) => {
          last.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
          onLookStart?.();
        }}
        onResponderMove={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          controller.drag(pageX - last.current.x, pageY - last.current.y);
          last.current = { x: pageX, y: pageY };
        }}
      />
    </View>
  );
}
