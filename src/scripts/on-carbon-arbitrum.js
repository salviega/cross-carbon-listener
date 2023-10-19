import ethers from 'ethers'
import dotenv from 'dotenv'
import carbonContractJson from '../../assets/deployments/arbitrum/Carbon.json' assert { type: 'json' }
import receiverContractJson from '../../assets/deployments/arbitrum/Receiver.json' assert { type: 'json' }

dotenv.config()

const { ARBITRUM_GOERLI_RPC_URL, PRIVATE_KEY } = process.env

if (!ARBITRUM_GOERLI_RPC_URL || !PRIVATE_KEY) {
	throw new Error(
		'ARBITRUM_GOERLI_RPC_URL or PRIVATE_KEY not found in .env file'
	)
}

const scan = 'https://goerli.arbiscan.io/tx'

const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_GOERLI_RPC_URL)

const signer = new ethers.Wallet(PRIVATE_KEY, provider)

const carbonContract = new ethers.Contract(
	carbonContractJson.address,
	carbonContractJson.abi,
	signer
)

const receiverContract = new ethers.Contract(
	receiverContractJson.address,
	receiverContractJson.abi,
	provider
)

const event = 'ReceivedMessage'

const callback = async s_lastMessage => {
	console.log('\n')
	console.log('s_lastMessage: ', s_lastMessage)

	const { flag } = JSON.parse(s_lastMessage)
	console.log('flag: ', flag)

	console.log('\n')

	if (flag === 'transfer') {
		const { from, to, amount, network } = JSON.parse(s_lastMessage)

		console.log('from: ', from)
		console.log('to: ', to)
		console.log('amount: ', amount)
		console.log('network: ', network)

		try {
			const websocketTransferTx = await carbonContract.websocketTransfer(
				from,
				to,
				amount,
				network,
				{
					gasLimit: 2500000
				}
			)
			await websocketTransferTx.wait(1)

			console.log('\n')
			console.log('Transaction was successful 🎉')
			console.log(`see transaction on ${scan}/${websocketTransferTx.hash}`)
		} catch (error) {
			console.error('error: ', error)
		}
	} else if (flag === 'transferFrom') {
		const { sender, from, to, amount, network } = JSON.parse(s_lastMessage)

		console.log('sender: ', sender)
		console.log('from: ', from)
		console.log('to: ', to)
		console.log('amount: ', amount)
		console.log('network: ', network)

		try {
			const websocketTransferFromTx =
				await carbonContract.websocketTransferFrom(
					sender,
					from,
					to,
					amount,
					network,
					{
						gasLimit: 2500000
					}
				)
			await websocketTransferFromTx.wait(1)

			console.log('\n')
			console.log('Transaction was successful 🎉')
			console.log(`see transaction on ${scan}/${websocketTransferFromTx.hash}`)
		} catch (error) {
			console.error('error: ', error)
		}
	}
}

receiverContract.on(event, callback)
