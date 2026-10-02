import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

const StatusBadge = ({ label, type = 'status' }) => {
  let backgroundColor = '#E2E8F0';
  let textColor = '#334155';

  switch (label) {
    // Item Types
    case 'Lost':
      backgroundColor = colors.badgeLostBg;
      textColor = colors.badgeLost;
      break;
    case 'Found':
      backgroundColor = colors.badgeFoundBg;
      textColor = colors.badgeFound;
      break;

    // Item & Claim Statuses
    case 'Active':
      backgroundColor = '#D1FAE5';
      textColor = '#065F46';
      break;
    case 'Pending':
      backgroundColor = colors.warningBg;
      textColor = '#B45309';
      break;
    case 'Approved':
    case 'Claimed':
      backgroundColor = '#DBEAFE';
      textColor = '#1E40AF';
      break;
    case 'Rejected':
      backgroundColor = colors.dangerBg;
      textColor = colors.danger;
      break;
    case 'Cancelled':
      backgroundColor = '#F1F5F9';
      textColor = '#64748B';
      break;
    case 'Resolved':
      backgroundColor = '#F3E8FF';
      textColor = '#6B21A8';
      break;
    default:
      backgroundColor = '#F1F5F9';
      textColor = '#475569';
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatusBadge;
