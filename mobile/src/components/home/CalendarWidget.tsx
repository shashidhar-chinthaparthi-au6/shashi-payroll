import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Event = {
  _id: string;
  title: string;
  date: string;
  type: 'holiday' | 'leave' | 'meeting';
};

type Props = {
  events: Event[];
};

const CalendarWidget = ({ events }: Props) => {
  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'holiday':
        return 'beach';
      case 'leave':
        return 'calendar-clock';
      case 'meeting':
        return 'account-group';
      default:
        return 'calendar';
    }
  };

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'holiday':
        return '#4CAF50';
      case 'leave':
        return '#2196F3';
      case 'meeting':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {events.map((event) => (
        <View key={event._id} style={styles.eventItem}>
          <Icon
            name={getEventIcon(event.type)}
            size={24}
            color={getEventColor(event.type)}
            style={styles.icon}
          />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default CalendarWidget; 