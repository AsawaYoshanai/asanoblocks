// Connect to Web3 provider
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    ethereum.request({ method: 'eth_requestAccounts' });  // Prompt user to connect their MetaMask account
} else {
    alert('Please install MetaMask!');
}

const web3 = new Web3(window.ethereum);
const contractAddress = '0x3c4dcFed3b44d12F689F7A4Ad17f34320a4243a9';  // Replace with your new contract address
const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ModelListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "ModelPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			}
		],
		"name": "ModelRated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "getModelDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "averageRating",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "listModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "ratingCount",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "totalRating",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "purchaseModel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			}
		],
		"name": "rateModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];  // Keep your ABI here

const marketplaceContract = new web3.eth.Contract(abi, contractAddress);

// List a new AI model
async function listModel() {
    const accounts = await web3.eth.getAccounts();
    const name = document.getElementById('modelName').value;
    const description = document.getElementById('modelDescription').value;
    const price = web3.utils.toWei(document.getElementById('modelPrice').value, 'ether');

    try {
        await marketplaceContract.methods.listModel(name, description, price).send({ from: accounts[0] });
        alert('Model listed successfully!');
        displayModels();  // Refresh the displayed models after listing a new one
    } catch (error) {
        console.error(error);
        alert('Failed to list model.');
    }
}


// Display available models
async function displayModels() {
    const modelsListDiv = document.getElementById("modelsList");
    const modelsCount = await marketplaceContract.methods.models.length().call();
    
    console.log(`Number of models: ${modelsCount}`); // Debugging line

    modelsListDiv.innerHTML = '';  // Clear the list before displaying

    for (let i = 0; i < modelsCount; i++) {
        try {
            const modelDetails = await marketplaceContract.methods.getModelDetails(i).call();
            console.log(`Model Details [ID: ${i}]:`, modelDetails); // Debugging line
            
            const averageRating = modelDetails.ratingCount === 0 ? 0 : Math.floor(modelDetails.totalRating / modelDetails.ratingCount);

            modelsListDiv.innerHTML += `
                <div>
                    <h3>${modelDetails.name}</h3>
                    <p>${modelDetails.description}</p>
                    <p>Price: ${web3.utils.fromWei(modelDetails.price.toString(), 'ether')} ETH</p>
                    <p>Average Rating: ${averageRating}</p>
                </div>`;
        } catch (error) {
            console.error(`Error fetching model details for ID ${i}:`, error);
        }
    }
}

// Purchase a model
async function purchaseModel() {
    const accounts = await web3.eth.getAccounts();
    const modelId = document.getElementById('purchaseModelId').value;

    const modelDetails = await marketplaceContract.methods.getModelDetails(modelId).call();
    try {
        await marketplaceContract.methods.purchaseModel(modelId).send({
            from: accounts[0],
            value: modelDetails.price
        });
        alert('Model purchased successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to purchase model.');
    }
}

// Rate a model
async function rateModel() {
    const accounts = await web3.eth.getAccounts();
    const modelId = document.getElementById('rateModelId').value;
    const rating = document.getElementById('rating').value;

    try {
        await marketplaceContract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
        alert('Model rated successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to rate model.');
    }
}


// Call displayModels when the page loads
window.onload = displayModels;