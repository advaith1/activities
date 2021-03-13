import { handleRequest } from './bot'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
