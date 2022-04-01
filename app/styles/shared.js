import React from 'react';
import { StyleSheet, Platform } from 'react-native';
module.exports = {
 ...StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F6F6F6',
    },
    baseText: { fontSize: 14 },
    icon: { },
    dropShadow: {
      elevation: 3,
      shadowColor: "#000000",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: {
        height: 2,
        width: 0
      },
    },
  }),
  fonts: {
    PT_SANS: {
      400: {
        fontFamily: 'PT Sans',
        fontWeight: 'normal',
      },
      700: {
        fontFamily: 'PT Sans',
        fontWeight: 'bold'
      }
    },
    ADELLE: {
      300: {
        fontFamily: 'Adelle',
        fontWeight: '300'
      },
      400: {
        fontFamily: 'Adelle',
        fontWeight: 'normal',
      },
      700: {
        fontFamily: 'Adelle',
        fontWeight: 'bold',
      },
      ...Platform.select({
        ios: {
          900: {
            fontFamily: 'Adelle',
            fontWeight: '900'
          },
        },
        android: {
          900: {
            fontFamily: 'Adelle Extra',
            fontWeight: '900'
          },
        }
      })
    }
  }
};
