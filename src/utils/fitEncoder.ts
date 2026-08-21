// ─── FIT FILE ENCODER (Garmin Workout files) ─────────────────────────────
// Hand-rolled minimal binary encoder for the FIT protocol, scoped to just
// what a structured workout needs (file_id / workout / workout_step).
//
// Why not the official @garmin/fitsdk npm package: its writer allocates a
// resizable ArrayBuffer (`new ArrayBuffer(n, { maxByteLength })` + `.resize()`),
// an ES2024 feature Hermes (React Native's JS engine) does not implement
// (facebook/hermes#1705, open as of writing) — it throws at runtime on device.
// This encoder only uses plain fixed-size ArrayBuffer/Uint8Array/DataView,
// which Hermes supports fine.
//
// Every field number, base-type code, scale/offset and the CRC-16 algorithm
// below were verified by round-tripping sample output through the official
// SDK's decoder (Garmin's own Profile + Decoder), not from memory alone.

const CRC_TABLE = [
  0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
  0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
];

function crc16(bytes: Uint8Array): number {
  let crc = 0;
  for (const byte of bytes) {
    let tmp = CRC_TABLE[crc & 0xF];
    crc = (crc >> 4) & 0x0FFF;
    crc = crc ^ tmp ^ CRC_TABLE[byte & 0xF];
    tmp = CRC_TABLE[crc & 0xF];
    crc = (crc >> 4) & 0x0FFF;
    crc = crc ^ tmp ^ CRC_TABLE[(byte >> 4) & 0xF];
  }
  return crc & 0xFFFF;
}

type FieldType = 'enum' | 'uint8' | 'uint16' | 'uint32' | 'string';

interface FieldDef {
  num: number;
  name: string;
  type: FieldType;
  size?: number; // required for 'string'
}

const BASE_TYPE: Record<FieldType, number> = { enum: 0x00, uint8: 0x02, uint16: 0x84, uint32: 0x86, string: 0x07 };
const BASE_SIZE: Partial<Record<FieldType, number>> = { enum: 1, uint8: 1, uint16: 2, uint32: 4 };

function truncateUtf8(str: string, maxBytes: number): string {
  const enc = new TextEncoder();
  let s = str;
  while (enc.encode(s).length > maxBytes && s.length > 0) s = s.slice(0, -1);
  return s;
}

class ByteWriter {
  private chunks: Uint8Array[] = [];

  u8(v: number) { this.chunks.push(Uint8Array.of(v & 0xFF)); }
  u16(v: number) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, v, true); this.chunks.push(b); }
  u32(v: number) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, v >>> 0, true); this.chunks.push(b); }
  str(s: string, size: number) {
    const b = new Uint8Array(size);
    const enc = new TextEncoder().encode(truncateUtf8(s, size - 1));
    b.set(enc);
    this.chunks.push(b);
  }
  raw(bytes: Uint8Array) { this.chunks.push(bytes); }

  toBytes(): Uint8Array {
    const total = this.chunks.reduce((a, c) => a + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of this.chunks) { out.set(c, off); off += c.length; }
    return out;
  }
}

function defMessage(localType: number, globalMesgNum: number, fields: FieldDef[]): Uint8Array {
  const w = new ByteWriter();
  w.u8(0x40 | localType);
  w.u8(0); // reserved
  w.u8(0); // architecture: little-endian
  w.u16(globalMesgNum);
  w.u8(fields.length);
  for (const f of fields) {
    w.u8(f.num);
    w.u8(f.size ?? BASE_SIZE[f.type]!);
    w.u8(BASE_TYPE[f.type]);
  }
  return w.toBytes();
}

function dataMessage(localType: number, fields: FieldDef[], values: Record<string, number | string>): Uint8Array {
  const w = new ByteWriter();
  w.u8(localType & 0x0F);
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === 'string') w.str(typeof v === 'string' ? v : '', f.size!);
    else if (f.type === 'uint8' || f.type === 'enum') w.u8(typeof v === 'number' ? v : 0);
    else if (f.type === 'uint16') w.u16(typeof v === 'number' ? v : 0);
    else if (f.type === 'uint32') w.u32(typeof v === 'number' ? v : 0);
  }
  return w.toBytes();
}

