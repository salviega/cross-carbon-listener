import ethers from 'ethers'
import dotenv from 'dotenv'
import { storeMetadata } from '../../storeData.js'
import carbonContractJson from '../../assets/deployments/mumbai/Carbon.json' assert { type: 'json' }
import calculatorContractJson from '../../assets/deployments/mumbai/Calculator.json' assert { type: 'json' }
import communicatorContractJson from '../../assets/deployments/mumbai/Communicator.json' assert { type: 'json' }

dotenv.config()

const { POLYGON_MUMBAI_RPC_URL, PRIVATE_KEY } = process.env

if (!POLYGON_MUMBAI_RPC_URL || !PRIVATE_KEY) {
	throw new Error(
		'POLYGON_MUMBAI_RPC_URL or PRIVATE_KEY not found in .env file'
	)
}

const scan = 'https://mumbai.polygonscan.com/tx'

const provider = new ethers.providers.JsonRpcProvider(POLYGON_MUMBAI_RPC_URL)

const signer = new ethers.Wallet(PRIVATE_KEY, provider)

const calculatorContract = new ethers.Contract(
	calculatorContractJson.address,
	calculatorContractJson.abi,
	provider
)

const communicatorContract = new ethers.Contract(
	communicatorContractJson.address,
	communicatorContractJson.abi,
	provider
)

const carbonContract = new ethers.Contract(
	carbonContractJson.address,
	carbonContractJson.abi,
	signer
)

let event = 'CarbonFootprintCalculated'

let callback = async (requestId, flag, args, values, buyer) => {
	console.log('\n')
	console.log('requestId: ', requestId)
	console.log('flag: ', flag)
	console.log('args: ', args)
	console.log('values: ', values)
	console.log('buyer: ', buyer)

	console.log('\n')

	const object = {
		requestId,
		flag,
		args,
		values,
		buyer,
		IPFSURL
	}

	console.debug(object)

	const CID = await storeMetadata(object)
	const tokenURI = `https://w3s.link/ipfs/${CID}`

	try {
		const offsetFootprintTx = await carbonContract.offsetCarbonFootprint(
			requestId,
			flag,
			args,
			values,
			buyer,
			tokenURI,
			{
				gasLimit: 2500000
			}
		)
		await offsetFootprintTx.wait(1)

		console.log('\n')
		console.log('Transaction was successful 🎉')
		console.log(`see transaction on ${scan}/${offsetFootprintTx.hash}`)
	} catch (error) {
		console.error('error: ', error)
	}
}

calculatorContract.on(event, callback)

event = 'ReceivedMessage'

const processTransaction = async (transactionFunction, ...params) => {
	try {
		const tx = await transactionFunction(...params, { gasLimit: 2500000 })
		await tx.wait(1)

		console.log('\nTransaction was successful 🎉')
		console.log(`See transaction on ${scan}/${tx.hash}`)
	} catch (error) {
		console.error('Error:', error)
	}
}

const logMessageDetails = details => {
	for (const [key, value] of Object.entries(details)) {
		console.log(`${key}: `, value)
	}
}

callback = async s_lastMessage => {
	console.log('\n', 's_lastMessage:', s_lastMessage)

	const messageData = JSON.parse(s_lastMessage)
	const { flag, ...otherDetails } = messageData
	console.log('flag: ', flag, '\n')
	logMessageDetails(otherDetails)

	switch (flag) {
		case 'buy':
			processTransaction(
				carbonContract.websocketBuyCarbonCredits,
				otherDetails.buyer,
				otherDetails.amount,
				otherDetails.network
			)
			break
		case 'retire':
			processTransaction(
				carbonContract.websocketRetireCarbonCredits,
				otherDetails.buyer,
				otherDetails.amount,
				otherDetails.network
			)
			break
		case 'transfer':
			processTransaction(
				carbonContract.websocketTransfer,
				otherDetails.from,
				otherDetails.to,
				otherDetails.amount,
				otherDetails.network
			)
			break
		case 'transferFrom':
			processTransaction(
				carbonContract.websocketTransferFrom,
				otherDetails.sender,
				otherDetails.from,
				otherDetails.to,
				otherDetails.amount,
				otherDetails.network
			)
			break
		default:
			console.log('Unknown flag encountered:', flag)
	}
}

communicatorContract.on(event, callback)
