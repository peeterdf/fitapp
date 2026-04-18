import { SafeAreaView } from 'react-native-safe-area-context';
import NewRehabScreen from '../src/screens/NewRehabScreen';
import { useColors } from '../src/contexts/ThemeContext';
export default function Page() {
  const C = useColors();
  return <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}><NewRehabScreen /></SafeAreaView>;
}
