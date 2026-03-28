import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const contractAddress = "0xf94a86A9E95Dd748962Ea6064dA381D6127Ad96B";

const ABI = [
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
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
                "internalType": "uint256",
                "name": "playerChoice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "contractChoice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isWinner",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isDraw",
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
                "name": "_choice",
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

let provider = null;
let signer = null;
let contract = null;

function choiceToText(choice) {
    if (choice == 0) return "ROCK";
    if (choice == 1) return "SCISSORS";
    if (choice == 2) return "PAPER";
    return "UNKNOWN";
}

async function init() {
    if (!window.ethereum) {
        alert("MetaMask not found");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    contract = new ethers.Contract(contractAddress, ABI, signer);

    console.log("Signer address:", await signer.getAddress());
}

async function play(choice) {
    try {
        let amountInWei = ethers.parseEther("0.000001");

        console.log("Selected choice:", choiceToText(choice));

        const tx = await contract.playGame(choice, { value: amountInWei });
        await tx.wait();

        document.getElementById("result").innerText = "Transaction confirmed. Now click Get result.";
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText = "Error: " + error.message;
    }
}

async function getGamePlayed() {
    try {
        let currentBlock = await provider.getBlockNumber();
        let fromBlock = Math.max(0, currentBlock - 10);

        let queryResult = await contract.queryFilter("GamePlayed", fromBlock, currentBlock);

        if (queryResult.length === 0) {
            document.getElementById("result").innerText = "Result not found yet";
            return;
        }

        let lastEvent = queryResult[queryResult.length - 1];

        let player = lastEvent.args.player.toString();
        let playerChoice = Number(lastEvent.args.playerChoice);
        let contractChoice = Number(lastEvent.args.contractChoice);
        let isWinner = lastEvent.args.isWinner;
        let isDraw = lastEvent.args.isDraw;

        function choiceToText(choice) {
            if (choice === 0) return "ROCK";
            if (choice === 1) return "SCISSORS";
            if (choice === 2) return "PAPER";
            return "UNKNOWN";
        }

        let finalResult = "LOSE";
        if (isDraw) {
            finalResult = "DRAW";
        } else if (isWinner) {
            finalResult = "WIN";
        }

        let resultText = `Player: ${player}
Your choice: ${choiceToText(playerChoice)}
Contract choice: ${choiceToText(contractChoice)}
Result: ${finalResult}`;

        document.getElementById("result").innerText = resultText;
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText = "Error: " + error.message;
    }
}

async function startApp() {
    await init();

    document.getElementById("play0").addEventListener("click", () => play(0));
    document.getElementById("play1").addEventListener("click", () => play(1));
    document.getElementById("play2").addEventListener("click", () => play(2));
    document.getElementById("getGamePlayed").addEventListener("click", getGamePlayed);
}

startApp().catch(console.error);
