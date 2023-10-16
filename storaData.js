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

export const storeMetadata = async object => {
	const blob = new Blob([JSON.stringify(object)], { type: 'application/json' })
	const files = [new File([blob], 'metadata.json')]

	console.log('Uploading Certificate metadata to IPFS via web3.storage')

	const client = makeStorageClient()

	const cid = await client.put(files, {
		wrapWithDirectory: false
	})

	console.log('stored files with cid: ', cid)
	console.log('\n')

	return cid
}
