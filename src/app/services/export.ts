import * as XLSX from "xlsx";

export function createExcelBuffer(
    data: Record<string, any>[],
    sheetName = "Sheet1",
    headerRows: (string | number | boolean | null)[][] = [],
): ArrayBuffer {
    const wb = XLSX.utils.book_new();
    const ws = headerRows.length > 0
        ? XLSX.utils.aoa_to_sheet(headerRows)
        : XLSX.utils.json_to_sheet(data);

    if (headerRows.length > 0) {
        XLSX.utils.sheet_add_json(ws, data, {
            origin: headerRows.length,
            skipHeader: false,
        });
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const buffer = XLSX.write(wb, {
        type: "buffer",
        bookType: "xlsx",
    });

    return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
    );
}