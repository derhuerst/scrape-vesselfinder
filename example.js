import {
	scrapeVessel,
	scrapeVesselWeather,
} from './index.js'

const costaFavolosaIMO = '9479852'
const costaFavolosaMMSI = '247311100'

console.log('Costa Favolo:', await scrapeVessel(costaFavolosaIMO))
console.log('Costa Favolo weather:', await scrapeVesselWeather(costaFavolosaMMSI))