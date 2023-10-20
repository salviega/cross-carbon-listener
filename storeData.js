import { Web3Storage } from 'web3.storage'
import dotenv from 'dotenv'

dotenv.config()

const images = [
	'https://w3s.link/ipfs/bafybeidorgjhjfu4tygsq3wtit22eeptwaa7elq7fdxly5q6qtvkuy7hs4',
	'https://w3s.link/ipfs/bafybeiexazccvmiuzqxfvgxxuzmhpwvj67ley2mjqboebagh4dt3bgwnwy',
	'https://w3s.link/ipfs/bafybeifar6qpvpudty6i2dczpqmoqj5t74vexaplxoxzqzl5cqlz343o24',
	'https://w3s.link/ipfs/bafybeiba7t5coy5ztylgwabjbtovmyfldlxtmrywlairkr73pk2vtlitii',
	'https://w3s.link/ipfs/bafybeic3hz3qzvp7gndobiymlsssuegweglrk76szdu7g23andjj4vrw4m',
	'https://w3s.link/ipfs/bafybeidiggcz27ie4m5j3e4xtncgb6vbpds36mz7m57pnfpqlgvdpcuzhu'
]

const { WEB3STORAGE_TOKEN } = process.env

if (!WEB3STORAGE_TOKEN) {
	throw new Error('WEB3STORAGE_TOKEN not found in .env file')
}

function getRandomImage() {
	const randomIndex = Math.floor(Math.random() * images.length)
	return images[randomIndex]
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
			image: getRandomImage(),
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
			image: getRandomImage(),
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
