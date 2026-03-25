import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const contractAddress = "0x3371781281912a77495CE7dfb94d9E127740b031";

const ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_note",
				"type": "string"
			}
		],
		"name": "setNote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getNote",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_pureNote",
				"type": "string"
			}
		],
		"name": "pureNote",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
];

let signer = null;
let contract = null;
let provider = null;

provider = new ethers.BrowserProvider(window.ethereum);

async function init() {
    await provider.send("eth_requestAccounts", []);

    const accounts = await provider.listAccounts();
    signer = await provider.getSigner();

    contract = new ethers.Contract(contractAddress, ABI, signer);

    console.log("Signer address:", await signer.getAddress());
}

async function setNote() {
    const note = document.getElementById("inputNote").value;
    const tx = await contract.setNote(note);

    await tx.wait();

    console.log("Note stored");
}

async function getNote() {
    const note = await contract.getNote();
    document.getElementById("result").innerText = note;
}

document.getElementById("writeNote").addEventListener("click", setNote);
document.getElementById("getNote").addEventListener("click", getNote);

init().catch(console.error);