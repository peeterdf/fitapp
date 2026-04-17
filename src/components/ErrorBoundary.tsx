import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { C, font, radius } from '../data/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root-level error boundary.
 * Catches any unhandled render error from child screens and shows a
 * safe fallback instead of a blank/crashed app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In development this still surfaces the red-box overlay.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.subtitle}>
            Ocurrió un error inesperado. Podés intentar volver a la pantalla anterior.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.devBox}>
              <Text style={styles.devTitle}>Error (solo visible en desarrollo):</Text>
              <Text style={styles.devText}>{this.state.error.message}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={this.handleReset} activeOpacity={0.8}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: font.xxl, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: font.md, color: C.text2, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  devBox: {
    backgroundColor: C.s1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 24,
    alignSelf: 'stretch',
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  devTitle: { fontSize: font.xs, color: '#ff4444', fontWeight: '700', marginBottom: 4 },
  devText: { fontSize: font.xs, color: C.text2, fontFamily: 'monospace' },
  btn: {
    backgroundColor: C.acc,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  btnText: { fontSize: font.md, fontWeight: '800', color: '#0f0f0f' },
});
