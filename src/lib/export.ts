import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportToPDF = (data: any[] | any, filename: string, title: string) => {
  const doc = new jsPDF()
  
  // Agregar logo en la parte superior izquierda
  const logoImage = '/logo.png'
  try {
    doc.addImage(logoImage, 'PNG', 10, 10, 30, 30)
  } catch (error) {
    console.log('No se pudo cargar el logo, continuando sin él')
  }
  
  doc.setFontSize(18)
  doc.text(title, 50, 25)
  doc.setFontSize(11)
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 50, 35)
  
  // Handle object data (from generateReport) - reporte completo con cuadros separados
  if (!Array.isArray(data)) {
    let currentY = 50
    
    // Cuadro de Ventas
    if (data.ventas && data.ventas.length > 0) {
      doc.setFillColor(34, 197, 94) // Verde
      doc.rect(14, currentY, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('VENTAS', 18, currentY + 6)
      
      currentY += 12
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      
      const ventasColumns = Object.keys(data.ventas[0] || {})
      const ventasRows = data.ventas.map((item: any) => Object.values(item))
      
      autoTable(doc, {
        head: [ventasColumns],
        body: ventasRows as any[][],
        startY: currentY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] }
      })
      
      currentY = (doc as any).lastAutoTable.finalY + 10
    }
    
    // Cuadro de Devoluciones
    if (data.devoluciones && data.devoluciones.length > 0) {
      doc.setFillColor(249, 115, 22) // Naranja
      doc.rect(14, currentY, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('DEVOLUCIONES', 18, currentY + 6)
      
      currentY += 12
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      
      const devolucionesColumns = Object.keys(data.devoluciones[0] || {})
      const devolucionesRows = data.devoluciones.map((item: any) => Object.values(item))
      
      autoTable(doc, {
        head: [devolucionesColumns],
        body: devolucionesRows as any[][],
        startY: currentY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [249, 115, 22] }
      })
      
      currentY = (doc as any).lastAutoTable.finalY + 10
    }
    
    // Cuadro de Recargas
    if (data.recargas && data.recargas.length > 0) {
      doc.setFillColor(168, 85, 247) // Púrpura
      doc.rect(14, currentY, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('RECARGAS', 18, currentY + 6)
      
      currentY += 12
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      
      const recargasColumns = Object.keys(data.recargas[0] || {})
      const recargasRows = data.recargas.map((item: any) => Object.values(item))
      
      autoTable(doc, {
        head: [recargasColumns],
        body: recargasRows as any[][],
        startY: currentY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [168, 85, 247] }
      })
    }
    
    doc.save(`${filename}.pdf`)
    return
  }
  
  // Handle array data
  if (data.length === 0) {
    doc.text('No hay datos para exportar', 14, 50)
    doc.save(`${filename}.pdf`)
    return
  }
  
  const columns = Object.keys(data[0] || {})
  const rows = data.map(item => Object.values(item))
  
  autoTable(doc, {
    head: [columns],
    body: rows as any[][],
    startY: 50,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] } // Azul oscuro
  })
  
  doc.save(`${filename}.pdf`)
}

export const exportToExcel = (data: any[] | any, filename: string) => {
  // Handle object data (from generateReport)
  if (!Array.isArray(data)) {
    const workbook = XLSX.utils.book_new()
    
    if (data.ventas && data.ventas.length > 0) {
      const ventasSheet = XLSX.utils.json_to_sheet(data.ventas)
      XLSX.utils.book_append_sheet(workbook, ventasSheet, 'Ventas')
    }
    
    if (data.devoluciones && data.devoluciones.length > 0) {
      const devolucionesSheet = XLSX.utils.json_to_sheet(data.devoluciones)
      XLSX.utils.book_append_sheet(workbook, devolucionesSheet, 'Devoluciones')
    }
    
    if (data.recargas && data.recargas.length > 0) {
      const recargasSheet = XLSX.utils.json_to_sheet(data.recargas)
      XLSX.utils.book_append_sheet(workbook, recargasSheet, 'Recargas')
    }
    
    if (workbook.SheetNames.length === 0) {
      XLSX.writeFile(workbook, `${filename}.xlsx`)
      return
    }
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    return
  }
  
  // Handle array data
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
      vendedor: v.vendedor || 'N/A'
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