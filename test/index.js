import test from 'node:test'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import {
	deepStrictEqual,
	strictEqual,
	ok,
} from 'node:assert'
import {
	scrapeVessel,
	scrapeVesselWeather,
	_parseVesselPage,
} from '../index.js'

const bvgWannseeHtml = readFileSync(
	fileURLToPath(new URL('./bvg-wannsee-2023-05-27T15%3A35%3A45%2B02%3A00.html', import.meta.url)),
	{encoding: 'utf8'},
)
const containerships6Html = readFileSync(
	fileURLToPath(new URL('./containerships-6-2023-05-27T15%3A39%3A59%2B02%3A00.html', import.meta.url)),
	{encoding: 'utf8'},
)
const madickenHtml = readFileSync(
	fileURLToPath(new URL('./madicken-2023-05-27T15%3A43%3A35%2B02%3A00.html', import.meta.url)),
	{encoding: 'utf8'},
)
const costaFavolosaHtml = readFileSync(
	fileURLToPath(new URL('./costa-favolosa-2023-05-27T15%3A45%3A45%2B02%3A00.html', import.meta.url)),
	{encoding: 'utf8'},
)

const costaFavolosaIMO = '9479852'
const costaFavolosaMMSI = '247311100'

test('_parseVesselPage works with BVG\'s "Wannsee"', async (t) => {
	const vessel = await _parseVesselPage(bvgWannseeHtml)
	deepStrictEqual(vessel, {
		// todo: distance/time
		beam: 8,
		callsign: 'DK4902',
		courseOverGround: 132.4,
		currentDraught: null,
		flag: 'Germany',
		imo: null,
		latitude: 52.44495,
		length: 45,
		longitude: 13.15466,
		mmsi: '211627650',
		navigationStatus: 'under way',
		positionReceived: '0 min ago',
		predictedETA: null,
		speedOverGround: 8.2,
	})
})
test('_parseVesselPage works with "Containerships 6"', async (t) => {
	const vessel = await _parseVesselPage(containerships6Html)
	deepStrictEqual(vessel, {
		// todo: distance/time
		beam: 22,
		callsign: 'DABH',
		courseOverGround: 101,
		currentDraught: 7.6,
		flag: 'Germany',
		imo: '9188518',
		latitude: 53.541,
		length: 155,
		longitude: 9.89333,
		mmsi: '211315100',
		navigationStatus: 'under way',
		positionReceived: '0 min ago',
		predictedETA: null,
		speedOverGround: 5.2,
	})
})
test('_parseVesselPage works with "Madicken"', async (t) => {
	const vessel = await _parseVesselPage(madickenHtml)
	deepStrictEqual(vessel, {
		// todo: distance/time
		beam: 13,
		callsign: '5BPY5',
		courseOverGround: 84.8,
		currentDraught: 5.3,
		flag: 'Cyprus',
		imo: '9195755',
		latitude: 53.83913,
		length: 89,
		longitude: 8.88213,
		mmsi: '210090000',
		navigationStatus: 'under way',
		positionReceived: '0 min ago',
		predictedETA: null,
		speedOverGround: 10.8,
	})
})
test('_parseVesselPage works with "Costa Favolosa"', async (t) => {
	const vessel = await _parseVesselPage(costaFavolosaHtml)
	deepStrictEqual(vessel, {
		// todo: distance/time
		beam: 44,
		callsign: 'ICPK',
		courseOverGround: 295.1,
		currentDraught: 8.3,
		flag: 'Italy',
		imo: '9479852',
		latitude: 53.83251,
		length: 290,
		longitude: 8.07988,
		mmsi: '247311100',
		navigationStatus: 'under way',
		positionReceived: '0 min ago',
		predictedETA: null,
		speedOverGround: 15.9,
	})
})

test('scrapeVessel works with "Costa Favolo"', async (t) => {
	const vessel = await scrapeVessel(costaFavolosaIMO)
	
	if (vessel.mmsi !== null) {
		strictEqual(typeof vessel.mmsi, 'string', 'vessel.mmsi must be a string')
		ok(vessel.mmsi, 'vessel.mmsi must not be empty')
	}
	if (vessel.imo !== null) {
		strictEqual(typeof vessel.imo, 'string', 'vessel.imo must be a string')
		ok(vessel.imo, 'vessel.imo must not be empty')
	}
	if (vessel.flag !== null) {
		strictEqual(typeof vessel.flag, 'string', 'vessel.flag must be a string')
		ok(vessel.flag, 'vessel.flag must not be empty')
	}

	// todo: distance/time
	if (vessel.beam !== null) {
		ok(Number.isFinite(vessel.beam))
	}
	if (vessel.length !== null) {
		ok(Number.isFinite(vessel.length))
	}
	if (vessel.callsign !== null) {
		strictEqual(typeof vessel.callsign, 'string', 'vessel.callsign must be a string')
		ok(vessel.callsign, 'vessel.callsign must not be empty')
	}

	if (vessel.courseOverGround !== null) {
		ok(Number.isFinite(vessel.courseOverGround))
	}
	if (vessel.currentDraught !== null) {
		ok(Number.isFinite(vessel.currentDraught))
	}
	if (vessel.speedOverGround !== null) {
		ok(Number.isFinite(vessel.speedOverGround))
	}
	ok(Number.isFinite(vessel.latitude))
	ok(Number.isFinite(vessel.longitude))
	if (vessel.positionReceived !== null) {
		strictEqual(typeof vessel.positionReceived, 'string', 'vessel.positionReceived must be a string')
		ok(vessel.positionReceived, 'vessel.positionReceived must not be empty')
	}

	if (vessel.navigationStatus !== null) {
		strictEqual(typeof vessel.navigationStatus, 'string', 'vessel.navigationStatus must be a string')
		ok(vessel.navigationStatus, 'vessel.navigationStatus must not be empty')
	}
	// todo: vessel.predictedETA
})

test('scrapeVesselWeather works with "Costa Favolo"', async (t) => {
	const weather = await scrapeVesselWeather(costaFavolosaMMSI)
	
	if (weather.windSpeed !== null) {
		ok(Number.isFinite(weather.windSpeed))
	}
	if (weather.windDirection !== null) {
		ok(Number.isFinite(weather.windDirection))
	}
	if (weather.windTemperature !== null) {
		ok(Number.isFinite(weather.windTemperature))
	}
})
