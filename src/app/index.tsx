import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
import { TextEditor } from "../components/TextEditor";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 100,
      }}
    >
      <Text>Hello World</Text>
      <TextEditor />
    </View>
  );
}
