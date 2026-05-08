import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CSVTrainingPanel() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await axios.get('http://localhost:4000/api/ml/training-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Stats error:', error);
      if (error.response?.status === 401) {
        setStats({ error: 'Please login as admin to view stats' });
      } else {
        setStats({ error: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load stats when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  // Existing: Upload to Database (inserts into DB)
  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('csvfile', file);
    
    setUploading(true);
    setResult(null);
    
    try {
      const token = getAuthToken();
      const res = await axios.post('http://localhost:4000/api/ml/upload-csv', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setResult({ success: true, message: res.data.message, imported: res.data.records_imported });
      fetchStats(); // Refresh stats after upload
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setResult({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDirectTrain = async () => {
  if (!file) return;
  
  const formData = new FormData();
  formData.append('csvfile', file);
  
  setUploading(true);
  setResult(null);
  
  try {
    const token = getAuthToken();
    console.log('Token being sent:', token ? 'Yes' : 'No'); // Debug
    
    const res = await axios.post('http://localhost:4000/api/ml/direct-train', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`  // Make sure this line is correct
      }
    });
    
    setResult({ 
      success: true, 
      message: res.data.message, 
      records: res.data.records_used,
      noDB: true 
    });
    fetchStats();
    setFile(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  } catch (error) {
    console.error('Direct Train error:', error);
    console.error('Error response:', error.response); // Debug
    setResult({ 
      success: false, 
      error: error.response?.data?.error || error.message 
    });
  } finally {
    setUploading(false);
  }
};

  const downloadSampleCSV = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:4000/api/ml/sample-csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_training_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download sample CSV. Make sure you are logged in as admin.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🤖 ML Training Data Import
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Upload CSV files to train and improve the ML ranking model. The model will automatically retrain with new data.
      </p>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold mb-3 text-blue-900">📊 Current Training Stats</h3>
        {loading ? (
          <div className="text-blue-700">Loading stats...</div>
        ) : stats?.error ? (
          <div className="text-red-600 text-sm">{stats.error}</div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Bookings</div>
              <div className="text-2xl font-bold text-blue-700">{stats.training_data?.total_bookings || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Reviews</div>
              <div className="text-2xl font-bold text-blue-700">{stats.training_data?.total_reviews || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">ML Samples</div>
              <div className="text-2xl font-bold text-blue-700">{stats.ml_status?.training_samples || 0}</div>
            </div>
            <div>
              <div className="text-gray-500">Model Status</div>
              <div className="text-lg font-semibold text-green-600">
                {stats.ml_status?.is_trained ? '✅ Trained' : '❌ Not Trained'}
              </div>
            </div>
          </div>
        ) : (
          <button onClick={fetchStats} className="text-blue-600 hover:text-blue-800">
            Load Stats
          </button>
        )}
        
        {stats?.ml_status?.weights && (
          <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-700">
            <span className="font-medium">ML Weights:</span> Rating: {stats.ml_status.weights.rating?.toFixed(1)}% | 
            Response: {stats.ml_status.weights.response?.toFixed(1)}% | 
            Volume: {stats.ml_status.weights.volume?.toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Upload CSV File</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex gap-3 mt-3">
          {/* Existing: Upload to Database */}
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading & Training...' : '📤 Upload & Insert to DB'}
          </button>
          
          {/* NEW: Direct Train (No Database) */}
          <button 
            onClick={handleDirectTrain} 
            disabled={!file || uploading}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Training ML...' : '🚀 Direct Train ML (No DB)'}
          </button>
          
          <button 
            onClick={downloadSampleCSV}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            📥 Download Sample CSV
          </button>
        </div>
      </div>
      
      {/* Result Message */}
      {result && (
        <div className={`mb-6 p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
          {result.success ? (
            <div>
              <p className="text-green-800 font-medium">✅ {result.message}</p>
              {result.imported && (
                <p className="text-green-700 text-sm mt-1">Imported {result.imported} records into database. ML model retrained!</p>
              )}
              {result.records && result.noDB && (
                <p className="text-green-700 text-sm mt-1">🎯 Trained with {result.records} CSV records. No database changes!</p>
              )}
            </div>
          ) : (
            <p className="text-red-800">❌ Error: {result.error}</p>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-gray-700">📋 CSV Format Requirements:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li><strong>rating</strong> (required) - Number 1-5</li>
          <li><strong>response_time</strong> (required) - Minutes taken to respond</li>
          <li><strong>review_count</strong> (optional) - Number of reviews</li>
          <li><strong>amount</strong> (optional) - Payment amount</li>
          <li><strong>provider_name</strong> (optional) - Provider name</li>
          <li><strong>success_score</strong> (optional) - 0-1 score</li>
          <li><strong>location, profession</strong> (optional)</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
          <p className="font-semibold text-yellow-800">💡 Two Training Options:</p>
          <p className="text-yellow-700 mt-1">• <strong>Upload & Insert to DB</strong> - Stores data in database (affects analytics)</p>
          <p className="text-yellow-700">• <strong>Direct Train ML (No DB)</strong> - Trains ML directly from CSV (analytics stay clean)</p>
        </div>
      </div>
    </div>
  );
}