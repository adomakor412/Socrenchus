import React from 'react';
import { StyleSheet } from 'react-native';
import styles from './shared';

module.exports = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: 'gray',
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 0
    },
    margin: 8,
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 3
  },
  cardMissing: {
    margin: 8,
    marginLeft: 12,
    marginRight: 12,
    backgroundColor: '#FFC21F',
    borderRadius: 20,
  },
  rowTitle: {
    color: '#3A3A3A',
    ...styles.fonts.ADELLE[900]
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
