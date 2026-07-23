import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Animated, Image, StyleSheet, Easing } from 'react-native';

// ⭐ Use the same image for ALL stacks
import MainMoneyStack from '../../assets/MainMoneyStack.png';


export default function CashStack({ onRef, miniOnly = false }) {
  const stackRefs = {
    1: useRef(null),
    5: useRef(null),
    20: useRef(null),
    100: useRef(null),
  };

  const pickClosest = (amount) => {
    const denoms = [1, 5, 20, 100];
    return denoms.reduce((prev, curr) =>
      Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev
    );
  };

  if (onRef) {
    onRef({
      deduct: (amount) => {
        const denom = pickClosest(amount);
        stackRefs[denom]?.current?.flyOff();
      },
    });
  }

  // ⭐ Idle rocking animation for big stack
  const idleRock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (miniOnly) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(idleRock, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleRock, {
          toValue: -1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleRock, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [miniOnly]);

  const idleRotate = idleRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  return (
    <View style={styles.container}>
      {!miniOnly && (
        <Animated.Image
          source={MainMoneyStack}
          style={[
            styles.bigStackImage,
            { transform: [{ rotateZ: idleRotate }] },
          ]}
        />
      )}

      <View style={styles.miniRow}>
        <MiniStack ref={stackRefs[1]} />
        <MiniStack ref={stackRefs[5]} />
        <MiniStack ref={stackRefs[20]} />
        <MiniStack ref={stackRefs[100]} />
      </View>
    </View>
  );
}

/* MINI STACK COMPONENT */
const MINI_SCALE = 0.8;

const MiniStack = forwardRef((props, ref) => {
  const flyAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    flyOff: () => {
      Animated.timing(flyAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => flyAnim.setValue(0));
    },
  }));

  const flyStyle = {
    transform: [
      {
        translateY: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120 * MINI_SCALE],
        }),
      },
      {
        rotateZ: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-25deg'],
        }),
      },
      {
        scale: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.6],
        }),
      },
    ],
    opacity: flyAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <View style={miniStyles.wrapper}>
      {/* ⭐ Only ONE image needed — the top bill animates */}
      <Animated.Image
        source={MainMoneyStack}
        style={[miniStyles.billImage, flyStyle]}
      />
    </View>
  );
});

/* STYLES */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bigStackImage: {
    width: 260,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  miniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 260 * MINI_SCALE,
    marginTop: -10 * MINI_SCALE,
  },
});

const miniStyles = StyleSheet.create({
  wrapper: {
    width: 60 * MINI_SCALE,
    height: 90 * MINI_SCALE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },

  billImage: {
    width: 190 * MINI_SCALE,
    height: 90 * MINI_SCALE,
    resizeMode: 'contain',
    position: 'absolute',
  },
});
