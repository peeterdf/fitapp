import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../data/theme';

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
              source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;background:#000}iframe{width:100%;height:100vh;border:0}</style></head><body><iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0" allowfullscreen allow="autoplay;encrypted-media"></iframe></body></html>`, baseUrl: 'https://www.youtube.com' }}
              style={styles.video}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
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
