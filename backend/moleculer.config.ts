import type { BrokerOptions } from 'moleculer'

const config = {
  namespace: 'notes-app',
  nodeID: `node-${process.env.NODE_ID || 'local'}`,
  
  logger: true,
  logLevel: 'info',

  transporter: process.env.NATS_URL || 'Fake',

  serializer: 'JSON',

  requestTimeout: 10 * 1000,
  requestRetry: 3,
  requestMaxStatuses: 10,

  maxCallLevel: 100,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,

  tracking: {
    enabled: false,
    shutdownTimeout: 5000,
  },

  disableBalancer: false,

  registry: {
    strategy: 'RoundRobin',
    preferLocal: true,
  },

  bulkhead: {
    enabled: false,
    concurrency: 10,
  },

  validator: true,

  errorHandler: (error: any) => {
    console.error('Error:', error)
    throw error
  },
} as BrokerOptions

export default config
