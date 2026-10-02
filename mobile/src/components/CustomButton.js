import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../utils/colors';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  let buttonBg = colors.primary;
  let textColor = colors.textLight;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    buttonBg = colors.secondary;
    textColor = '#FFFFFF';
  } else if (variant === 'danger') {
    buttonBg = colors.danger;
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    buttonBg = 'transparent';
    textColor = colors.primary;
    borderColor = colors.primary;
  } else if (variant === 'ghost') {
    buttonBg = 'transparent';
    textColor = colors.textSecondary;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: buttonBg, borderColor },
        variant === 'outline' && styles.outlineBorder,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
    flexDirection: 'row',
  },
  outlineBorder: {
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;
