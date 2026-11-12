import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ROWS, SCREEN, SEAT_CELLS, SeatCell, rowFloor, rowZ, seatX, AISLE_AFTER } from "@common/theater/layout";

// Imperative scene construction ported from legacy-web/src/theater.js.
// Returns the root group plus hooks to recolor seats and swap the film frame.

const SEAT_COLOR = {
  std: new THREE.Color(0x8c1119),
  rec: new THREE.Color(0x6a0d14),
  taken: new THREE.Color(0x2a0a0e),
  mine: new THREE.Color(0x7cf2b4),
};

const M = {
  // MeshStandard instead of Physical+sheen: the sheen shader took tens of
  // seconds to compile on the iOS simulator and is heavy on low-end phones
  velvet: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x0e0d10, roughness: 0.9 }),
  arm: () => new THREE.MeshStandardMaterial({ color: 0x1c1517, roughness: 0.55 }),
  floor: () => new THREE.MeshStandardMaterial({ color: 0x17121a, roughness: 1 }),
  wall: () => new THREE.MeshStandardMaterial({ color: 0x141116, roughness: 0.95 }),
  panel: () => new THREE.MeshStandardMaterial({ color: 0x1b1519, roughness: 0.9 }),
  glow: (c: number, i: number) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: i }),
};

function buildLights(g: THREE.Group) {
  // The web prototype lit the room with a RectAreaLight the size of the screen.
  // That light hangs expo-gl (it needs float LTC textures), so the screen's
  // spill is faked with a wide spot plus a warm point light in front of it.
  const spill = new THREE.SpotLight(0xf2d9bb, 140, 34, 1.2, 0.95, 1.3);
  spill.position.set(0, SCREEN.cy, 0.3);
  spill.target.position.set(0, 0.5, 12);
  g.add(spill, spill.target);
  const glow = new THREE.PointLight(0xf2d9bb, 18, 0, 1.2);
  glow.position.set(0, SCREEN.cy, 1.5);
  g.add(glow);
  g.add(new THREE.HemisphereLight(0x4a3c48, 0x0b0809, 1.4));
  // soft light from the projection booth so seat backs read
  const back = new THREE.DirectionalLight(0xffe0c2, 1.4);
  back.position.set(0, 14, 30);
  back.target.position.set(0, 0, 6);
  g.add(back, back.target);
  const fill = new THREE.PointLight(0xff9a6a, 30, 16, 2);
  fill.position.set(0, 7.5, 10);
  g.add(fill);
}

function buildRoom(g: THREE.Group) {
  const L = 18, W = 16, H = 9;
  const floorM = M.floor(), wallM = M.wall(), panelM = M.panel();
  const sconceM = M.glow(0xffa865, 2.2), stepM = M.glow(0xffb27a, 1.6);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L + 2), floorM);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, L / 2 - 1);
  g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L + 2), wallM);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, L / 2 - 1);
  g.add(ceil);

  // wall panels and sconces share geometry, so instance them
  const panelGeo = new THREE.BoxGeometry(0.08, 4.6, 2.0), sconceGeo = new THREE.BoxGeometry(0.05, 0.05, 0.9);
  const zs: number[] = [];
  for (let z = 2; z < L; z += 2.4) zs.push(z);
  const panels = new THREE.InstancedMesh(panelGeo, panelM, zs.length * 2);
  const sconces = new THREE.InstancedMesh(sconceGeo, sconceM, zs.length * 2);
  const d = new THREE.Object3D();
  let i = 0;
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(L + 2, H), wallM);
    w.rotation.y = (-sx * Math.PI) / 2;
    w.position.set((sx * W) / 2, H / 2, L / 2 - 1);
    g.add(w);
    for (const z of zs) {
      d.position.set(sx * (W / 2 - 0.04), 4.6, z); d.updateMatrix(); panels.setMatrixAt(i, d.matrix);
      d.position.set(sx * (W / 2 - 0.1), 2.1, z); d.updateMatrix(); sconces.setMatrixAt(i, d.matrix);
      i++;
    }
  }
  g.add(panels, sconces);

  const bw = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallM);
  bw.rotation.y = Math.PI;
  bw.position.set(0, H / 2, L - 0.5);
  g.add(bw);
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0x020202 }));
  fw.position.set(0, H / 2, -0.06);
  g.add(fw);

  // stadium risers and aisle step lights
  const aisleXs = AISLE_AFTER.map((c) => (seatX(c) + seatX(c + 1)) / 2);
  for (let r = 2; r < ROWS.length; r++) {
    const h = rowFloor(r);
    const z0 = (rowZ[r - 1] + rowZ[r]) / 2;
    const z1 = r < ROWS.length - 1 ? (rowZ[r] + rowZ[r + 1]) / 2 : L - 0.5;
    const b = new THREE.Mesh(new THREE.BoxGeometry(W, h, z1 - z0), floorM);
    b.position.set(0, h / 2, (z0 + z1) / 2);
    g.add(b);
    for (const ax of aisleXs) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, 0.025), stepM);
      l.position.set(ax, h - 0.04, z0 - 0.01);
      g.add(l);
    }
  }
}

