# PDF XinoConvert

Aplicação web completa para conversão, manipulação e digitalização de documentos com foco em quatro fluxos principais:

- Imagem para PDF
- PDF para Imagens
- Comprimir PDF
- Escanear Documento

O projeto foi estruturado como monorepo com frontend em React + Vite + Tailwind CSS e backend em Node.js + Express.

O frontend agora fica separado em `frontend/` como código-fonte, e o deploy estático do GitHub Pages é gerado em `docs/`.

## Visão geral

O sistema entrega:

- interface moderna, responsiva e pronta para uso em desktop e mobile
- upload com drag and drop
- reordenação de imagens antes da geração do PDF
- conversão de PDF em imagens com download individual ou em ZIP
- compactação de PDF com níveis baixa, média e alta
- digitalização de documentos via scanner local (bridge) com fallback manual
- preview das páginas digitalizadas com reordenação, rotação, recorte e remoção
- exportação das páginas escaneadas em PDF, JPG, PNG e PDF comprimido
- progresso de upload/processamento e feedback visual
- histórico temporário da sessão no frontend
- limpeza automática de arquivos temporários no backend

## Stack utilizada

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- dnd-kit para reordenação por drag and drop
- Lucide React para ícones

### Backend

- Node.js
- Express
- Multer
- pdf-lib
- pdfjs-dist
- @napi-rs/canvas
- Archiver
- Helmet
- express-rate-limit
- sanitize-filename

## Estrutura do projeto

```text
.
├─ backend/
│  ├─ controllers/
│  ├─ routes/
│  ├─ services/
│  ├─ utils/
│  ├─ uploads/
│  ├─ temp/
│  ├─ app.js
│  └─ server.js
├─ docs/
│  ├─ index.html
│  ├─ css/
│  ├─ js/
│  ├─ assets/
│  └─ .nojekyll
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ scanner/
│  │  ├─ services/
│  │  └─ utils/
│  ├─ index.html
│  └─ vite.config.js
├─ .nojekyll
├─ package.json
└─ README.md
```

## Como rodar localmente

### Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior

### Instalação

Na raiz do projeto, execute:

```bash
npm install
```

Esse comando instalará as dependências do monorepo e dos workspaces `frontend` e `backend`.

### Variáveis de ambiente

Crie os arquivos `.env` a partir dos exemplos abaixo, se quiser personalizar portas ou origem do frontend:

- `backend/.env.example`
- `frontend/.env.example`

Exemplo backend:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Exemplo frontend:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Se não configurar `VITE_API_BASE_URL`, o Vite usa proxy para `/api` e `/temp-files` durante o desenvolvimento.

Para scanner:

- `VITE_SCANNER_PROVIDER=bridge`: usa serviço local real (recomendado em desktop)
- `VITE_SCANNER_PROVIDER=mock`: usa provider mock para testes de UI
- `VITE_SCANNER_BRIDGE_URL`: URL do bridge local (ex.: `http://127.0.0.1:24833`)

### Ambiente de desenvolvimento

Na raiz do projeto:

```bash
npm run dev
```

Serviços padrão:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`

### Build do frontend

```bash
npm run build
```

### Build para GitHub Pages

```bash
npm run build:pages
```

Esse comando gera a versão estática final em `docs/`, com:

- `docs/index.html`
- `docs/css/`
- `docs/js/`
- `docs/assets/`
- `docs/.nojekyll`

O backend não participa desse deploy.

### Deploy automático com GitHub Actions

O repositório agora inclui um workflow em `.github/workflows/deploy-pages.yml`.

Também inclui um workflow de validação em `.github/workflows/validate-pr.yml`.

Fluxo:

- em pull requests para `main` ou `master`, o workflow de validação instala dependências e executa `npm run build:pages` sem publicar
- dispara a cada push em `main` ou `master`
- instala dependências com `npm ci`
- executa `npm run build:pages`
- publica automaticamente a pasta `docs/` no GitHub Pages

Para ativar no GitHub:

1. abra `Settings > Pages`
2. em `Source`, selecione `GitHub Actions`
3. faça push na branch principal

URL esperada de publicação:

- `https://helioasjunior.github.io/pdf-xino-convert/`

### Rodar apenas o backend

```bash
npm run start
```

## Rotas da API

### `POST /api/image-to-pdf`

Recebe múltiplas imagens e gera um único PDF.

Campos esperados:

- `images`: múltiplos arquivos
- `orientation`: `portrait` ou `landscape`
- `pageSize`: `A4`, `Letter` ou `Legal`
- `margin`: margem em pontos
- `imageFit`: `contain`, `cover` ou `stretch`
- `compressImages`: `true` ou `false`

### `POST /api/pdf-to-images`

Recebe um PDF e retorna JSON com:

- quantidade de páginas
- lista de URLs das imagens geradas
- URL do ZIP com todas as páginas

Campos esperados:

- `pdf`: arquivo PDF
- `format`: `png` ou `jpg`

### `POST /api/compress-pdf`

Recebe um PDF e retorna o arquivo compactado para download.

Campos esperados:

- `pdf`: arquivo PDF
- `level`: `low`, `medium` ou `high`

