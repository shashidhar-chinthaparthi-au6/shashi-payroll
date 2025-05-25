import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform, Image } from 'react-native';
import { Card, Button, Portal, Modal, Text, ActivityIndicator } from 'react-native-paper';
import { DocumentStatusCard, DocumentStatus } from '../../components/profile/DocumentStatusCard';
import { profileAPI } from '../../services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Document {
  _id: string;
  type: string;
  fileName: string;
  filePath: string;
  status: DocumentStatus;
  uploadedAt: string;
}

const DOCUMENT_TYPES = [
  {
    type: 'government_id',
    title: 'Government ID',
    description: 'Valid government-issued photo ID (Passport, Driver\'s License)',
    required: true,
  },
  {
    type: 'address_proof',
    title: 'Address Proof',
    description: 'Recent utility bill or bank statement showing current address',
    required: true,
  },
  {
    type: 'educational_certificate',
    title: 'Educational Certificates',
    description: 'Highest degree or relevant certifications',
    required: true,
  },
  {
    type: 'professional_certificate',
    title: 'Professional Certifications',
    description: 'Industry-specific certifications and licenses',
    required: false,
  },
];

const isImageFile = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};

const getImageUrl = (filePath: string) => {
  // Remove any leading slashes and prepend your server URL
  // Also handle absolute paths from backend
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  // Find the uploads part and everything after
  const match = filePath.match(/uploads[\/\\].*/);
  const relativePath = match ? match[0].replace(/\\/g, '/') : filePath.replace(/^\/+/, '');
  return `http://192.168.0.101:5000/${relativePath}`;
};

export const DocumentManagementScreen: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (documentType: string) => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Create FormData with proper file object
      const formData = new FormData();
      
      // Handle file differently for web and mobile
      if (Platform.OS === 'web') {
        // For web, we need to fetch the file and create a Blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('document', blob, file.name);
      } else {
        // For mobile, we can use the file object directly
        formData.append('document', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      }
      
      formData.append('type', documentType);

      // Log the FormData for debugging
      console.log('Uploading document:', {
        type: documentType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.mimeType,
        platform: Platform.OS,
      });

      await profileAPI.uploadDocument(formData, documentType);

      // Fetch updated documents list
      const response = await profileAPI.getDocuments();
      setDocuments(response.data);

      // If preview is open for this doc type, update selectedDocument
      if (previewVisible && selectedDocument && selectedDocument.type === documentType) {
        const updatedDoc = response.data.find((doc: Document) => doc.type === documentType);
        if (updatedDoc) setSelectedDocument(updatedDoc);
      }

      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (document: Document) => {
    try {
      setSelectedDocument(document);
      setPreviewVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview document');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const url = `http://192.168.0.101:5000/api/employees/documents/${document._id}/download`;
      if (Platform.OS === 'web') {
        // For web: fetch as blob and trigger browser download
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = blobUrl;
        a.download = document.fileName;
        window.document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
        Alert.alert('Success', 'Document downloaded successfully');
        return;
      } else {
        // For mobile: use FileSystem
        const response = await profileAPI.downloadDocument(document._id);
        const fileUri = FileSystem.documentDirectory + document.fileName;
        await FileSystem.writeAsStringAsync(fileUri, response.data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Alert.alert('Success', 'Document downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
      Alert.alert('Error', 'Failed to download document. Please try again.');
    }
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
    setSelectedDocument(null);
  };

  const noop = () => {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      {DOCUMENT_TYPES.map((docType) => {
        const existingDoc = documents.find(doc => doc.type === docType.type);
        if (existingDoc) {
          return (
            <DocumentStatusCard
              key={docType.type}
              title={docType.title}
              status={existingDoc.status as any}
              onPreview={() => handlePreview(existingDoc)}
              onDownload={() => handleDownload(existingDoc)}
              onUpload={() => handleUpload(docType.type)}
              required={docType.required}
            />
          );
        } else {
          // No document uploaded yet
          return (
            <DocumentStatusCard
              key={docType.type}
              title={docType.title}
              status="not_uploaded"
              onUpload={() => handleUpload(docType.type)}
              onPreview={noop}
              required={docType.required}
            />
          );
        }
      })}

      <Portal>
        <Modal
          visible={previewVisible}
          onDismiss={handleClosePreview}
          contentContainerStyle={styles.modal}
        >
          {selectedDocument && (
            <View>
              <Text style={styles.modalTitle}>
                {DOCUMENT_TYPES.find(dt => dt.type === selectedDocument.type)?.title}
              </Text>
              <Text style={styles.modalDescription}>
                {DOCUMENT_TYPES.find(dt => dt.type === selectedDocument.type)?.description}
              </Text>
              <Text style={styles.modalStatus}>
                Status: {selectedDocument.status}
              </Text>
              <Text style={styles.modalInfo}>
                Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
              </Text>
              {isImageFile(selectedDocument.fileName) ? (
                <Image
                  source={{ uri: getImageUrl(selectedDocument.filePath) }}
                  style={{ width: 250, height: 250, resizeMode: 'contain', alignSelf: 'center', marginVertical: 12 }}
                />
              ) : (
                <Text style={{ textAlign: 'center', marginVertical: 12 }}>
                  No preview available for this file type.
                </Text>
              )}
              <Button
                mode="contained"
                onPress={() => handleDownload(selectedDocument)}
                style={styles.modalButton}
              >
                Download
              </Button>
              <Button
                mode="outlined"
                onPress={handleClosePreview}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      {uploading && (
        <Portal>
          <Modal
            visible={uploading}
            dismissable={false}
            contentContainerStyle={styles.modal}
          >
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.uploadingText}>Uploading document...</Text>
            </View>
          </Modal>
        </Portal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
    color: '#888',
  },
  modalInfo: {
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
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
  },
}); 