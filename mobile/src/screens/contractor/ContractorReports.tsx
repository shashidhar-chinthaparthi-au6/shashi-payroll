import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, useTheme, Chip, Button, TextInput, DataTable } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUI } from '../../contexts/ThemeContext';
import { contractorAPI } from '../../utils/api';

interface ReportData {
  id: string;
  title: string;
  type: string;
  period: string;
  amount: number;
  status: string;
  createdAt: string;
}

const ContractorReports: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, showToast } = useUI();

  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all',
    period: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      showLoader(true);
      
      // Mock data for now - replace with actual API call
      const mockReports: ReportData[] = [
        {
          id: '1',
          title: 'Monthly Invoice Report',
          type: 'invoice',
          period: 'January 2025',
          amount: 45000,
          status: 'paid',
          createdAt: '2025-01-15',
        },
        {
          id: '2',
          title: 'Attendance Summary',
          type: 'attendance',
          period: 'January 2025',
          amount: 0,
          status: 'completed',
          createdAt: '2025-01-14',
        },
        {
          id: '3',
          title: 'Payment History',
          type: 'payment',
          period: 'December 2024',
          amount: 42000,
          status: 'paid',
          createdAt: '2024-12-31',
        },
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.log('Error loading reports:', error);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
      showLoader(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      default: return theme.colors.onSurface;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return 'file-document';
      case 'attendance': return 'clock';
      case 'payment': return 'cash';
      default: return 'file';
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter.type !== 'all' && report.type !== filter.type) return false;
    if (filter.status !== 'all' && report.status !== filter.status) return false;
    return true;
  });

  const ReportCard = ({ report }: { report: ReportData }) => (
    <Card style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleContainer}>
            <MaterialCommunityIcons 
              name={getTypeIcon(report.type)} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Title style={[styles.reportTitle, { color: theme.colors.onSurface }]}>
              {report.title}
            </Title>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(report.status) }]}
            textStyle={{ color: 'white' }}
          >
            {report.status}
          </Chip>
        </View>
        
        <View style={styles.reportDetails}>
          <Paragraph style={[styles.reportPeriod, { color: theme.colors.onSurface }]}>
            Period: {report.period}
          </Paragraph>
          {report.amount > 0 && (
            <Paragraph style={[styles.reportAmount, { color: theme.colors.primary }]}>
              ₹{report.amount.toLocaleString()}
            </Paragraph>
          )}
          <Paragraph style={[styles.reportDate, { color: theme.colors.onSurface }]}>
            Created: {new Date(report.createdAt).toLocaleDateString()}
          </Paragraph>
        </View>

        <View style={styles.reportActions}>
          <Button mode="outlined" compact style={styles.actionButton}>
            View
          </Button>
          <Button mode="outlined" compact style={styles.actionButton}>
            Download
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>
          Reports & Analytics
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          View your reports and analytics
        </Paragraph>
      </View>

      {/* Filter Section */}
      <Card style={[styles.filterCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.filterTitle, { color: theme.colors.onSurface }]}>
            Filters
          </Title>
          <View style={styles.filterRow}>
            <Chip
              selected={filter.type === 'all'}
              onPress={() => setFilter({ ...filter, type: 'all' })}
              style={styles.filterChip}
            >
              All Types
            </Chip>
            <Chip
              selected={filter.type === 'invoice'}
              onPress={() => setFilter({ ...filter, type: 'invoice' })}
              style={styles.filterChip}
            >
              Invoices
            </Chip>
            <Chip
              selected={filter.type === 'attendance'}
              onPress={() => setFilter({ ...filter, type: 'attendance' })}
              style={styles.filterChip}
            >
              Attendance
            </Chip>
            <Chip
              selected={filter.type === 'payment'}
              onPress={() => setFilter({ ...filter, type: 'payment' })}
              style={styles.filterChip}
            >
              Payments
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="file-document" size={24} color={theme.colors.primary} />
            <Title style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {reports.length}
            </Title>
            <Paragraph style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Total Reports
            </Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="cash" size={24} color="#4CAF50" />
            <Title style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {reports.filter(r => r.status === 'paid').length}
            </Title>
            <Paragraph style={[styles.statLabel, { color: theme.colors.onSurface }]}>
              Paid Reports
            </Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Reports List */}
      <View style={styles.reportsList}>
        {filteredReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </View>

      {/* Generate New Report */}
      <Card style={[styles.generateCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.generateTitle, { color: theme.colors.onSurface }]}>
            Generate New Report
          </Title>
          <Paragraph style={[styles.generateDescription, { color: theme.colors.onSurface }]}>
            Create custom reports for your work and payments
          </Paragraph>
          <Button 
            mode="contained" 
            style={styles.generateButton}
            onPress={() => console.log('Generate new report')}
          >
            Generate Report
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  filterCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  reportsList: {
    paddingHorizontal: 16,
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  reportDetails: {
    marginBottom: 12,
  },
  reportPeriod: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  generateCard: {
    margin: 16,
    elevation: 2,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  generateDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  generateButton: {
    alignSelf: 'flex-start',
  },
});

export default ContractorReports;