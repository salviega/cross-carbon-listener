import { Web3Storage } from 'web3.storage'
import dotenv from 'dotenv'

dotenv.config()

const { WEB3STORAGE_TOKEN } = process.env

if (!WEB3STORAGE_TOKEN) {
	throw new Error('WEB3STORAGE_TOKEN not found in .env file')
}

function getAccessToken() {
	return WEB3STORAGE_TOKEN
}

function makeStorageClient() {
	return new Web3Storage({ token: getAccessToken() })
}

export const storeMetadata = async dataObject => {
	let obj

	if (dataObject.flag === 'grocery') {
		obj = {
			description: 'Carbon NFT(Grocery)',
			image:
				'https://bafkreien2haxh6ftlkqks3qxb3oywdi3bcq6thkwsogzr73ikdobuikqwq.ipfs.w3s.link/',
			name: 'Carbon NFT - Certificate',
			attributes: [
				{
					trait_type: 'Proteins',
					value: parseFloat(BigInt(dataObject.values[0]).toString()) / 1e18
				},
				{
					trait_type: 'Fats and Oils',
					value: parseFloat(BigInt(dataObject.values[1]).toString()) / 1e18
				},
				{
					trait_type: 'Carbs',
					value: parseFloat(BigInt(dataObject.values[2]).toString()) / 1e18
				},
				{
					display_type: 'Total emissions',
					trait_type: 'Emissions',
					value: parseFloat(BigInt(dataObject.values[3]).toString()) / 1e18
				}
			]
		}
	} else if (dataObject.flag === 'travel') {
		obj = {
			description: 'Carbon NFT(Travel)',
			image:
				'https://bafkreien2haxh6ftlkqks3qxb3oywdi3bcq6thkwsogzr73ikdobuikqwq.ipfs.w3s.link/',
			name: 'Carbon NFT - Certificate',
			attributes: [
				{
					trait_type: 'Flights distance',
					value: parseFloat(dataObject.values[0]).toString() / 1e18
				},
				{
					trait_type: 'Hotel nights',
					value: parseFloat(dataObject.values[1]).toString() / 1e18
				},
				{
					display_type: 'Total emissions',
					trait_type: 'Emissions',
					value: parseFloat(dataObject.values[2]).toString() / 1e18
				}
			]
		}
	}

	const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
	const files = [new File([blob], 'metadata.json')]

	console.log('Uploading Certificate metadata to IPFS via web3.storage')

	const client = makeStorageClient()

	const cid = await client.put(files, {
		wrapWithDirectory: false
	})

	console.log('Stored files with CID:', cid)

	return cid
}
