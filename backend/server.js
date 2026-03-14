const app = require('./app');
const { ensureRuntimeDirectories, startTempCleanupJob } = require('./utils/fileStorage');

const PORT = process.env.PORT || 5000;

ensureRuntimeDirectories();
startTempCleanupJob();

app.listen(PORT, () => {
  console.log(`PDF XinoConvert backend running on http://localhost:${PORT}`);
});
