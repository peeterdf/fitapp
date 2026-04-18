import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { radius } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { getYouTubeId, getYouTubeThumb } from '../data/utils';
import { VideoModal } from './VideoModal';

interface Props {
  youtube?: string;
  imageUri?: string;
  fallbackEmoji?: string;
  compact?: boolean;
}

export function MediaThumbnail({ youtube, imageUri, fallbackEmoji = '💪', compact = false }: Props) {
  const C = useColors();
  const [videoOpen, setVideoOpen] = useState(false);
  const ytId = getYouTubeId(youtube || '');

  if (ytId) {
    return (
      <>
        <TouchableOpacity onPress={() => setVideoOpen(true)} activeOpacity={0.85}>
          <View style={[{ borderRadius: radius.md, overflow: 'hidden', marginBottom: 14, backgroundColor: C.s1 }, compact && styles.compact]}>
            <Image source={{ uri: getYouTubeThumb(ytId) }} style={[styles.img, compact && styles.compactImg]} resizeMode="cover" />
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <VideoModal visible={videoOpen} youtubeId={ytId} onClose={() => setVideoOpen(false)} />
      </>
    );
  }

  if (imageUri) {
    return (
      <View style={[{ borderRadius: radius.md, overflow: 'hidden', marginBottom: 14, backgroundColor: C.s1 }, compact && styles.compact]}>
        <Image source={{ uri: imageUri }} style={[styles.img, compact && styles.compactImg]} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={[{ height: 160, backgroundColor: C.s1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, compact && styles.compactFallback]}>
      <Text style={{ fontSize: compact ? 32 : 64 }}>{fallbackEmoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', aspectRatio: 16 / 9 },
  compact: { width: 52, height: 52, marginBottom: 0, borderRadius: 10 },
  compactImg: { width: 52, height: 52, aspectRatio: undefined },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(232,255,71,0.9)', alignItems: 'center', justifyContent: 'center', paddingLeft: 4 },
  playIcon: { fontSize: 22, color: '#0f0f0f' },
  compactFallback: { width: 52, height: 52, borderRadius: 10, marginBottom: 0 },
});
