import { View } from "react-native";
import { TextEditor } from "../components/TextEditor";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 100,
      }}
    >
      <TextEditor />
    </View>
  );
}
