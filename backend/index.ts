import { ServiceBroker, ServiceSchema } from 'moleculer'
import notesService from './services/notes.service'
import usersService from './services/users.service'
import apiGateway from './api-gateway'
import config from './moleculer.config'

const broker = new ServiceBroker(config)

broker.createService(notesService as ServiceSchema)
broker.createService(usersService as ServiceSchema)
broker.createService(apiGateway)

broker.start().catch(err => {
  console.error('Broker error:', err)
  process.exit(1)
})

process.on('SIGINT', () => {
  broker.stop()
})
