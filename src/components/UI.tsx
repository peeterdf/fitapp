import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';

type Colors = ReturnType<typeof useColors>;

// ─── Badge ────────────────────────────────────────────────
type BadgeVariant = 'yellow' | 'green' | 'red' | 'acc';
export function Badge({ label, variant = 'yellow' }: { label: string; variant?: BadgeVariant }) {
  const C = useColors();
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

// ─── Tag ────────────────────────────────────────────────
export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  const C = useColors();
  return (
    <View style={[{ backgroundColor: C.s2, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4, marginTop: 4 }, accent && { backgroundColor: C.s3 }]}>
      <Text style={[{ fontSize: font.sm, color: C.text2 }, accent && { color: C.acc }]}>{label}</Text>
    </View>
  );
}

// ─── Button ────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Btn({
  label, onPress, variant = 'primary', icon, style, disabled,
}: {
  label: string; onPress: () => void; variant?: BtnVariant;
  icon?: string; style?: ViewStyle; disabled?: boolean;
}) {
  const C = useColors();
  const variantStyle: Record<BtnVariant, { bg: string; text: string }> = {
    primary:   { bg: C.acc,   text: C.black },
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
  const C = useColors();
  const cardStyle = { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 };
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}

// ─── Section Title ───────────────────────────────────────────────
export function SectionTitle({ label, style }: { label: string; style?: TextStyle }) {
  const C = useColors();
  return (
    <Text style={[{ fontSize: font.xs, fontWeight: '700', color: C.text2, letterSpacing: 1, marginTop: 18, marginBottom: 10 }, style]}>
      {label.toUpperCase()}
    </Text>
  );
}

// ─── Stat Box ───────────────────────────────────────────────
export function StatBox({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const C = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: C.s2, borderRadius: radius.sm, padding: 12, alignItems: 'center' }}>
      <Text style={[{ fontSize: 22, fontWeight: '900', color: C.acc }, color ? { color } : {}]}>{value}</Text>
      <Text style={{ fontSize: font.xs, color: C.text2, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────
export function ProgressBar({ pct }: { pct: number }) {
  const C = useColors();
  return (
    <View style={{ height: 4, backgroundColor: C.s3, borderRadius: 2, marginHorizontal: 16, marginTop: 6 }}>
      <View style={{ height: 4, backgroundColor: C.acc, borderRadius: 2, width: `${Math.min(100, pct)}%` }} />
    </View>
  );
}

// ─── Timer Ring ──────────────────────────────────────────────
export function TimerRing({ seconds }: { seconds: number }) {
  const C = useColors();
  return (
    <View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: C.s1, borderWidth: 3, borderColor: C.acc, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 16 }}>
      <Text style={{ fontSize: 52, fontWeight: '900', color: C.acc, lineHeight: 56 }}>{seconds}</Text>
      <Text style={{ fontSize: 11, color: C.text2, letterSpacing: 1, marginTop: 2 }}>PAUSA</Text>
    </View>
  );
}

// ─── Set Circle ──────────────────────────────────────────────
export function SetCircle({ n, state }: { n: number | string; state: 'done' | 'current' | 'pending' }) {
  const C = useColors();
  const s = {
    done:    { bg: C.acc,  border: C.acc,  txt: C.black },
    current: { bg: 'transparent', border: C.acc,  txt: C.acc },
    pending: { bg: C.s2,   border: C.s3,   txt: C.text3 },
  }[state];
  return (
    <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: s.bg, borderColor: s.border }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: s.txt }}>{state === 'done' ? '\u2713' : n}</Text>
    </View>
  );
}

// ─── Vuelta Dots ───────────────────────────────────────────────
export function VueltaDots({ total, current }: { total: number; current: number }) {
  const C = useColors();
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

// ─── Loading ────────────────────────────────────────────────────
export function Loading() {
  const C = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <ActivityIndicator color={C.acc} size="large" />
    </View>
  );
}