O backend também responde cabeçalhos com:

- tamanho original
- tamanho final
- percentual de redução

## Digitalização de documentos (scanner)

### Arquitetura desacoplada

A funcionalidade de scanner foi separada em módulos para facilitar manutenção e troca de provedor:

- UI de scanner:
	- `frontend/src/pages/ScanDocumentPage.jsx`
	- `frontend/src/components/ScannerStatusPanel.jsx`
	- `frontend/src/components/ScannedPageCard.jsx`
- Serviço de scanner:
	- `frontend/src/scanner/scannerService.js`
- Adaptadores de provedor:
	- `frontend/src/scanner/providers/ScannerProvider.js` (contrato)
	- `frontend/src/scanner/providers/LocalBridgeScannerProvider.js`
	- `frontend/src/scanner/providers/MockScannerProvider.js`
- Utilitários de imagem/PDF:
	- `frontend/src/scanner/utils/scannedPageUtils.js`
	- `frontend/src/scanner/utils/scannerOptions.js`

### Contrato `ScannerProvider`

O contrato base expõe os métodos:

- `listDevices()`
- `connect(deviceId)`
- `scan(options)`
- `cancel()`
- `getStatus()`

Isso permite trocar o provedor no futuro sem reescrever a UI.

### Integração com bridge local (SDK real)

O provider `LocalBridgeScannerProvider` espera um serviço local HTTP com os endpoints:

- `GET /status`
- `GET /devices`
- `POST /connect`
- `POST /scan`
- `POST /cancel`

Formato esperado de resposta em `/scan`:

- `pages`: array com `{ base64, mimeType, name }`
- `status`: objeto de status da digitalização

Validações recomendadas no bridge:

- validar `deviceId`, `dpi`, `paperSize`, `colorMode`, `source`, `duplex`
- limitar tamanho máximo por página e total por job
- rejeitar formatos de saída não permitidos
- sanitizar erros antes de retornar ao frontend (sem stack trace)

### Fluxo da tela `Escanear Documento`

1. verifica disponibilidade do scanner/local bridge
2. exibe estado amigável quando indisponível e orienta fallback
3. lista dispositivos e conecta ao scanner selecionado
4. digitaliza com progresso e tratamento de cancelamento
5. salva páginas temporariamente em memória no frontend
6. permite reordenar, rotacionar, recortar e remover páginas
7. exporta para PDF, JPG, PNG e PDF comprimido

### Teste local sem SDK

Para testar UI completa sem scanner real:

1. configure `VITE_SCANNER_PROVIDER=mock` em `frontend/.env`
2. rode `npm run dev`
3. acesse `/escanear-documento`
4. execute digitalizações simuladas e valide os fluxos de exportação

## Observações técnicas importantes

### GitHub Pages

O frontend foi ajustado para publicação em:

- `https://helioasjunior.github.io/pdf-xino-convert/`

Compatibilidade aplicada:

- build do Vite apontando para `docs/`
- assets gerados com caminhos relativos (`./css/...`, `./js/...`)
- roteamento SPA com `HashRouter`, evitando erro 404 no GitHub Pages
- arquivo `docs/.nojekyll` incluído no artefato de publicação
- workflow do GitHub Actions para deploy automático a cada push na branch principal

Observação importante:

- o GitHub Pages publica apenas o frontend estático
- para que as funções de API continuem operando após publicar, defina `VITE_API_BASE_URL` apontando para um backend hospedado fora do GitHub Pages antes de rodar o build

### Compressão de PDF

A compactação foi implementada sem dependência de binários externos, para facilitar execução local no Windows. O fluxo funciona assim:

- renderiza cada página do PDF como imagem
- recompõe um novo PDF usando qualidade e escala conforme o nível escolhido

Isso torna a compressão funcional e portátil, mas é um processo com perda visual, especialmente em nível `high`.

### Arquivos temporários

- uploads são salvos temporariamente no backend
- resultados intermediários ficam em `backend/temp`
- há limpeza automática periódica para evitar acúmulo

## Scripts disponíveis

Na raiz:

- `npm run dev`: sobe frontend e backend juntos
- `npm run build`: gera o build do frontend
- `npm run build:pages`: gera o frontend estático em `docs/` para GitHub Pages
- `npm run preview:pages`: abre o preview local do frontend
- `npm run start`: sobe o backend em modo produção

No frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`

No backend:

- `npm run dev`
- `npm run start`

## Requisitos atendidos

- estrutura separada por componentes e serviços
- páginas dedicadas para as quatro ferramentas
- upload com drag and drop
- preview de arquivos
- reordenação de imagens
- download automático ao concluir em geração e compactação
- geração de ZIP para imagens extraídas
- feedback de erro e sucesso
- barra de progresso de upload
- código modular com responsabilidades distribuídas
- arquitetura de scanner desacoplada com provider mock e bridge local

## Próximos aprimoramentos possíveis

- autenticação e área privada por usuário
- persistência de histórico em banco de dados
- fila assíncrona para arquivos maiores
- tema escuro
- deploy com Docker e proxy reverso


## Uso Gratuito

O serviço está disponível gratuitamente em: https://helioasjunior.github.io/pdf-xino-convert/