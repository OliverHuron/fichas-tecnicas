import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Genera un PDF a partir de nodos DOM que representan hojas de la ficha
// (cada uno del tamaño real de una hoja: 210mm x 270mm). Se usa un tamaño de
// página propio en vez de A4 estándar para que no haya que estirar/recortar
// nada — el PDF queda idéntico a la vista previa en pantalla.
export async function exportFichaPdf(elements, filename) {
  const pdf = new jsPDF({ unit: 'mm', format: [210, 270] });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage([210, 270], 'p');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 270);
  }

  pdf.save(filename);
}
