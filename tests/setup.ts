// Jest setup file
global.console = {
  ...console,
  // Suppress console.error during tests unless explicitly needed
  error: jest.fn(),
  warn: jest.fn(),
  log: console.log,
  info: console.info,
  debug: console.debug,
};

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
