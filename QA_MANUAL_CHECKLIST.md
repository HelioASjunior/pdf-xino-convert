# Roteiro de teste manual rápido (5 a 10 minutos)

Objetivo: validar se os fluxos principais do site funcionam do upload ao download após a migração para frontend-only.

## Preparação

1. Executar build local
- npm run build

2. Executar preview local
- npm run preview:frontend -- --host 127.0.0.1 --port 4173

3. Abrir no navegador
- http://127.0.0.1:4173

4. Preparar arquivos de teste
- Use os arquivos gerados em qa-assets/
- Imagens: qa-assets/images/sample-card-1.svg e qa-assets/images/sample-card-2.svg
- PDF: qa-assets/pdf/sample-two-pages.pdf
- DOCX: qa-assets/documents/sample.docx
- Áudio: qa-assets/audio/sample-tone.wav

## Critério geral de aprovação

Aprovado quando:
- A página abre sem erro visual grave
- O upload aceita o arquivo esperado
- O processamento conclui sem erro em tela
- O download é disponibilizado
- O arquivo de saída abre corretamente

Reprovado quando:
- O botão de ação principal não responde
- O processamento trava ou falha sem mensagem clara
- O download não inicia
- O arquivo gerado está corrompido

## Checklist por ferramenta

### 1) Home e navegação principal
Passos:
1. Abrir a Home.
2. Clicar nos links principais: Ferramentas de PDF, Ferramentas de Imagem, Ferramentas de Documentos, Utilitários e Conversor de Áudio.

Esperado:
- Todas as páginas carregam e exibem conteúdo principal.

### 2) Imagem para PDF
Rota: /imagem-para-pdf

Arquivos sugeridos:
- qa-assets/images/sample-card-1.svg
- qa-assets/images/sample-card-2.svg

Passos:
1. Enviar 2 imagens.
2. Reordenar as imagens (se aplicável).
3. Gerar PDF.
4. Baixar resultado.

Esperado:
- PDF é gerado e abre normalmente.
- Ordem das páginas respeita a ordem final escolhida.

### 3) PDF para Imagens
Rota: /pdf-para-imagens

Arquivo sugerido:
- qa-assets/pdf/sample-two-pages.pdf

Passos:
1. Enviar 1 PDF com 2+ páginas.
2. Selecionar formato de saída (PNG ou JPG).
3. Converter e baixar.

Esperado:
- Imagens de todas as páginas são geradas.
- Download ocorre (individual ou ZIP, conforme fluxo).

### 4) Comprimir PDF
Rota: /comprimir-pdf

Arquivo sugerido:
- qa-assets/pdf/sample-two-pages.pdf

Passos:
1. Enviar 1 PDF.
2. Selecionar nível de compressão.
3. Compactar e baixar.

Esperado:
- Arquivo comprimido é gerado.
- PDF final abre corretamente.

### 5) Ferramentas de PDF (central)
Rota: /pdf-tools

Passos:
1. Abrir a página e alternar entre operações (juntar, dividir, rotacionar, remover/extrair, recortar, comprimir).
2. Validar se o painel/controles mudam conforme a operação selecionada.

Esperado:
- Troca de operação funciona sem quebrar UI.
- Controles relevantes aparecem para cada operação.

### 6) Unir PDF
Rota: /unir-pdf

Arquivos sugeridos:
- qa-assets/pdf/sample-single-page.pdf
- qa-assets/pdf/sample-two-pages.pdf

Passos:
1. Verificar carregamento da página e CTA para central de PDF.
2. Ir para a central e executar um teste simples de união com 2 PDFs curtos (se disponível no fluxo atual).

Esperado:
- Navegação coerente entre página dedicada e central.
- União conclui com saída válida.

### 7) Documentos para PDF
Rota: /document-tools

Arquivos sugeridos:
- qa-assets/documents/sample.docx
- qa-assets/documents/sample.txt
- qa-assets/documents/sample.md
- qa-assets/documents/sample.csv
- qa-assets/documents/sample.rtf

Passos:
1. Enviar 1 DOCX simples.
2. Converter para PDF.
3. Baixar resultado.

Esperado:
- Conversão conclui sem erro fatal.
- PDF abre e contém conteúdo legível.

### 8) PDF para Word
Rota: /pdf-para-word

Arquivo sugerido:
- qa-assets/pdf/sample-single-page.pdf

Passos:
1. Enviar 1 PDF simples.
2. Converter para DOCX.
3. Baixar resultado.

Esperado:
- DOCX é gerado e abre.
- Texto principal fica editável.

### 9) Word para PDF
Rota: /word-para-pdf

Arquivo sugerido:
- qa-assets/documents/sample.docx

Passos:
1. Enviar 1 DOCX simples.
2. Converter para PDF.
3. Baixar resultado.

Esperado:
- PDF é gerado e abre normalmente.

### 10) Utilitários (ZIP)
Rota: /utilities

Arquivos sugeridos:
- qa-assets/images/sample-card-1.svg
- qa-assets/pdf/sample-single-page.pdf
- qa-assets/documents/sample.txt

Passos:
1. Enviar múltiplos arquivos pequenos.
2. Gerar ZIP.
3. Baixar e extrair.

Esperado:
- ZIP é gerado com todos os arquivos esperados.

### 11) Conversor de Áudio
Rota: /conversor-audio

Arquivo sugerido:
- qa-assets/audio/sample-tone.wav

Passos:
1. Enviar 1 áudio (MP3 ou WAV).
2. Escolher formato de saída.
3. Converter e baixar.

Esperado:
- Conversão conclui.
- Arquivo convertido reproduz normalmente.

### 12) Escanear Documento
Rota: /escanear-documento

Arquivos sugeridos:
- qa-assets/pdf/sample-two-pages.pdf
- qa-assets/images/sample-card-1.svg
- qa-assets/images/sample-card-2.svg

Passos:
1. Enviar PDF escaneado ou imagens de páginas.
2. Executar ação principal (gerar PDF das imagens ou comprimir PDF escaneado).
3. Baixar resultado.

Esperado:
- Fluxo finaliza sem erro.
- Saída abre corretamente.

## Registro rápido de resultados

Use este modelo para cada item:
- Ferramenta:
- Status: Aprovado ou Reprovado
- Evidência: arquivo gerado, mensagem exibida, comportamento observado
- Observação: passos para reproduzir falha (se houver)

## Riscos conhecidos

- Existe 1 vulnerabilidade alta em `xlsx` sem correção disponível no `npm audit` até o momento.
- Recomenda-se monitorar novas versões da dependência e aplicar atualização quando houver correção oficial.
- Mitigação aplicada: o parse de `XLS/XLSX` roda em `Web Worker` isolado com timeout, reduzindo impacto potencial no fluxo principal da interface.
