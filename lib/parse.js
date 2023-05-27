'use strict'

import {deepStrictEqual} from 'node:assert'

function* trim ([key, val]) {
	yield [
		key,
		'string' === typeof val ? val.trim() : val,
	]
}

function* lowerCase ([key, val]) {
	yield [
		key,
		'string' === typeof val ? val.toLowerCase() : val,
	]
}

function* nullify ([key, val]) {
	yield [
		key,
		val === '-' ? null : val,
	]
}

function* toInt([key, val]) {
	yield [
		key,
		'string' === typeof val ? parseInt(val) : val,
	]
}
function* toFloat([key, val]) {
	yield [
		key,
		'string' === typeof val ? parseFloat(val) : val,
	]
}

const removeSuffix = (suffix) => {
	return function* suffixRemover ([key, val]) {
		const newVal = 'string' === typeof val && val.slice(-suffix.length) === suffix
			? val.slice(0, -suffix.length)
			: val
		yield [key, newVal]
	}
}

const key = (parser) => {
	return function* keyParser ([key, val]) {
		for (const [newVal, newKey] of parser([val, key])) {
			yield [newKey, newVal]
		}
	}
}
deepStrictEqual(
	Array.from(
		key(function* ([key, val]) {
			yield [key, val.toLowerCase()]
			yield [key, val.toUpperCase()]
		})(['fOo', 'bar']),
	),
	[
		['foo', 'bar'],
		['FOO', 'bar'],
	],
)

const splitOn = (pattern) => {
	return function* split (entry) {
		const [key, val] = entry

		const keySplit = key.split(pattern)
		const valSplit = val.split(pattern)
		if (keySplit.length === valSplit.length) {
			for (let i = 0; i < keySplit.length; i++) {
				yield [keySplit[i], valSplit[i]]
			}
		} else {
			yield entry
		}
	}
}

const keepFieldsAs = (mapping) => {
	mapping = new Map(mapping)
	return function* keepFieldsAsParser ([key, val]) {
		if (mapping.has(key)) {
			yield [mapping.get(key), val]
		}
	}
}

const compose = (...parsers) => {
	return function* composed (entries) {
		for (const parser of parsers) {
			// console.error('parser', parser, 'entries', entries)
			const newEntries = []
			for (const entry of entries) {
				for (const newEntry of parser(entry)) {
					newEntries.push(newEntry)
				}
			}
			entries = newEntries
		}
		for (const entry of entries) {
			yield entry
		}
	}
}
deepStrictEqual(
	Array.from(
		compose(
			trim,
			key(trim),
			splitOn(/\s?\/\s?/),
			key(lowerCase),
			function* explode ([key, val]) {
				for (const newVal of val.split('')) {
					yield [key, newVal]
				}
			},
			toInt,
		)([
			[' a/ B /c \n\t ', ' \t 123/4/56 \n '],
		])
	),
	[
		['a', 1],
		['a', 2],
		['a', 3],
		['b', 4],
		['c', 5],
		['c', 6],
	],
)

const wrapParser = (parser) => {
	const ergonomicParser = (key, val) => {
		return Object.fromEntries(parser([
			[key, val],
		]))
	}
	return ergonomicParser
}

// ---

const parseLengthBeam = wrapParser(compose(
	trim, key(trim),
	splitOn(/\s?\/\s?/), trim, key(trim),
	keepFieldsAs([
		['Length', 'length'],
		['Beam', 'beam'],
	]),
	nullify,
	toFloat,
))
deepStrictEqual(
	parseLengthBeam('Length / Beam', '45 / 8 m'),
	{length: 45, beam: 8},
)
deepStrictEqual(
	parseLengthBeam('Length / Beam', '45 / -'),
	{length: 45, beam: null},
)

const parsePredictedETA = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Predicted ETA', 'predictedETA'],
	]),
	nullify,
	// todo: parse time?
))
// todo: test parsePredictedETA('Predicted ETA', '-')

const parseDistanceTime = wrapParser(compose(
	trim, key(trim),
	// todo: split how exactly?
	// splitOn(/\s?\/\s?/), trim, key(trim),
	keepFieldsAs([
		// todo
	]),
	nullify,
	// todo: parse distance?
	// todo: parse time
))
// todo: test parseDistanceTime('Distance / Time', '-')

const parseCurrentDraught = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Current draught', 'currentDraught'],
	]),
	nullify,
	removeSuffix(' m'),
	toFloat,
))
// todo: test parseCurrentDraught('Current draught', '-')

const parseNavigationStatus = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Navigation Status', 'navigationStatus'],
	]),
	nullify,
	lowerCase,
	// todo: parse navigation status
))
// todo: test parseNavigationStatus('Navigation Status', '\n             Under way\n           ')

const parsePositionReceived = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Position received', 'positionReceived'],
	]),
	nullify,
	lowerCase,
	// todo: parse rel time?
))
// todo: test parsePositionReceived('Position received', '\n     0 min ago \n      \n  ')

const parseImoMmsi = wrapParser(compose(
	trim, key(trim),
	splitOn(/\s?\/\s?/), trim, key(trim),
	keepFieldsAs([
		['IMO', 'imo'],
		['MMSI', 'mmsi'],
	]),
	nullify,
	key(lowerCase), // todo: filter keys
))
deepStrictEqual(
	parseImoMmsi('IMO / MMSI', ' -  / 211627650'),
	{imo: null, mmsi: '211627650'},
)
// todo: test with non-null IMO

const parseCallsign = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Callsign', 'callsign'],
	]),
	nullify,
	key(lowerCase), // todo: filter keys
))
deepStrictEqual(
	parseCallsign('Callsign', 'DK4902'),
	{callsign: 'DK4902'},
)

const parseFlag = wrapParser(compose(
	trim, key(trim),
	keepFieldsAs([
		['Flag', 'flag'],
	]),
	nullify,
	key(lowerCase), // todo: filter keys
))
deepStrictEqual(
	parseFlag('Flag', 'Germany'),
	{flag: 'Germany'},
)

const parsers = new Map([
	['Predicted ETA', parsePredictedETA],
	['Distance / Time', parseDistanceTime],
	// todo: 'Course / Speed' ?
	['Current draught', parseCurrentDraught],
	['Navigation Status', parseNavigationStatus],
	['Position received', parsePositionReceived],
	['IMO / MMSI', parseImoMmsi],
	['Callsign', parseCallsign],
	['Flag', parseFlag],
	['Length / Beam', parseLengthBeam],
])

export {
	parsePredictedETA,
	parseDistanceTime,
	parseCurrentDraught,
	parseNavigationStatus,
	parsePositionReceived,
	parseImoMmsi,
	parseCallsign,
	parseFlag,
	parseLengthBeam,
	parsers,
}
