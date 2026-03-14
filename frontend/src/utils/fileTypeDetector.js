function ext(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
}

export function detectToolSuggestion(file) {
  const extension = ext(file.name);
  const mime = file.type || '';

  if (mime === 'application/pdf' || extension === 'pdf') {
    return {
      category: 'Ferramentas de PDF',
      message: 'Arquivo PDF detectado.',
      suggestions: [
        { label: 'Kit de PDF', href: '/pdf-tools' },
        { label: 'PDF para Imagens', href: '/pdf-para-imagens' },
        { label: 'Comprimir PDF', href: '/comprimir-pdf' },
      ],
    };
  }

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tif', 'tiff', 'svg'].includes(extension)) {
    return {
      category: 'Ferramentas de Imagem',
      message: 'Imagem detectada.',
      suggestions: [
        { label: 'Imagem para PDF', href: '/imagem-para-pdf' },
        { label: 'Converter Formato de Imagem', href: '/image-tools' },
      ],
    };
  }

  if (['doc', 'docx', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'rtf', 'md'].includes(extension)) {
    return {
      category: 'Ferramentas de Documentos',
      message: 'Documento detectado.',
      suggestions: [
        { label: 'Documentos para PDF', href: '/document-tools' },
      ],
    };
  }

  return {
    category: 'Utilitários',
    message: 'Tipo não mapeado automaticamente. Use utilitários para organizar e baixar arquivos.',
    suggestions: [{ label: 'Central de Utilitários', href: '/utilities' }],
  };
}
