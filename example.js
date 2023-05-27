import {
	scrapeVessel,
} from './index.js'

const costaFavolosaIMO = '9479852'

console.log('Costa Favolo:', await scrapeVessel(costaFavolosaIMO))
