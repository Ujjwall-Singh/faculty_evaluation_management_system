import React, { useState } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel, FaFileCsv, FaFileAlt } from 'react-icons/fa';

const DataExport = ({ onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDataType, setSelectedDataType] = useState('reviews');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const dataTypes = [
    { value: 'reviews', label: 'Faculty Reviews', icon: FaFileAlt },
    { value: 'users', label: 'User Data', icon: FaFileAlt },
    { value: 'analytics', label: 'Analytics Report', icon: FaFileAlt },
    { value: 'audit', label: 'Audit Logs', icon: FaFileAlt }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document', icon: FaFilePdf },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FaFileExcel },
    { value: 'csv', label: 'CSV File', icon: FaFileCsv }
  ];

  const handleExport = () => {
    const exportData = {
      dataType: selectedDataType,
      format: selectedFormat,
      dateRange,
      startDate: dateRange === 'custom' ? customStartDate : null,
      endDate: dateRange === 'custom' ? customEndDate : null
    };

    if (onExport) {
      onExport(exportData);
    }
  };

  const getFormatIcon = (format) => {
    const formatObj = formats.find(f => f.value === format);
    const IconComponent = formatObj?.icon || FaFileAlt;
    return <IconComponent />;
  };

  return (
    <div className="data-export">
      <div className="export-header">
        <h3><FaDownload /> Data Export</h3>
        <p>Export system data in various formats</p>
      </div>

      <div className="export-form">
        {/* Data Type Selection */}
        <div className="form-section">
          <h4>Select Data Type</h4>
          <div className="data-type-grid">
            {dataTypes.map(type => (
              <div
                key={type.value}
                className={`data-type-card ${selectedDataType === type.value ? 'selected' : ''}`}
                onClick={() => setSelectedDataType(type.value)}
              >
                <type.icon className="data-type-icon" />
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="form-section">
          <h4>Select Format</h4>
          <div className="format-grid">
            {formats.map(format => (
              <div
                key={format.value}
                className={`format-card ${selectedFormat === format.value ? 'selected' : ''}`}
                onClick={() => setSelectedFormat(format.value)}
              >
                <format.icon className="format-icon" />
                <span>{format.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="form-section">
          <h4>Date Range</h4>
          <div className="date-range-options">
            <label>
              <input
                type="radio"
                value="all"
                checked={dateRange === 'all'}
                onChange={(e) => setDateRange(e.target.value)}
              />
              All Time
            </label>
            <label>
              <input
                type="radio"
                value="today"
                checked={dateRange === 'today'}
                onChange={(e) => setDateRange(e.target.value)}
              />
              Today
            </label>
            <label>
              <input
                type="radio"
                value="week"
                checked={dateRange === 'week'}
                onChange={(e) => setDateRange(e.target.value)}
              />
              Last Week
            </label>
            <label>
              <input
                type="radio"
                value="month"
                checked={dateRange === 'month'}
                onChange={(e) => setDateRange(e.target.value)}
              />
              Last Month
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={dateRange === 'custom'}
                onChange={(e) => setDateRange(e.target.value)}
              />
              Custom Range
            </label>
          </div>

          {dateRange === 'custom' && (
            <div className="custom-date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Preview */}
        <div className="form-section">
          <h4>Export Preview</h4>
          <div className="export-preview">
            <div className="preview-item">
              <span className="preview-label">Data Type:</span>
              <span className="preview-value">
                {dataTypes.find(type => type.value === selectedDataType)?.label}
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Format:</span>
              <span className="preview-value">
                {getFormatIcon(selectedFormat)}
                {formats.find(format => format.value === selectedFormat)?.label}
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Date Range:</span>
              <span className="preview-value">
                {dateRange === 'custom' 
                  ? `${customStartDate} to ${customEndDate}` 
                  : dateRange.charAt(0).toUpperCase() + dateRange.slice(1)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="export-actions">
          <button 
            className="btn-primary export-btn" 
            onClick={handleExport}
            disabled={dateRange === 'custom' && (!customStartDate || !customEndDate)}
          >
            <FaDownload /> Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
