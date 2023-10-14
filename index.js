import ethers from 'ethers'
import dotenv from 'dotenv'
import calculatorContractJson from './assets/json/contracts/Calculator.json' assert { type: 'json' }
import carbonContractJson from './assets/json/contracts/Carbon.json' assert { type: 'json' }
dotenv.config()

const { POLYGON_MUMBAI_RPC_URL, PRIVATE_KEY } = process.env

if (!POLYGON_MUMBAI_RPC_URL || !PRIVATE_KEY) {
	throw new Error(
		'POLYGON_MUMBAI_RPC_URL or PRIVATE_KEY not found in .env file'
	)
}

const scan = 'https://mumbai.polygonscan.com/tx'

const provider = new ethers.providers.JsonRpcProvider(POLYGON_MUMBAI_RPC_URL)

const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const signer = wallet.connect(provider)

const calculatorContract = new ethers.Contract(
	calculatorContractJson.address,
	calculatorContractJson.abi,
	provider
)

const carbonContract = new ethers.Contract(
	carbonContractJson.address,
	carbonContractJson.abi,
	signer
)

const event = 'CarbonFootprintOffset'

const callback = async (requestId, flag, args, values, buyer) => {
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
		buyer
	}

	console.debug(object)

	try {
		const offsetFootprintTx = await carbonContract.offsetFootprint(
			requestId,
			flag,
			args,
			values,
			buyer
		)
		offsetFootprintTx.wait(1)

		console.log('\n')
		console.log('Transaction was successful 🎉')
		console.log(`see transaction on ${scan}/${offsetFootprintTx.hash}`)
	} catch (error) {
		console.error('error: ', error)
	}
}

calculatorContract.on(event, callback)
