// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)

import createDebug from 'debug'
import {fetch} from 'cross-fetch'
import {load as loadHtml} from 'cheerio'
import {parsers as fieldParsers} from './lib/parse.js'
const pkg = require('./package.json')

const VESSEL_BASE_URL = `\
https://www.vesselfinder.com/vessels/details/`

const DEFAULT_USER_AGENT = `${pkg.name} v${pkg.version}`

const debug = createDebug('scrape-vesselfinder')

const _fetch = async (url, accept, userAgent) => {
	const res = await fetch(url, {
		headers: {
			'accept': accept,
			'user-agent': userAgent || DEFAULT_USER_AGENT,
		},
		redirect: 'follow',
	})
	if (!res.ok) {
		// todo: handle 404 errors in a special way?

		let body = null
		try {
			body = await res.text()
		} catch (err) {
			//
		}
		const err = new Error()
		err.url = url
		err.status = res.status
		err.statusText = res.statusText
		err.responseBody = body
		throw err
	}

	const body = await res.text()
	return {res, body}
}

const _parseVesselPage = (html) => {
	const $ = loadHtml(html)

	const paramsTable = $('main .ship-section table.aparams tbody').first()
	debug('paramsTable', paramsTable)
	if (!paramsTable || paramsTable.length < 1) {
		throw new Error('failed to find table.aparams')
	}

	const rows = $('tr', paramsTable)
	debug('rows', rows)
	if (!rows || rows.length < 1) {
		throw new Error('failed to find table.aparams tr')
	}

	const ignoredFields = [
		'Course / Speed', // parsed further below
	]

	const props = {}
	for (const tr of rows) {
		// todo: this doesn't extract "Course / Speed" properly?
		const key = $('td.n3', tr).text() || null
		const val = $('td.v3', tr).text() || null
		if (key === null) {
			// todo: debug-log
			continue
		}
		if (fieldParsers.has(key)) {
			const parser = fieldParsers.get(key)
			const parsed = parser(key, val)
			Object.assign(props, parsed)
		} else if (!ignoredFields.includes(key)) {
			props[key] = val
		}
	}

	const mapData = JSON.parse($('#djson').attr('data-json') || '{}')
	debug('mapData', mapData)
	// e.g.:
	// {
	// 	"v": true,
	// 	"sar": false,
	// 	"mmsi": 211627650,
	// 	"ship_lat": 52.4449,
	// 	"ship_lon": 13.15839,
	// 	"ship_cog": 345.0,
	// 	"ship_sog": 8.0,
	// 	"ship_type": 69,
	// 	"no_pc": "No port calls detected"
	// }
	// todo: ship_type
	if (mapData.ship_cog) {
		props.courseOverGround = parseFloat(mapData.ship_cog) // in degrees
	}
	if (mapData.ship_sog) {
		props.speedOverGround = parseFloat(mapData.ship_sog)
	}
	if (mapData.ship_lat) {
		props.latitude = parseFloat(mapData.ship_lat)
	}
	if (mapData.ship_lon) {
		props.longitude = parseFloat(mapData.ship_lon)
	}

	// todo: parse recent port calls
	// todo: parse "vessel utilization"
	// todo: parse "vessel particulars"
	// todo: parse "history"
	// todo: parse "similar vessels"

	return props
}

const scrapeVesselFromVesselfinder = async (mmsi, opt = {}) => {
	if ('string' !== typeof mmsi) {
		throw new TypeError('mmsi must be a string')
	}
	if (!mmsi) {
		throw new TypeError('mmsi must not be empty')
	}
	const {
		userAgent,
	} = {
		userAgent: null,
		...opt,
	}

	const target = new URL(VESSEL_BASE_URL)
	target.pathname += mmsi

	const {body} = await _fetch(
		target.href,
		'text/html,application/xhtml+xml;q=0.9',
		userAgent,
		'text',
	)

	const props = _parseVesselPage(body)
	return props
}

export {
	scrapeVesselFromVesselfinder as scrapeVessel,
	_parseVesselPage,
}
