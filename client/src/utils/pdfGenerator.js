import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Centralized utility for generating professional PDF reports
 * @param {Object} options 
 * @param {string} options.title - Report title
 * @param {Array} options.columns - Table columns [{ header: 'Name', dataKey: 'name' }]
 * @param {Array} options.data - Table data rows
 * @param {string} options.filename - Output filename
 * @param {Object} options.stats - Optional KPI stats to display at the top
 */
export const generatePDFReport = ({ title, columns, data, filename, stats }) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString("en-IN");

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text("ZERV", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Administration Management System", 14, 26);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated on: ${timestamp}`, 140, 20);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 32, 196, 32);

  // --- Title ---
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.text(title, 14, 45);

  // --- Stats Section (Optional) ---
  let startY = 55;
  if (stats) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray-500
    
    let currentX = 14;
    Object.entries(stats).forEach(([key, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${key}:`, currentX, startY);
      doc.setFont(undefined, 'normal');
      const valText = String(value);
      doc.text(valText, currentX + doc.getTextWidth(`${key}: `), startY);
      currentX += 60; // Space between stats
    });
    startY += 10;
  }

  // --- Table ---
  autoTable(doc, {
    columns: columns,
    body: data,
    startY: startY,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81] // Gray-700
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Gray-50
    },
    margin: { top: 30 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount} - ZERV Admin Report`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
  });

  // --- Save ---
  doc.save(`${filename || 'report'}_${Date.now()}.pdf`);
};
