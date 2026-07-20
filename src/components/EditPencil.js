import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function EditPencil({ onPress, light = false, size = 11 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.btn}
      activeOpacity={0.6}
    >
      <Text
        style={[
          styles.icon,
          light ? styles.iconLight : styles.iconDark,
          { fontSize: size },
        ]}
      >
        ✎
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginLeft: 5,
  },
  icon: {
    fontWeight: '400',
  },
  iconDark: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  iconLight: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
