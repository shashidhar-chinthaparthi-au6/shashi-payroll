import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Paragraph, useTheme, List, Chip, IconButton, FAB } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { adminAPI } from '../../utils/api';
import { User } from '../../types';

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      showLoader(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.log('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return theme.colors.error;
      case 'client': return theme.colors.primary;
      case 'employee': return theme.colors.secondary;
      case 'contractor': return theme.colors.primary;
      default: return theme.colors.onSurface;
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Title style={[styles.userName, { color: theme.colors.onSurface }]}>
              {item.firstName} {item.lastName}
            </Title>
            <Paragraph style={[styles.userEmail, { color: theme.colors.onSurface }]}>
              {item.email}
            </Paragraph>
          </View>
          <View style={styles.userActions}>
            <Chip
              style={[styles.roleChip, { backgroundColor: getRoleColor(item.role) }]}
              textStyle={{ color: theme.colors.onPrimary }}
            >
              {item.role.toUpperCase()}
            </Chip>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => {/* Handle edit */}}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => {/* Handle delete */}}
              iconColor={theme.colors.error}
            />
          </View>
        </View>
        <View style={styles.userDetails}>
          <Paragraph style={[styles.userDetail, { color: theme.colors.onSurface }]}>
            Phone: {item.phone || 'Not provided'}
          </Paragraph>
          <Paragraph style={[styles.userDetail, { color: theme.colors.onSurface }]}>
            Status: {item.isActive ? 'Active' : 'Inactive'}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              User Management
            </Title>
            <Paragraph style={[styles.headerSubtitle, { color: theme.colors.onSurface }]}>
              Manage system users and their permissions
            </Paragraph>
          </Card.Content>
        </Card>

        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {/* Handle add user */}}
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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleChip: {
    marginRight: 8,
  },
  userDetails: {
    marginTop: 8,
  },
  userDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserManagement;
