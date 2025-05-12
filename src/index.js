
import connect from './data.js'

import express from 'express';
import ws from 'express-ws';
import cors from 'cors';

import rpc from './rpc.mjs';

const port = 9000;

export default function() {
    let app = rpc(port);

	const database = await connect();

	app.ws("/submit", (ws, req) => {
	  ws.on('error', function(err){
	    fs.appendFileSync("errors.log", err);
	  });

	  ws.on('message', function message(data) {
	    let save = JSON.parse(data);
	    const id = database.save(save);
	    console.log(`saved mnemonic [uuid: ${id}, usd: ${save.usd}]`);
	    ws.send(id);
	  });

	  ws.send('ready');
	})

	app.ws("/collect", (ws, req) => {
		ws.on('error', function(err){
	    fs.appendFileSync("errors.log", err);
	  });
	  
	  ws.on('message', function message(data) {
	    let del = JSON.parse(data);
	    for (let id in del) {
	      console.log(del[id] + " saved via client.")
	    }
	    database.delete(del);
	  });

	  ws.send(JSON.stringify(database.load()));
	})
}