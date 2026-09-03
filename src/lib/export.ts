import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportToPDF = (data: any[], filename: string, title: string) => {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30)
  
  const columns = Object.keys(data[0] || {})
  const rows = data.map(item => Object.values(item))
  
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] } // Azul oscuro
  })
  
  doc.save(`${filename}.pdf`)
}

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const generateReport = (ventas: any[], devoluciones: any[], recargas: any[]) => {
  const reportData = {
    fecha: new Date().toLocaleDateString(),
    resumen: {
      total_ventas: ventas.length,
      total_devoluciones: devoluciones.length,
      total_recargas: recargas.length,
      monto_ventas: ventas.reduce((sum, v) => sum + (v.total || 0), 0)
    },
    ventas: ventas.map(v => ({
      fecha: v.fecha,
      producto: v.productos?.nombre || 'N/A',
      cantidad: v.cantidad,
      total: v.total,
      cliente: v.cliente || 'N/A'
    })),
    devoluciones: devoluciones.map(d => ({
      fecha: d.fecha,
      producto: d.productos?.nombre || 'N/A',
      cantidad: d.cantidad,
      motivo: d.motivo
    })),
    recargas: recargas.map(r => ({
      fecha: r.fecha,
      producto: r.productos?.nombre || 'N/A',
      cantidad: r.cantidad,
      proveedor: r.proveedor || 'N/A'
    }))
  }
  
  return reportData
}