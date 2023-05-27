# scrape-vesselfinder

**Scrape vessel/ship positions from [*VesselFinder*](https://www.vesselfinder.com/).**

[![npm version](https://img.shields.io/npm/v/scrape-vesselfinder.svg)](https://www.npmjs.com/package/scrape-vesselfinder)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/scrape-vesselfinder.svg)
![minimum Node.js version](https://img.shields.io/node/v/scrape-vesselfinder.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installation

```shell
npm install scrape-vesselfinder
```


## Usage

### `scrapeVessel(imoOrMmsi)`

```js
import {scrapeVessel} from 'scrape-vesselfinder'

const costaFavolosaIMO = '9479852'

await scrapeVessel(costaFavolosaIMO) // pass in IMO or MMSI
```

```js
{
	beam: 44, // m
	callsign: 'ICPK',
	courseOverGround: 295.1, // degrees
	currentDraught: 8.3, // m
	flag: 'Italy',
	imo: '9479852',
	latitude: 53.83251,
	length: 290, // m
	longitude: 8.07988,
	mmsi: '247311100',
	navigationStatus: 'under way',
	positionReceived: '0 min ago',
	predictedETA: null,
	speedOverGround: 15.9, // knots
}
```


## Contributing

If you have a question or need support using `scrape-vesselfinder`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/scrape-vesselfinder/issues).
