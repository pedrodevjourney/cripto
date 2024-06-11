const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
let sellPrice = 0;

ws.onmessage = (event) => {
    console.clear();
    const obj = JSON.parse(event.data);
    console.log("Moeda: " + obj.s);
    console.log("Melhor preço de venda: " + obj.a);

    const currentPrice = parseFloat(obj.a);
    if (sellPrice === 0 && currentPrice < 69000) {
        console.log("Compre!");
        newOrder("0.001", "BUY");
        sellPrice = currentPrice * PROFITABILITY;
    }
    else if (sellPrice !== 0 && currentPrice > sellPrice) {
        console.log("Lucre com a venda de sua criptmoeda!")
        newOrder("0.001", "SELL");
        sellPrice = 0;
    }
    else {
        console.log("Aguarde o momento ideal para ação... Sell Price: " + sellPrice);
    }
}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side) {

    const data = {
        symbol: process.env.SYMBOL,
        type: 'MARKET',
        side,
        quantity
    }

    const timestamp = Date.now();
    const recvWindow = 60000;

    const signatureDigital = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams({ ...data, timestamp, recvWindow })}`)
        .digest('hex');

    const newData = { ...data, timestamp, recvWindow, signatureDigital };
    const qs = `?${new URLSearchParams(newData)}`;

    try {
        const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': process.env.API_KEY }
        })
        console.log(result.data);
    } catch (erro) {
        console.error(erro)
    }
}
