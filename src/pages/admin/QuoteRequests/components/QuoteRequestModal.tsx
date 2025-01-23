import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  Upload,
  FileSpreadsheet,
  FileText,
  Image,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatTimeline, formatBudget } from "../../../../lib/utils/formatters";
import type { QuoteRequestWithImages } from "../../../../types";
import * as XLSX from "xlsx"; // Import the xlsx library

interface QuoteRequestModalProps {
  quote: QuoteRequestWithImages;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export function QuoteRequestModal({
  quote,
  onClose,
  onStatusChange,
}: QuoteRequestModalProps) {
  const [localStatus, setLocalStatus] = useState(quote.status);

  // Update local status when the quote prop changes
  useEffect(() => {
    setLocalStatus(quote.status);
  }, [quote.status]);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus); // Update local state
    onStatusChange(quote.id, newStatus); // Notify parent component
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the data for the worksheet
    const rows = [
      ["Quote Request Details"],
      ["Date", new Date(quote.created_at).toLocaleDateString()],
      ["Status", quote.status],
      [""],
      ["Contact Information"],
      ["Name", quote.name],
      ["Email", quote.email],
      ["Phone", quote.phone || "Not provided"],
      [""],
      ["Project Details"],
      ["Timeline", formatTimeline(quote.timeline)],
      ["Budget", formatBudget(quote.budget)],
      ["Notes", quote.notes || "None"],
      [""],
      ["Selected Designs"],
      // Add headers for the designs table
      [
        "Item No.",
        "Item Picture",
        "Item Name",
        "Size (Height)",
        "USD/Unit",
        "Quantity",
        "TOTAL",
        "Remark",
      ],
    ];

    // Add selected designs information
    if (quote.quote_request_images && quote.quote_request_images.length > 0) {
      quote.quote_request_images.forEach((image, index) => {
        rows.push([
          `Design ${index + 1}`, // Item No.
          { f: `HYPERLINK("${image.url}", "${image.url}")` }, // Item Picture (clickable URL)
          image.title || "N/A", // Item Name
          "N/A", // Size (Height) - Replace with actual data if available
          "N/A", // USD/Unit - Replace with actual data if available
          "N/A", // Quantity - Replace with actual data if available
          "N/A", // TOTAL - Replace with actual data if available
          image.notes || "None", // Remark
        ]);
      });
    } else {
      rows.push(["No designs selected"]);
    }

    // Convert the rows to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Apply formatting
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:Z1");
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        // Bold headers (first row)
        if (row === 0) {
          cell.s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        // Alternating row colors for data rows
        if (row > 0 && row % 2 === 0) {
          cell.s = {
            ...cell.s,
            fill: { fgColor: { rgb: "F3F4F6" } },
          };
        }

        // Center-align numeric and hyperlink columns
        if (col === 0 || col === 3 || col === 4 || col === 5 || col === 6) {
          cell.s = {
            ...cell.s,
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        // Hyperlink styling (blue and underlined)
        if (typeof cell.f === "string" && cell.f.includes("HYPERLINK")) {
          cell.s = {
            ...cell.s,
            font: { color: { rgb: "0000FF" }, underline: true },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
          };
        }
      }
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quote Request");
    // Get worksheet range once
    const wsRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1:Z1");

    // Apply styles to all cells
    for (let row = wsRange.s.r; row <= wsRange.e.r; row++) {
      for (let col = wsRange.s.c; col <= wsRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        // Initialize cell style if not exists
        if (!cell.s) cell.s = {};

        // Apply styles based on row content and position
        if (
          rows[row][0] &&
          typeof rows[row][0] === "string" &&
          rows[row][0].includes("Details")
        ) {
          cell.s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center", vertical: "center" },
          };
        } else if (
          row === 0 ||
          (rows[row][0] && rows[row][0].toString().endsWith(":")) ||
          row === 15
        ) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "F3F4F6" } },
          };
        }
        // Alternating row colors for data
        else if (row > 15 && row % 2 === 0) {
          cell.s = {
            fill: { fgColor: { rgb: "F9FAFB" } },
          };
        }

        // Center align specific columns in the designs table
        if (
          row > 15 &&
          (col === 0 || col === 3 || col === 4 || col === 5 || col === 6)
        ) {
          cell.s = {
            ...cell.s,
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        // URL styling
        if (cell.f && cell.f.includes("HYPERLINK")) {
          cell.s = {
            ...cell.s,
            font: { color: { rgb: "0000FF" }, underline: true },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
          };
        }
      }
    }

    // Set column widths after applying styles
    worksheet["!cols"] = [
      { wch: 15 }, // Item No.
      { wch: 50 }, // Item Picture (URL)
      { wch: 30 }, // Item Name
      { wch: 15 }, // Size
      { wch: 15 }, // USD/Unit
      { wch: 15 }, // Quantity
      { wch: 15 }, // Total
      { wch: 40 }, // Remark
    ];

    // Generate the file and trigger download
    const fileName = `quote-request-${quote.id}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20">
          <div className="flex items-center justify-between p-6 border-b border-yellow-400/20">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-yellow-400" />
                Quote Request Details
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Submitted on {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-[#3b0000] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white">{quote.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{quote.email}</p>
                  </div>
                  {quote.phone && (
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {quote.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Timeline</p>
                    <p className="text-white">
                      {formatTimeline(quote.timeline)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-white">{formatBudget(quote.budget)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {quote.notes && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  Additional Notes
                </h3>
                <p className="text-white bg-[#1f1f1f] rounded-lg p-4 break-words whitespace-pre-wrap overflow-auto max-h-40 border border-yellow-400/20">
                  {quote.notes}
                </p>
              </div>
            )}

            {/* Selected Images */}
            {quote.quote_request_images &&
              quote.quote_request_images.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-yellow-400" />
                    Selected Designs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quote.quote_request_images.map((image) => (
                      <div
                        key={image.id}
                        className="bg-[#1f1f1f] rounded-lg overflow-hidden border border-yellow-400/20"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={
                              image.url ? image.url : image.gallery_images.url
                            }
                            alt={image.title || ""}
                            className="w-full h-full object-cover"
                          />
                          {image.isCustomUpload && (
                            <div className="absolute top-2 left-2 bg-purple-600/80 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              Custom Upload
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-400 mb-2">
                            Design Notes
                          </p>
                          <p className="text-white bg-[#260000] rounded-lg p-3 text-sm break-words whitespace-pre-wrap overflow-auto max-h-40 border border-yellow-400/20">
                            {image.notes || "No notes provided"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Status Section */}
          <div className="flex items-center justify-between p-6 border-t border-yellow-400/20 bg-[#1f1f1f]">
            <div className="flex items-center gap-6">
              <StatusBadge status={localStatus} />
              <select
                value={localStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-[#260000] text-white border border-yellow-400/20 rounded-lg px-3 py-1.5 mr-4 focus:outline-none focus:border-yellow-400/50"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg transition-colors border border-green-500/30"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm font-medium">Export to Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
