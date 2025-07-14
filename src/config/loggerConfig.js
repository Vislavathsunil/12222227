// Logger Configuration
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const loggerConfig = {
  level: LogLevel.DEBUG,
  format: '[{level}] {timestamp}: {message}',
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 1000,
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
};

export default loggerConfig;

export const LogColors = {
  [LogLevel.DEBUG]: '#6B7280',
  [LogLevel.INFO]: '#3B82F6',
  [LogLevel.WARN]: '#F59E0B',
  [LogLevel.ERROR]: '#EF4444'
};