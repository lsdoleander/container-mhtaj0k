{
	import mysql from 'mysql2/promise'
    import { v4 } from 'uuid';

	export default function(){

		const API = {
			async save(data) {
				let id = v4();
				
				async function insertMnemonic(mnemonic) {
					const sql = ("INSERT INTO mnemonic (id, mnemonic, usd) VALUES (:id, :mnemonic, :usd)");
					await connection.execute(sql, mnemonic);
				}

				async function insertBalance(balance) {
					const sql = ("INSERT INTO balances (id, currency, name, amount, usd) VALUES (:id, :currency, :name, :amount, :usd)");
					await connection.execute(sql, balance);
				}

				await insertMnemonic({ id, mnemonic: data.mnemonic, usd: data.usd });
				for (let balance of data.balances) {
					balance.id = id
					await insertBalance(balance);
				}
				return id;
			},

			async load() {
				let map = {};

				async function selectMnemonics(){
					const sql = ("SELECT id, mnemonic, usd from mnemonic");
					const [result, fields] = await connection.execute(sql);

					for (let mnem of result) {
						mnem.balances = [];
						map[mnem.id] = mnem
					}
				}

				async function selectBalances(){
					const sql = ("SELECT id, currency, name, amount, usd from balances");
					const [result, fields] = await connection.execute(sql);

					for (let balance of result) {
						map[balance.id].balances.push(balance);
					}
				}

				await selectMnemonics();
				await selectBalances();

				return map;
			},

			async delete(ids) {
				async function deleteBalances(id) {
					const sql = ("DELETE from balances where id = ?");
					await connection.execute(sql, [id]);
				}

				async function deleteMnemonics(id) {
					const sql = ("DELETE from mnemonic where id = ?");
					await connection.execute(sql, [id]);
				}

				for (let id of ids) {
					await deleteBalances(id)
					await deleteMnemonics(id)
				}
			},

			async server(url){
				const sql = ("INSERT INTO server (url, db) VALUES (?)");
				await connection.execute(sql, [url,db]);
			},

			async servers(){
				const sql = ("SELECT distinct (url) uri, db from server");
				const [result, fields] = await connection.execute(sql);
				return result; 
			}
		}

		return new Promise(resolve=>{
			try {
				const connection = await mysql.createConnection({
				    host: process.env.DB_HOST,
				    port: process.env.DB_PORT,
				    user: process.env.DB_USER,
				    database: process.env.DB_NAME,
				    password: process.env.DB_PASSWORD });
				connection.config.namedPlaceholders = true;

				//
				/* Class is called directly from command-line, with "init" in the Docker build. */
																								//																							  
				if (process.argv.includes("init")) {
					const sql = fs.readFileSync(__dirname + '/creator.sql', 'utf8').trim();
					console.log("data.js: called with init command.")
					console.log("creator.sql: `" + sql + "`")
					await connection.execute(sql);
					resolve();
				} else {
					resolve (API);
				}
			  
			} catch (err) {
			    console.log(err);
			}
		})
	}
}