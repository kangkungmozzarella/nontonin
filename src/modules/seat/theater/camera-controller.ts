import type { PerspectiveCamera } from "three";
import { SCREEN, SeatCell, eyeOf } from "@common/theater/layout";

// Camera math ported from legacy-web/src/theater.js. Lives outside React so
// the render loop can read and write it every frame without re-rendering.

export interface Pose {
  pos: { x: number; y: number; z: number };
  yaw: number;
  pitch: number;
}

// Back of the hall, up high: the pose while the 2D map is showing
export const OVERVIEW: Pose = { pos: { x: 0, y: 7.6, z: 16.6 }, yaw: 0, pitch: -0.38 };

export function poseForSeat(s: SeatCell): Pose {
  const e = eyeOf(s);
  const dx = -e.x, dy = SCREEN.cy - e.y, dz = -e.z;
  return { pos: e, yaw: Math.atan2(dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) * 0.5 - 0.02 };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Anim {
  from: Pose;
  to: Pose;
  t0: number;
  dur: number;
  arc: number;
  look0: { yaw: number; pitch: number };
}

const LOOK_YAW = 0.95, LOOK_PITCH = 0.5, DRAG_K = 0.0032;

export class TheaterController {
  cur: Pose = { pos: { ...OVERVIEW.pos }, yaw: OVERVIEW.yaw, pitch: OVERVIEW.pitch };
  look = { yaw: 0, pitch: 0 };
  anim: Anim | null = null;
  /** Pixels of the bottom sheet that cover the canvas; the view shifts up by this much */
  private sheetOffset = 0;
  private offY = 0;

  setSheetOffset(px: number) {
    this.sheetOffset = px;
  }

  setPose(p: Pose) {
    this.cur = { pos: { ...p.pos }, yaw: p.yaw, pitch: p.pitch };
  }

  flyTo(to: Pose, dur = 1500, arc = 0) {
    this.anim = {
      from: { pos: { ...this.cur.pos }, yaw: this.cur.yaw, pitch: this.cur.pitch },
      to,
      t0: performance.now(),
      dur,
      arc,
      look0: { ...this.look },
    };
  }

  resetLook() {
    this.look = { yaw: 0, pitch: 0 };
  }

  isAnimating() {
    return this.anim !== null;
  }

  // Drag deltas in screen pixels
  drag(dx: number, dy: number) {
    if (this.anim) return;
    this.look.yaw = Math.max(-LOOK_YAW, Math.min(LOOK_YAW, this.look.yaw - dx * DRAG_K));
    this.look.pitch = Math.max(-LOOK_PITCH, Math.min(LOOK_PITCH, this.look.pitch + dy * DRAG_K));
  }

  // Called once per frame before rendering
  step(now: number, camera: PerspectiveCamera, size: { width: number; height: number }) {
    const a = this.anim;
    if (a) {
      const k = Math.min(1, (now - a.t0) / a.dur), e = ease(k);
      const p = this.cur.pos;
      p.x = a.from.pos.x + (a.to.pos.x - a.from.pos.x) * e;
      p.y = a.from.pos.y + (a.to.pos.y - a.from.pos.y) * e + Math.sin(Math.PI * e) * a.arc;
      p.z = a.from.pos.z + (a.to.pos.z - a.from.pos.z) * e;
      this.cur.yaw = a.from.yaw + (a.to.yaw - a.from.yaw) * e;
      this.cur.pitch = a.from.pitch + (a.to.pitch - a.from.pitch) * e;
      this.look.yaw = a.look0.yaw * (1 - e);
      this.look.pitch = a.look0.pitch * (1 - e);
      if (k >= 1) this.anim = null;
    }

    const w = size.width, h = size.height;
    if (!w || !h) return;
    // Shift the projection center up so the screen stays above the bottom sheet
    this.offY += (this.sheetOffset - this.offY) * 0.08;
    const F = h + this.offY;
    camera.aspect = w / F;
    const hf = ((w > h ? 74 : 62) * Math.PI) / 180; // horizontal field of view
    camera.fov = Math.min(125, (2 * Math.atan(Math.tan(hf / 2) / camera.aspect) * 180) / Math.PI);
    camera.setViewOffset(w, F, 0, this.offY, w, h);
    camera.updateProjectionMatrix();
    camera.position.set(this.cur.pos.x, this.cur.pos.y, this.cur.pos.z);
    camera.rotation.set(this.cur.pitch + this.look.pitch, -(this.cur.yaw + this.look.yaw), 0, "YXZ");
  }
}
