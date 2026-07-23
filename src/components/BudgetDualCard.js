import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import MainMoneyStack from '../../assets/MainMoneyStack.png';
import GoldenMoneyStack from '../../assets/GoldenMoneyStack.png';
import EditPencil from './EditPencil';
import { EditBudgetModal } from './BudgetEditModals';
import { useBudget } from '../context/BudgetContext';

const GOLD_THRESHOLD = 75;
const FAIR_THRESHOLD = 50;

const ON_TRACK_STATUS = {
  good: { label: 'Budget Master!', color: '#2a8a2a' },
  fair: { label: 'Still On Track!', lines: ['Budget', 'On Track!'], color: '#d4a017' },
  bad: { label: 'Budget Better!', lines: ['Budget', 'Better!'], color: '#e53e3e' },
};

function getOnTrackStatus(progress) {
  if (progress >= GOLD_THRESHOLD) return ON_TRACK_STATUS.good;
  if (progress >= FAIR_THRESHOLD) return ON_TRACK_STATUS.fair;
  return ON_TRACK_STATUS.bad;
}

// Golden PNG artwork is smaller within the same canvas; scale to match MainMoneyStack visual size.
const GOLD_STACK_SCALE = 996 / 724;

function Sparkles({ stackWidth, stackHeight, intense }) {
  const positions = useMemo(() => [
    { top: stackHeight * 0.05, left: stackWidth * 0.06, size: stackWidth * 0.14 },
    { top: stackHeight * 0.08, right: stackWidth * 0.04, size: stackWidth * 0.1 },
    { top: stackHeight * 0.38, right: stackWidth * 0.02, size: stackWidth * 0.11 },
    { bottom: stackHeight * 0.2, left: stackWidth * 0.04, size: stackWidth * 0.1 },
    { bottom: stackHeight * 0.1, right: stackWidth * 0.06, size: stackWidth * 0.12 },
    ...(intense ? [
      { top: stackHeight * 0.22, left: stackWidth * 0.0, size: stackWidth * 0.09 },
      { bottom: stackHeight * 0.28, right: stackWidth * 0.0, size: stackWidth * 0.08 },
    ] : []),
  ], [stackWidth, stackHeight, intense]);

  return (
    <View style={[styles.sparkleLayer, { width: stackWidth, height: stackHeight }]} pointerEvents="none">
      {positions.map((pos, i) => (
        <Sparkle key={i} style={pos} size={pos.size} delay={i * 180} />
      ))}
    </View>
  );
}

function Sparkle({ style, size, delay }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, scale]);

  const { size: _size, ...position } = style;

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        position,
        {
          fontSize: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
}

