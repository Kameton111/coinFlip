import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const contractAddress = "0x656Bee8eb84B86eBb1eEF10d7E942EeF6ed52F4E";

const ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_side",
                "type": "uint256"
            }
        ],
        "name": "coinFlip",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isWinner",
                "type": "bool"
            }
        ],
        "name": "GamePlayed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_side",
                "type": "uint256"
            }
        ],
        "name": "playGame",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let signer = null;
let contract = null;
let provider = null;

async function init() {
    if (!window.ethereum) {
        alert("MetaMask не найден");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, ABI, signer);

    console.log("Signer address:", await signer.getAddress());
}

async function play(side) {
    let amountInWei = ethers.parseEther("0.000001");
    console.log(amountInWei);

    const tx = await contract.playGame(side, { value: amountInWei });
    await tx.wait();
}

async function getGamePlayed() {
    let currentBlock = await provider.getBlockNumber();
    let queryResult = await contract.queryFilter("GamePlayed", currentBlock - 5000, currentBlock);

    if (queryResult.length === 0) {
        document.getElementById("result").innerText = "Событий пока нет";
        return;
    }

    let queryResultRecent = queryResult[queryResult.length - 1];
    let player = queryResultRecent.args.player.toString();
    let result = queryResultRecent.args.isWinner.toString();

    let resultLogs = `player: ${player}
result: ${result == "false" ? "LOSE" : "WIN"}`;

    console.log(resultLogs);
    document.getElementById("result").innerText = resultLogs;
}

async function startApp() {
    await init();

    document.getElementById("play0").addEventListener("click", () => play(0));
    document.getElementById("play1").addEventListener("click", () => play(1));
    document.getElementById("getGamePlayed").addEventListener("click", getGamePlayed);
}

startApp().catch(console.error);