function buildSeats(g: THREE.Group) {
  const std = SEAT_CELLS.filter((s) => s.kind === "std"), rec = SEAT_CELLS.filter((s) => s.kind === "rec");
  const velvet = M.velvet(), dark = M.dark(), arm = M.arm();
  const d = new THREE.Object3D();
  const colored: { mesh: THREE.InstancedMesh; list: SeatCell[] }[] = [];

  // one InstancedMesh per chair part, offset [x, y, z, tiltX] from the seat origin
  function inst(geo: THREE.BufferGeometry, mat: THREE.Material, list: SeatCell[], [x, y, z, rx]: number[], paint = false) {
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((s, i) => {
      d.position.set(seatX(s.col) + x, rowFloor(s.row) + y, rowZ[s.row] + z);
      d.rotation.set(rx, 0, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      if (paint) m.setColorAt(i, SEAT_COLOR[s.kind]);
    });
    g.add(m);
    if (paint) colored.push({ mesh: m, list });
  }
  // standard chair
  inst(new RoundedBoxGeometry(0.52, 0.13, 0.5, 3, 0.05), velvet, std, [0, 0.46, -0.02, 0], true); // cushion
  inst(new RoundedBoxGeometry(0.53, 0.72, 0.13, 3, 0.06), velvet, std, [0, 0.9, 0.28, 0.14], true); // backrest
  inst(new RoundedBoxGeometry(0.06, 0.07, 0.52, 2, 0.025), arm, std, [-0.3, 0.67, 0.02, 0]);
  inst(new RoundedBoxGeometry(0.06, 0.07, 0.52, 2, 0.025), arm, std, [0.3, 0.67, 0.02, 0]);
  inst(new THREE.BoxGeometry(0.42, 0.4, 0.34), dark, std, [0, 0.2, 0.06, 0]); // base
  // recliner
  inst(new RoundedBoxGeometry(0.56, 0.2, 0.58, 3, 0.07), velvet, rec, [0, 0.45, -0.02, 0], true);
  inst(new RoundedBoxGeometry(0.57, 0.82, 0.22, 3, 0.09), velvet, rec, [0, 0.93, 0.3, 0.2], true);
  inst(new RoundedBoxGeometry(0.09, 0.16, 0.66, 2, 0.04), arm, rec, [-0.33, 0.63, 0.02, 0]);
  inst(new RoundedBoxGeometry(0.09, 0.16, 0.66, 2, 0.04), arm, rec, [0.33, 0.63, 0.02, 0]);
  inst(new THREE.BoxGeometry(0.5, 0.36, 0.5), dark, rec, [0, 0.18, 0.02, 0]);

  return function paint(taken: ReadonlySet<string>, mine: ReadonlySet<string>) {
    for (const { mesh, list } of colored) {
      list.forEach((s, i) => {
        const c = mine.has(s.id) ? SEAT_COLOR.mine : taken.has(s.id) ? SEAT_COLOR.taken : SEAT_COLOR[s.kind];
        mesh.setColorAt(i, c);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  };
}

function buildScreen(g: THREE.Group) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x1a1816, toneMapped: false, fog: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), mat);
  scr.position.set(0, SCREEN.cy, 0);
  g.add(scr);
  return mat;
}

export function buildTheater() {
  const group = new THREE.Group();
  buildLights(group);
  buildRoom(group);
  const paintSeats = buildSeats(group);
  const screenMat = buildScreen(group);

  let tex: THREE.Texture | null = null;
  let base = { x: 0.03, y: 0.03 };
  return {
    group,
    paintSeats,
    setFilmFrame(t: THREE.Texture) {
      t.colorSpace = THREE.SRGBColorSpace;
      // Cover-fit the frame to the 2.39:1 screen (TMDB backdrops are 16:9),
      // cropping a further 6% so the slow pan never shows an edge
      const img = t.image as { width?: number; height?: number } | undefined;
      const imgA = img?.width && img?.height ? img.width / img.height : SCREEN.w / SCREEN.h;
      const scrA = SCREEN.w / SCREEN.h;
      const rx = imgA < scrA ? 0.94 : (0.94 * scrA) / imgA;
      const ry = imgA < scrA ? (0.94 * imgA) / scrA : 0.94;
      t.repeat.set(rx, ry);
      base = { x: (1 - rx) / 2, y: (1 - ry) / 2 };
      t.offset.set(base.x, base.y);
      tex = t;
      screenMat.map = t;
      screenMat.color.set(0xffffff);
      screenMat.needsUpdate = true;
    },
    // slow drift across the film frame, like the camera is panning
    tick(now: number) {
      if (!tex) return;
      tex.offset.x = base.x + Math.sin(now * 0.00005) * Math.min(0.025, base.x * 0.85);
      tex.offset.y = base.y + Math.cos(now * 0.00004) * Math.min(0.012, base.y * 0.85);
    },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => x.dispose());
      });
      tex?.dispose();
    },
  };
}

export type TheaterScene = ReturnType<typeof buildTheater>;
