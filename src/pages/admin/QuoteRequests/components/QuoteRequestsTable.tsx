import React from "react";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  Phone,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { QuoteRequestModal } from "./QuoteRequestModal";
import { StatusBadge } from "./StatusBadge";
import { formatTimeline, formatBudget } from "../../../../lib/utils/formatters";
import type { QuoteRequestWithImages } from "../../../../types";
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from "xlsx"; // Import the xlsx library

interface QuoteRequestsTableProps {
  quotes: QuoteRequestWithImages[];
  loading: boolean;
  error: string | null;
  selectedQuote: QuoteRequestWithImages | null;
  onSelectQuote: (quote: QuoteRequestWithImages | null) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCloseModal: () => void;
}

export function QuoteRequestsTable({
  quotes,
  loading,
  error,
  selectedQuote,
  onSelectQuote,
  onStatusChange,
  onDelete,
  onCloseModal,
}: QuoteRequestsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  const handleExportIndividualQuote = (quote: QuoteRequestWithImages) => {
    // Create a new workbook
    const workbook = xlsxUtils.book_new();

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
          {
            f: `HYPERLINK("${
              image?.url ? image?.url : image?.gallery_images?.url
            }", "${image?.url ? image?.url : image?.gallery_images?.url}")`,
          }, // Item Picture (clickable URL)
          image?.notes ? image?.notes : image?.gallery_images?.title || "N/A", // Item Name
          "N/A", // Size (Height) - Replace with actual data if available
          "N/A", // USD/Unit - Replace with actual data if available
          "N/A", // Quantity - Replace with actual data if available
          "N/A", // TOTAL - Replace with actual data if available
          image?.notes ? image?.notes : image?.gallery_images?.title || "None", // Remark
        ]);
      });
    } else {
      rows.push(["No designs selected"]);
    }

    // Convert the rows to a worksheet
    const worksheet = xlsxUtils.aoa_to_sheet(rows);

    // Apply styles to cells
    const range = xlsxUtils.decode_range(worksheet["!ref"] || "A1:Z1");
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = xlsxUtils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        // Initialize cell style if not exists
        if (!cell.s) cell.s = {};

        // Headers (first row of each section)
        if (
          rows[R][0] &&
          typeof rows[R][0] === "string" &&
          rows[R][0].includes("Details")
        ) {
          cell.s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
        // Section headers
        else if (
          R === 0 ||
          (rows[R][0] && rows[R][0].toString().endsWith(":")) ||
          R === 15
        ) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "F3F4F6" } },
          };
        }
        // Alternating row colors for data
        else if (R > 15 && R % 2 === 0) {
          cell.s = {
            fill: { fgColor: { rgb: "F9FAFB" } },
          };
        }

        // Center align specific columns in the designs table
        if (R > 15 && (C === 0 || C === 3 || C === 4 || C === 5 || C === 6)) {
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

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Item No.
      { wch: 50 }, // Item Picture (URL)
      { wch: 30 }, // Item Name
      { wch: 15 }, // Size
      { wch: 15 }, // USD/Unit
      { wch: 15 }, // Quantity
      { wch: 15 }, // Total
      { wch: 40 }, // Remark
    ];
    worksheet["!cols"] = colWidths;

    // Add the worksheet to the workbook
    xlsxUtils.book_append_sheet(workbook, worksheet, "Quote Request");

    // Set column widths
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
    xlsxWriteFile(workbook, fileName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-yellow-400" />
          Quote Requests
        </h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#260000] rounded-lg border border-yellow-400">
          <p className="text-lg">No quote requests yet</p>
          <p className="text-sm">New requests will appear here</p>
        </div>
      ) : (
        <div className="bg-[#260000] rounded-lg border border-yellow-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-400">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="border-b border-yellow-400/20 hover:bg-[#260000]/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {quote.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">{quote.email}</p>
                        {quote.phone && (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {quote.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatTimeline(quote.timeline)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatBudget(quote.budget)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectQuote(quote)}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-[#260000] rounded-lg transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleExportIndividualQuote(quote)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg transition-colors border border-green-500/30"
                          title="Export to Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this quote request?"
                              )
                            ) {
                              onDelete(quote.id);
                            }
                          }}
                          className="p-2 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedQuote && (
        <QuoteRequestModal
          quote={selectedQuote}
          onClose={onCloseModal}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}
