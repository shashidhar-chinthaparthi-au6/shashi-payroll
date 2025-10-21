import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useUI } from '../contexts/ThemeContext';

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children, title = 'Client Dashboard' }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useUI();

  const handleLogout = () => {
    dispatch(logout() as any);
    showToast('Logged out successfully', 'success');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title={title} titleStyle={{ color: theme.colors.onPrimary }} />
        <Appbar.Action 
          icon="bell" 
          onPress={() => {/* Handle notifications */}} 
          iconColor={theme.colors.onPrimary}
        />
        <Appbar.Action 
          icon="account-circle" 
          onPress={() => {/* Handle profile */}} 
          iconColor={theme.colors.onPrimary}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {children}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {/* Handle add action */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ClientLayout;