const FILE_ID_FIELDS: FieldDef[] = [
  { num: 0, name: 'type', type: 'enum' },
  { num: 1, name: 'manufacturer', type: 'uint16' },
  { num: 2, name: 'product', type: 'uint16' },
  { num: 3, name: 'serialNumber', type: 'uint32' },
  { num: 4, name: 'timeCreated', type: 'uint32' },
];
const WORKOUT_FIELDS: FieldDef[] = [
  { num: 4, name: 'sport', type: 'enum' },
  { num: 6, name: 'numValidSteps', type: 'uint16' },
  { num: 8, name: 'wktName', type: 'string', size: 40 },
];
const WORKOUT_STEP_FIELDS: FieldDef[] = [
  { num: 254, name: 'messageIndex', type: 'uint16' },
  { num: 0, name: 'wktStepName', type: 'string', size: 28 },
  { num: 1, name: 'durationType', type: 'enum' },
  { num: 2, name: 'durationValue', type: 'uint32' },
  { num: 3, name: 'targetType', type: 'enum' },
  { num: 4, name: 'targetValue', type: 'uint32' },
  { num: 5, name: 'customTargetValueLow', type: 'uint32' },
  { num: 6, name: 'customTargetValueHigh', type: 'uint32' },
  { num: 7, name: 'intensity', type: 'enum' },
];

// FIT global enum codes (verified against @garmin/fitsdk's Profile.types).
export const FIT_DURATION_TYPE = { time: 0, distance: 1, open: 5, repeatUntilStepsCmplt: 6 } as const;
export const FIT_TARGET_TYPE = { speed: 0, open: 2 } as const;
export const FIT_INTENSITY = { active: 0, rest: 1, warmup: 2, cooldown: 3 } as const;
const FIT_SPORT_RUNNING = 1;
const FIT_FILE_TYPE_WORKOUT = 5;
const FIT_MANUFACTURER_DEVELOPMENT = 255;

export interface FitWorkoutStep {
  name: string;
  durationType: typeof FIT_DURATION_TYPE[keyof typeof FIT_DURATION_TYPE];
  durationValue: number; // ms for 'time', cm for 'distance', rep count for 'repeatUntilStepsCmplt'
  targetType: typeof FIT_TARGET_TYPE[keyof typeof FIT_TARGET_TYPE];
  targetValue?: number; // step index to repeat back to (only for repeatUntilStepsCmplt)
  customSpeedLow?: number; // raw: (m/s) * 1000
  customSpeedHigh?: number;
  intensity: typeof FIT_INTENSITY[keyof typeof FIT_INTENSITY];
}

const FIT_EPOCH_OFFSET_SEC = Date.UTC(1989, 11, 31, 0, 0, 0) / 1000;

export function encodeWorkoutFit(workoutName: string, steps: FitWorkoutStep[]): Uint8Array {
  const body = new ByteWriter();

  body.raw(defMessage(0, 0, FILE_ID_FIELDS));
  body.raw(dataMessage(0, FILE_ID_FIELDS, {
    type: FIT_FILE_TYPE_WORKOUT,
    manufacturer: FIT_MANUFACTURER_DEVELOPMENT,
    product: 0,
    serialNumber: Math.floor(Date.now() / 1000),
    timeCreated: Math.floor(Date.now() / 1000) - FIT_EPOCH_OFFSET_SEC,
  }));

  body.raw(defMessage(1, 26, WORKOUT_FIELDS));
  body.raw(dataMessage(1, WORKOUT_FIELDS, {
    sport: FIT_SPORT_RUNNING,
    numValidSteps: steps.length,
    wktName: workoutName,
  }));

  body.raw(defMessage(2, 27, WORKOUT_STEP_FIELDS));
  steps.forEach((s, i) => {
    body.raw(dataMessage(2, WORKOUT_STEP_FIELDS, {
      messageIndex: i,
      wktStepName: s.name,
      durationType: s.durationType,
      durationValue: s.durationValue,
      targetType: s.targetType,
      targetValue: s.targetValue ?? 0,
      customTargetValueLow: s.customSpeedLow ?? 0,
      customTargetValueHigh: s.customSpeedHigh ?? 0,
      intensity: s.intensity,
    }));
  });

  const bodyBytes = body.toBytes();

  const header = new ByteWriter();
  header.u8(14);
  header.u8(0x10);
  header.u16(2132);
  header.u32(bodyBytes.length);
  header.raw(new TextEncoder().encode('.FIT'));
  header.u16(0); // header CRC: 0 = not used, per spec
  const headerBytes = header.toBytes();

  const allButCrc = new Uint8Array(headerBytes.length + bodyBytes.length);
  allButCrc.set(headerBytes, 0);
  allButCrc.set(bodyBytes, headerBytes.length);

  const crcBytes = new Uint8Array(2);
  new DataView(crcBytes.buffer).setUint16(0, crc16(allButCrc), true);

  const fullFile = new Uint8Array(allButCrc.length + 2);
  fullFile.set(allButCrc, 0);
  fullFile.set(crcBytes, allButCrc.length);
  return fullFile;
}
