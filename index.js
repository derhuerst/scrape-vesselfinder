// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)

import createDebug from 'debug'
import {fetch} from 'cross-fetch'
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
	)

	// todo
}

export {
	scrapeVesselFromVesselfinder as scrapeVessel,
}