function StackImage({ isGold, width, height, fillRatio = 1 }) {
  const idleRock = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(fillRatio)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(idleRock, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(idleRock, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(idleRock, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [idleRock]);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: fillRatio,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fillRatio, fillAnim]);

  const idleRotate = idleRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  const stackScale = isGold ? GOLD_STACK_SCALE : 1;
  const imageWidth = width * stackScale;
  const imageHeight = height * stackScale;

  const clipHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, imageHeight],
  });

  if (isGold) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            { width: imageWidth, height: imageHeight },
            { transform: [{ rotateZ: idleRotate }] },
          ]}
        >
          <Animated.Image
            source={GoldenMoneyStack}
            style={[styles.stackSilhouette, styles.goldStackSilhouette, { width: imageWidth, height: imageHeight }]}
          />
          <Animated.View style={[styles.colorClip, { width: imageWidth, height: clipHeight }]}>
            <Animated.Image
              source={GoldenMoneyStack}
              style={[
                styles.stackColor,
                {
                  width: imageWidth,
                  height: imageHeight,
                  bottom: 0,
                  left: 0,
                },
              ]}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { width: imageWidth, height: imageHeight },
          { transform: [{ rotateZ: idleRotate }] },
        ]}
      >
        <Animated.Image
          source={MainMoneyStack}
          style={[styles.stackSilhouette, { width: imageWidth, height: imageHeight }]}
        />
        <Animated.View style={[styles.colorClip, { width: imageWidth, height: clipHeight }]}>
          <Animated.Image
            source={MainMoneyStack}
            style={[
              styles.stackColor,
              {
                width: imageWidth,
                height: imageHeight,
                bottom: 0,
                left: 0,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function MetricColumn({
  label,
  heroValue,
  footerLabel,
  footerValue,
  footerLines,
  footerColor,
  heroColor,
  isGold,
  showSparkles,
  intenseSparkles,
  budgetFillRatio,
  onEditHero,
  layout,
}) {
  return (
    <View style={styles.column}>
      <View style={[styles.blueSection, {
        height: layout.blueSectionHeight,
        paddingBottom: layout.bluePaddingBottom,
      }]}>
        <Text style={[styles.metricLabel, { fontSize: layout.labelSize }]}>{label}</Text>
        <View style={styles.heroRow}>
          <Text
            style={[styles.heroValue, { fontSize: layout.heroSize }, heroColor && { color: heroColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {heroValue}
          </Text>
          {onEditHero ? <EditPencil onPress={onEditHero} light size={layout.editIconSize} /> : null}
        </View>
      </View>

      <View style={[styles.stackSection, {
        marginTop: layout.stackOverlap,
        minHeight: layout.stackAreaHeight,
      }]}>
        <View style={styles.stackFrame}>
          {showSparkles && (
            <Sparkles
              stackWidth={layout.stackWidth}
              stackHeight={layout.stackHeight}
              intense={intenseSparkles}
            />
          )}
          <StackImage
            isGold={isGold}
            width={layout.stackWidth}
            height={layout.stackHeight}
            fillRatio={budgetFillRatio ?? 1}
          />
        </View>
      </View>

      <View style={[styles.whiteSection, {
        minHeight: layout.whiteSectionHeight,
        paddingVertical: layout.whitePaddingVertical,
      }]}>
        {footerLabel ? (
          <Text style={[styles.footerLabel, { fontSize: layout.footerLabelSize }]}>{footerLabel}</Text>
        ) : null}
        {footerLines ? (
          <View style={styles.stackedFooter}>
            {footerLines.map((line) => (
              <Text
                key={line}
                style={[styles.footerValue, { fontSize: layout.footerSize, color: footerColor }]}
              >
                {line}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={[styles.footerValue, { fontSize: layout.footerSize, color: footerColor }]}>
            {footerValue}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function BudgetDualCard({
  remaining,
  onTrackProgress,
  budget,
  onUpdateBudget: onUpdateBudgetProp,
  isActive = true,
}) {
  const context = useBudget();
  const updateBudget = onUpdateBudgetProp ?? context.updateBudget;
  const [budgetEditVisible, setBudgetEditVisible] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const cardHeight = screenHeight * 0.442 * 0.9 * 0.85;
  const budgetFillRatio = budget > 0
    ? Math.max(0, Math.min(1, remaining / budget))
    : 1;

  const layout = useMemo(() => {
    const scale = cardHeight / 380;
    return {
      labelSize: Math.round(13 * scale),
      heroSize: Math.round(32 * scale),
      footerLabelSize: Math.round(12 * scale),
      footerSize: Math.round(26 * scale),
      stackWidth: Math.round(160 * scale),
      stackHeight: Math.round(110 * scale),
      stackAreaHeight: Math.round(130 * scale),
      stackOverlap: Math.round(-48 * scale),
      bluePaddingBottom: Math.round(52 * scale),
      blueSectionHeight: Math.round(cardHeight * 0.38),
      whiteSectionHeight: Math.round(cardHeight * 0.22 * 0.9),
      whitePaddingVertical: Math.round(16 * scale * 0.9),
      cardBottomGap: Math.round(cardHeight * 0.022),
      dividerHeight: Math.round(cardHeight * 0.9),
      editIconSize: Math.round(10 * scale),
    };
  }, [cardHeight]);

  const onTrackRounded = Math.round(onTrackProgress);
  const onTrackLabel = `${onTrackRounded}%`;
  const onTrackStatus = getOnTrackStatus(onTrackProgress);
  const isHighScore = onTrackRounded >= GOLD_THRESHOLD;
  const onTrackFillRatio = Math.max(0, Math.min(1, onTrackProgress / 100));

  const formatCurrency = (amount) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const budgetFormatted = formatCurrency(budget);
  const remainingFormatted = formatCurrency(remaining);

  return (
    <>
      <View style={[styles.card, { minHeight: cardHeight, marginBottom: -layout.cardBottomGap }]}>
        <MetricColumn
          label="Overall Budget"
          heroValue={budgetFormatted}
          footerLabel="Remaining"
          footerValue={remainingFormatted}
          footerColor="#1a6fd4"
          isGold={false}
          showSparkles={false}
          intenseSparkles={false}
          budgetFillRatio={budgetFillRatio}
          onEditHero={isActive ? () => setBudgetEditVisible(true) : undefined}
          layout={layout}
        />

      <View style={[styles.divider, { height: layout.dividerHeight }]} />

      <MetricColumn
        label="On-Track Progress"
        heroValue={onTrackLabel}
        footerValue={onTrackStatus.label}
        footerLines={onTrackStatus.lines}
        footerColor={onTrackStatus.color}
        heroColor={isHighScore ? '#FFE566' : '#fff'}
        isGold
        showSparkles
        intenseSparkles={isHighScore}
        budgetFillRatio={onTrackFillRatio}
        layout={layout}
      />
      </View>

      <EditBudgetModal
        visible={budgetEditVisible && isActive}
        initialAmount={budget}
        onSave={updateBudget}
        onClose={() => setBudgetEditVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  blueSection: {
    width: '100%',
    backgroundColor: '#1a6fd4',
    paddingTop: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },

  heroValue: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    maxWidth: '100%',
  },

  stackSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    overflow: 'visible',
  },

  stackFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  sparkleLayer: {
    position: 'absolute',
    zIndex: 3,
    overflow: 'visible',
  },

  stackSilhouette: {
    resizeMode: 'contain',
    tintColor: '#B8BEC6',
    opacity: 0.55,
  },

  goldStackSilhouette: {
    tintColor: '#C4A855',
    opacity: 0.45,
  },

  colorClip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  stackColor: {
    resizeMode: 'contain',
    position: 'absolute',
  },

  sparkle: {
    position: 'absolute',
    color: '#FFE566',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 200, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  whiteSection: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLabel: {
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },

  footerValue: {
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },

  stackedFooter: {
    alignItems: 'center',
    width: '100%',
  },

  divider: {
    width: 1,
    alignSelf: 'center',
    backgroundColor: '#dce8f5',
  },
});
