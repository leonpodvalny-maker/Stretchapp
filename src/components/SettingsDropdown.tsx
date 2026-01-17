import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';

interface SettingsDropdownProps {
  onClose: () => void;
  onNavigate: (screen: keyof RootStackParamList) => void;
}

export default function SettingsDropdown({ onClose, onNavigate }: SettingsDropdownProps) {
  const { translate } = useLanguage();

  return (
    <View style={styles.dropdown}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          onNavigate('MyTrainings');
          onClose();
        }}
      >
        <Text style={styles.menuText}>{translate('myTrainings')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          onNavigate('Calendar');
          onClose();
        }}
      >
        <Text style={styles.menuText}>{translate('calendar')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          onNavigate('Settings');
          onClose();
        }}
      >
        <Text style={styles.menuText}>{translate('settings')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 200,
    zIndex: 1000,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
