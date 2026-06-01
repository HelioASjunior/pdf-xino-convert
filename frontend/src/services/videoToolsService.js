const CORE_VERSION = '0.12.10';
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const FFMPEG_PACKAGE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm';
const FFMPEG_WORKER_SOURCE_URL = `${FFMPEG_PACKAGE_BASE_URL}/worker.js`;
const FFMPEG_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js';
const FFMPEG_UTIL_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js';

const VIDEO_OUTPUT_FORMATS = {
  mp4: {
    extension: 'mp4',
    mimeType: 'video/mp4',
    args: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'],
  },
  webm: {
    extension: 'webm',
    mimeType: 'video/webm',
    args: ['-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-crf', '33', '-b:v', '0', '-c:a', 'libopus'],
  },
  mov: {
    extension: 'mov',
    mimeType: 'video/quicktime',
    args: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k'],
  },
  avi: {
    extension: 'avi',
    mimeType: 'video/x-msvideo',
    args: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'mp3', '-b:a', '128k'],
  },
  gif: {
    extension: 'gif',
    mimeType: 'image/gif',
    isGif: true,
  },
};

let ffmpegInstance = null;
let ffmpegLoadPromise = null;
let activeProgressHandler = null;
let ffmpegModulesPromise = null;
let classWorkerURLPromise = null;

function fileBaseName(fileName) {
  return fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function loadFfmpegModules() {
  if (ffmpegModulesPromise) {
    return ffmpegModulesPromise;
  }

  ffmpegModulesPromise = Promise.all([
    import(/* @vite-ignore */ FFMPEG_MODULE_URL),
    import(/* @vite-ignore */ FFMPEG_UTIL_URL),
  ]).then(([ffmpegModule, utilModule]) => ({
    FFmpeg: ffmpegModule.FFmpeg,
    fetchFile: utilModule.fetchFile,
    toBlobURL: utilModule.toBlobURL,
  }));

  return ffmpegModulesPromise;
}

async function getClassWorkerURL() {
  if (classWorkerURLPromise) {
    return classWorkerURLPromise;
  }

  classWorkerURLPromise = (async () => {
    const response = await fetch(FFMPEG_WORKER_SOURCE_URL);

    if (!response.ok) {
      throw new Error('Não foi possível carregar o worker do FFmpeg.');
    }

    const source = await response.text();
    const rewritten = source
      .replace(/from\s+"\.\//g, `from "${FFMPEG_PACKAGE_BASE_URL}/`)
      .replace(/from\s+'\.\//g, `from '${FFMPEG_PACKAGE_BASE_URL}/`);

    return URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }));
  })();

  return classWorkerURLPromise;
}

async function loadFfmpeg() {
  if (ffmpegLoadPromise) {
    return ffmpegLoadPromise;
  }

  ffmpegLoadPromise = (async () => {
    const { FFmpeg, toBlobURL } = await loadFfmpegModules();
    const ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
      if (typeof activeProgressHandler === 'function') {
        activeProgressHandler(progress);
      }
    });

    const coreURL = await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');
    const classWorkerURL = await getClassWorkerURL();

    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL });
    ffmpegInstance = ffmpeg;

    return ffmpeg;
  })();

  return ffmpegLoadPromise;
}

export const VIDEO_OUTPUT_OPTIONS = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'mov', label: 'MOV' },
  { value: 'avi', label: 'AVI' },
  { value: 'gif', label: 'GIF (animado)' },
];

export async function convertVideoFiles(files, options, onProgress) {
  if (!files.length) {
    throw new Error('Adicione pelo menos um arquivo de vídeo para converter.');
  }

  const { fetchFile } = await loadFfmpegModules();
  const ffmpeg = ffmpegInstance || await loadFfmpeg();
  const targetFormat = options?.targetFormat || 'mp4';
  const format = VIDEO_OUTPUT_FORMATS[targetFormat];

  if (!format) {
    throw new Error(`Formato de saída não suportado: ${targetFormat}`);
  }

  const converted = [];
  const failed = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const inputName = safeName(`input-${index}-${file.name}`);
    const outputName = safeName(`${fileBaseName(file.name)}.${format.extension}`);

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      activeProgressHandler = (fileProgress) => {
        if (typeof onProgress !== 'function') {
          return;
        }

        const completed = index / files.length;
        const current = (1 / files.length) * Number(fileProgress || 0);
        onProgress(Math.round((completed + current) * 100));
      };

      if (format.isGif) {
        await ffmpeg.exec([
          '-i', inputName,
          '-filter_complex',
          '[0:v]fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[out]',
          '-map', '[out]',
          '-loop', '0',
          outputName,
        ]);
      } else {
        await ffmpeg.exec(['-i', inputName, ...format.args, outputName]);
      }

      const data = await ffmpeg.readFile(outputName);
      converted.push({
        originalName: file.name,
        fileName: outputName,
        blob: new Blob([data], { type: format.mimeType }),
      });

      await ffmpeg.deleteFile(outputName);
    } catch (error) {
      failed.push({
        fileName: file.name,
        reason: error?.message || 'Falha ao converter o arquivo.',
      });
    } finally {
      activeProgressHandler = null;
      await ffmpeg.deleteFile(inputName).catch(() => {});

      if (typeof onProgress === 'function') {
        onProgress(Math.round(((index + 1) / files.length) * 100));
      }
    }
  }

  return { converted, failed };
}
