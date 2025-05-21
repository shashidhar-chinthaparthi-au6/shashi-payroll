import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Portal, Modal, Text } from 'react-native-paper';
import { DocumentStatusCard, DocumentStatus } from '../../components/profile/DocumentStatusCard';

interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  description: string;
  required: boolean;
}

export const DocumentManagementScreen: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documents: Document[] = [
    {
      id: '1',
      title: 'Government ID',
      status: 'verified',
      description: 'Valid government-issued photo ID (Passport, Driver\'s License)',
      required: true,
    },
    {
      id: '2',
      title: 'Address Proof',
      status: 'pending',
      description: 'Recent utility bill or bank statement showing current address',
      required: true,
    },
    {
      id: '3',
      title: 'Educational Certificates',
      status: 'rejected',
      description: 'Highest degree or relevant certifications',
      required: true,
    },
    {
      id: '4',
      title: 'Professional Certifications',
      status: 'pending',
      description: 'Industry-specific certifications and licenses',
      required: false,
    },
  ];

  const handleUpload = (document: Document) => {
    try {
      // TODO: Implement document upload functionality
      console.log('Upload document:', document.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const handlePreview = (document: Document) => {
    try {
      setSelectedDocument(document);
      setPreviewVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview document');
    }
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
    setSelectedDocument(null);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => setError(null)}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.header}>
        <Card.Content>
          <Text style={styles.headerTitle}>Required Documents</Text>
          <Text style={styles.headerSubtitle}>
            Please upload all required documents for verification
          </Text>
        </Card.Content>
      </Card>

      {documents.map((doc) => (
        <DocumentStatusCard
          key={doc.id}
          title={doc.title}
          status={doc.status}
          onUpload={() => handleUpload(doc)}
          onPreview={() => handlePreview(doc)}
        />
      ))}

      <Portal>
        <Modal
          visible={previewVisible}
          onDismiss={handleClosePreview}
          contentContainerStyle={styles.modal}
        >
          {selectedDocument && (
            <View>
              <Text style={styles.modalTitle}>{selectedDocument.title}</Text>
              <Text style={styles.modalDescription}>
                {selectedDocument.description}
              </Text>
              <Text style={styles.modalStatus}>
                Status: {selectedDocument.status}
              </Text>
              <Button
                mode="contained"
                onPress={handleClosePreview}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  modalStatus: {
    fontSize: 14,
    marginBottom: 16,
    color: '#888',
  },
  modalButton: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 