import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../utils/ThemeContext';

// Animating an SVG prop needs an Animated-aware version of the component.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// A ring that fills to `progress` (0-1), with whatever you pass in at its
// centre.
export default function ProgressRing({
  progress,
  size = 92,
  thickness = 9,
  trackColor,
  fillColor,
  children,
}) {
  const { colors } = useTheme();

  // Callers on a colored card need different stroke colors to the default.
  const track = trackColor ?? colors.dot;
  const fill_ = fillColor ?? colors.accent;

  // Stroke geometry: the circumference is the "full" dash, and we reveal it by
  // shortening the gap.
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: progress,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      // strokeDashoffset isn't a transform or an opacity, so this one has to
      // run on the JS thread.
      useNativeDriver: false,
    }).start();
  }, [progress, fill]);

  const offset = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      {/* Rotated so the ring starts at 12 o'clock instead of 3. */}
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fill_}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={[styles.centre, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: { transform: [{ rotate: '-90deg' }] },
  centre: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
