import loggerConfig from '../config/loggerConfig';

function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return loggerConfig.format
    .replace('{level}', level.toUpperCase())
    .replace('{timestamp}', timestamp)
    .replace('{message}', message);
}

function writeLog(level, message) {
  
  const formatted = formatMessage(level, message);
  let logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
  logs.push(formatted);
  localStorage.setItem('appLogs', JSON.stringify(logs));
}

const logger = {
  info: (msg) => writeLog('info', msg),
  warn: (msg) => writeLog('warn', msg),
  error: (msg) => writeLog('error', msg),
  debug: (msg) => writeLog('debug', msg),
  getLogs: () => JSON.parse(localStorage.getItem('appLogs') || '[]'),
  clearLogs: () => localStorage.removeItem('appLogs'),
};

export default logger;