import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../data/theme';
import { getYouTubeEmbed } from '../data/utils';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  youtubeId: string;
  onClose: () => void;
}

export function VideoModal({ visible, youtubeId, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.videoWrap}>
          {visible && (
            <WebView
              source={{ uri: getYouTubeEmbed(youtubeId) }}
              style={styles.video}
              allowsFullscreenVideo
              javaScriptEnabled
              mediaPlaybackRequiresUserAction={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.93)',
    alignItems: 'center', justifyContent: 'center',
  },
  close: {
    position: 'absolute', top: 48, right: 20,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.s1,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeText: { color: C.text, fontSize: 18 },
  videoWrap: {
    width: width - 16,
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: { flex: 1 },
});
