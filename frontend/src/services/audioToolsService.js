const CORE_VERSION = '0.12.10';
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const FFMPEG_PACKAGE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm';
const FFMPEG_WORKER_SOURCE_URL = `${FFMPEG_PACKAGE_BASE_URL}/worker.js`;
const FFMPEG_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js';
const FFMPEG_UTIL_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js';

const OUTPUT_FORMATS = {
  mp3: {
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    codecArgs: ['-c:a', 'libmp3lame'],
  },
  wav: {
    extension: 'wav',
    mimeType: 'audio/wav',
    codecArgs: ['-c:a', 'pcm_s16le'],
  },
  ogg: {
    extension: 'ogg',
    mimeType: 'audio/ogg',
    codecArgs: ['-c:a', 'libvorbis'],
  },
  flac: {
    extension: 'flac',
    mimeType: 'audio/flac',
    codecArgs: ['-c:a', 'flac'],
  },
  aac: {
    extension: 'aac',
    mimeType: 'audio/aac',
    codecArgs: ['-c:a', 'aac'],
  },
  m4a: {
    extension: 'm4a',
    mimeType: 'audio/mp4',
    codecArgs: ['-c:a', 'aac', '-movflags', '+faststart'],
  },
  mp4: {
    extension: 'mp4',
    mimeType: 'video/mp4',
    codecArgs: ['-c:a', 'aac', '-movflags', '+faststart'],
  },
  opus: {
    extension: 'opus',
    mimeType: 'audio/ogg',
    codecArgs: ['-c:a', 'libopus'],
  },
};

const LOSSY_OUTPUTS = new Set(['mp3', 'ogg', 'aac', 'm4a', 'mp4', 'opus']);

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

function getOutputConfig(format) {
  return OUTPUT_FORMATS[format] || OUTPUT_FORMATS.mp3;
}

function getBitrateArg(format, bitrateKbps) {
  if (!bitrateKbps || !LOSSY_OUTPUTS.has(format)) {
    return [];
  }

  return ['-b:a', `${bitrateKbps}k`];
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

export const AUDIO_OUTPUT_OPTIONS = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'ogg', label: 'OGG' },
  { value: 'flac', label: 'FLAC' },
  { value: 'aac', label: 'AAC' },
  { value: 'm4a', label: 'M4A' },
  { value: 'mp4', label: 'MP4' },
  { value: 'opus', label: 'OPUS' },
];

export async function convertAudioFiles(files, options, onProgress) {
  if (!files.length) {
    throw new Error('Adicione pelo menos um arquivo de áudio para converter.');
  }

  const { fetchFile } = await loadFfmpegModules();
  const ffmpeg = ffmpegInstance || await loadFfmpeg();
  const targetFormat = options?.targetFormat || 'mp3';
  const bitrate = Number(options?.bitrate) || null;
  const output = getOutputConfig(targetFormat);
  const converted = [];
  const failed = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const inputName = safeName(`input-${index}-${file.name}`);
    const outputName = safeName(`${fileBaseName(file.name)}.${output.extension}`);

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

      await ffmpeg.exec([
        '-i',
        inputName,
        '-vn',
        ...output.codecArgs,
        ...getBitrateArg(targetFormat, bitrate),
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      converted.push({
        originalName: file.name,
        fileName: outputName,
        blob: new Blob([data], { type: output.mimeType }),
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

  return {
    converted,
    failed,
  };
}
