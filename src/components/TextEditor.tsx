// Polyfill must be imported first to avoid tentap-editor import errors

import {
  CoreBridge,
  LinkBridge,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  useBridgeState,
  useEditorBridge,
} from "@10play/tentap-editor";
import React, { useEffect, useMemo, useState } from "react";
import type { ViewStyle } from "react-native";
import { Platform, Text, View } from "react-native";

export const TextEditor: React.FC<any> = (props) => {
  const {
    initialContent = "<p>Hello World</p>",
    placeholder,
    autofocus = false,
    avoidIosKeyboard = true,
    editable = false,
    width = "100%",
    height,
    minHeight = 100,
    dynamicHeight = true,
    backgroundColor = "transparent",
    padding = 16,
    editorWrapperStyle,
    textColor = "#000000",
    fontSize = 16,
    fontWeight = "400",
    lineHeight = 24,
    fontFamily = "Inter",
    linkColor = "#000000",
    linkUnderline = true,
    testID,
    onContentChange,
    onFocusChange,
    accessible,
    accessibilityActions,
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole,
  } = props;

  const combinedCSS = `
      html, body {
        background-color: ${backgroundColor} !important;
        margin: 0;
        padding: 0;
      } 
      .ProseMirror {
        background-color: ${backgroundColor} !important;
        color: ${textColor} !important;
        font-size: ${fontSize}px !important;
        font-weight: ${fontWeight} !important;
        ${lineHeight ? `line-height: ${lineHeight}px !important;` : ""}
        ${fontFamily ? `font-family: ${fontFamily} !important;` : ""}
        min-height: 100%;
      }
      .ProseMirror p {
        color: ${textColor} !important;
        font-size: ${fontSize}px !important;
        font-weight: ${fontWeight} !important;
        ${lineHeight ? `line-height: ${lineHeight}px !important;` : ""}
        ${fontFamily ? `font-family: ${fontFamily} !important;` : ""}
        margin: 0;
        padding: 0;
      }
      .ProseMirror a {
        color: ${linkColor} !important;
        text-decoration: ${linkUnderline ? "underline" : "none"} !important;
        cursor: pointer;
      }
      .ProseMirror a:hover {
        text-decoration: underline !important;
        opacity: 0.8;
      }
    `;

  const [isLoading, setIsLoading] = useState(true);
  const isAndroidAndEditable = Platform.OS === "android" && editable;

  const editor = useEditorBridge({
    autofocus,
    avoidIosKeyboard,
    initialContent,
    editable,
    dynamicHeight: isAndroidAndEditable ? true : dynamicHeight,
    webviewBaseURL: "about:blank",
    onChange: () => {
      if (onContentChange) {
        editor.getHTML().then((html) => {
          onContentChange(html);
        });
      }
    },
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: placeholder || "",
      }),
      LinkBridge.configureExtension({ openOnClick: true }),
      CoreBridge.configureCSS(combinedCSS),
    ],
  });

  const editorState = useBridgeState(editor);
  const { isFocused, isReady } = editorState;
  console.log("isReady", isReady);

  useEffect(() => {
    if (isReady && isLoading) {
      setIsLoading(false);
    }
  }, [isReady, isLoading]);

  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  const containerStyle = useMemo<ViewStyle>(
    () =>
      ({
        flex: 1,
        width,
        backgroundColor,
        ...(height !== undefined && !isAndroidAndEditable ? { height } : {}),
      } as ViewStyle),
    [backgroundColor, width, height, isAndroidAndEditable]
  );

  const editorWrapperStyleMemo = useMemo<ViewStyle>(
    () =>
      ({
        flex: 1,
        padding,
        minHeight,
        backgroundColor,
        ...editorWrapperStyle,
      } as ViewStyle),
    [padding, minHeight, backgroundColor, editorWrapperStyle]
  );

  const accessibilityProps = useMemo(
    () => ({
      accessible,
      accessibilityActions,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
    }),
    [
      accessible,
      accessibilityActions,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
    ]
  );

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {isLoading && (
        <View>
          <Text>Loading...</Text>
        </View>
      )}
      <View style={[editorWrapperStyleMemo, { backgroundColor: "red" }]}>
        <RichText
          editor={editor}
          onError={(e) => {
            if (__DEV__) {
              console.warn("Tentap webview error", e?.nativeEvent);
            }
          }}
          onHttpError={(e) => {
            if (__DEV__) {
              console.warn("Tentap webview http error", e?.nativeEvent);
            }
          }}
        />
      </View>
    </View>
  );
};
