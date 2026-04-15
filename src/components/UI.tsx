import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { C, radius, font } from '../data/theme';

// ─── Badge ───────────────────────────────────────────────
type BadgeVariant = 'yellow' | 'green' | 'red' | 'acc';
export function Badge({ label, variant = 'yellow' }: { label: string; variant?: BadgeVariant }) {
  const colors: Record<BadgeVariant, { bg: string; text: string }> = {
    yellow: { bg: 'rgba(232,255,71,0.13)', text: C.acc },
    green:  { bg: 'rgba(71,255,180,0.13)', text: C.acc2 },
    red:    { bg: 'rgba(255,85,85,0.13)',  text: C.danger },
    acc:    { bg: 'rgba(232,255,71,0.13)', text: C.acc },
  };
  const c = colors[variant];
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: c.bg }]}>
      <Text style={[badgeStyles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}
const badgeStyles = StyleSheet.create({
  wrap: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: font.xs, fontWeight: '700' },
});

// ─── Chip / Tag ──────────────────────────────────────────
export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[tagStyles.wrap, accent && { backgroundColor: C.s3 }]}>
      <Text style={[tagStyles.text, accent && { color: C.acc }]}>{label}</Text>
    </View>
  );
}
const tagStyles = StyleSheet.create({
  wrap: { backgroundColor: C.s2, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4, marginTop: 4 },
  text: { fontSize: font.sm, color: C.text2 },
});

// ─── Button ──────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Btn({
  label, onPress, variant = 'primary', icon, style, disabled,
}: {
  label: string; onPress: () => void; variant?: BtnVariant;
  icon?: string; style?: ViewStyle; disabled?: boolean;
}) {
  const variantStyle: Record<BtnVariant, { bg: string; text: string }> = {
    primary:   { bg: C.acc,   text: '#0f0f0f' },
    secondary: { bg: C.s2,    text: C.text },
    danger:    { bg: 'rgba(255,85,85,0.13)', text: C.danger },
    ghost:     { bg: 'transparent', text: C.text2 },
  };
  const vs = variantStyle[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[btnStyles.btn, { backgroundColor: vs.bg, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {icon ? <Text style={{ fontSize: 16, marginRight: 6 }}>{icon}</Text> : null}
      <Text style={[btnStyles.label, { color: vs.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const btnStyles = StyleSheet.create({
  btn: { borderRadius: radius.sm, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  label: { fontSize: font.lg, fontWeight: '800' },
});

// ─── Card ────────────────────────────────────────────────
export function Card({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[cardStyles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyles.card, style]}>{children}</View>;
}
const cardStyles = StyleSheet.create({
  card: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
});

// ─── Section Title ───────────────────────────────────────
export function SectionTitle({ label, style }: { label: string; style?: TextStyle }) {
  return (
    <Text style={[secStyles.text, style]}>{label.toUpperCase()}</Text>
  );
}
const secStyles = StyleSheet.create({
  text: { fontSize: font.xs, fontWeight: '700', color: C.text2, letterSpacing: 1, marginTop: 18, marginBottom: 10 },
});

// ─── Stat Box ────────────────────────────────────────────
export function StatBox({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.val, color ? { color } : {}]}>{value}</Text>
      <Text style={statStyles.lbl}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  box: { flex: 1, backgroundColor: C.s2, borderRadius: radius.sm, padding: 12, alignItems: 'center' },
  val: { fontSize: 22, fontWeight: '900', color: C.acc },
  lbl: { fontSize: font.xs, color: C.text2, marginTop: 2 },
});

// ─── Progress Bar ────────────────────────────────────────
export function ProgressBar({ pct }: { pct: number }) {
  return (
    <View style={pbStyles.bg}>
      <View style={[pbStyles.fill, { width: `${Math.min(100, pct)}%` }]} />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  bg: { height: 4, backgroundColor: C.s3, borderRadius: 2, marginHorizontal: 16, marginTop: 6 },
  fill: { height: 4, backgroundColor: C.acc, borderRadius: 2 },
});

// ─── Timer Ring ──────────────────────────────────────────
export function TimerRing({ seconds }: { seconds: number }) {
  return (
    <View style={trStyles.ring}>
      <Text style={trStyles.num}>{seconds}</Text>
      <Text style={trStyles.lbl}>PAUSA</Text>
    </View>
  );
}
const trStyles = StyleSheet.create({
  ring: { width: 150, height: 150, borderRadius: 75, backgroundColor: C.s1, borderWidth: 3, borderColor: C.acc, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 16 },
  num: { fontSize: 52, fontWeight: '900', color: C.acc, lineHeight: 56 },
  lbl: { fontSize: 11, color: C.text2, letterSpacing: 1, marginTop: 2 },
});

// ─── Set Circle ──────────────────────────────────────────
export function SetCircle({ n, state }: { n: number | string; state: 'done' | 'current' | 'pending' }) {
  const s = {
    done:    { bg: C.acc,  border: C.acc,  txt: '#0f0f0f' },
    current: { bg: 'transparent', border: C.acc,  txt: C.acc },
    pending: { bg: C.s2,   border: C.s3,   txt: C.text3 },
  }[state];
  return (
    <View style={[scStyles.circle, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[scStyles.text, { color: s.txt }]}>{state === 'done' ? '✓' : n}</Text>
    </View>
  );
}
const scStyles = StyleSheet.create({
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 11, fontWeight: '700' },
});

// ─── Vuelta Dots ─────────────────────────────────────────
export function VueltaDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 8 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const cur  = i === current;
        return (
          <View key={i} style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: done ? C.acc : 'transparent',
            borderWidth: cur ? 2 : 0,
            borderColor: cur ? C.acc : 'transparent',
            ...((!done && !cur) && { backgroundColor: C.s3 }),
          }} />
        );
      })}
    </View>
  );
}

// ─── Loading ─────────────────────────────────────────────
export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <ActivityIndicator color={C.acc} size="large" />
    </View>
  );
}
