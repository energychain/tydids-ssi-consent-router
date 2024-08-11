"use strict";

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const { MoleculerError } = require("moleculer").Errors;
const ethers = require("ethers");
const PouchDB = require("pouchdb");
const db = new PouchDB("consent");
const axios = require("axios");

/** @type {ServiceSchema} */
module.exports = {
	name: "backend",

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * If not revoked, Get stored consent by ID 
		 * TODO: Protect 
		 * 
		 * @param {String} identity - Consent ID (identity)
		 */
		retrieve: {
			rest: {
				method: "GET",
				path: "/retrieve"
			},
			method:"GET",
			params: {
				identity: "string"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
				const sc = new ethers.Contract(process.env.REVOKE_CONTRACT, require("./_revoke.abi.json"), provider);      
				const rcp = await sc.revocations(ctx.params.identity);
				let ts =  rcp.toString() * 1;   
				if(ts > 0) {
					throw new MoleculerError("Consent revoked", 400, "CONSENT_REVOKED");
				}				
				return JSON.parse((await db.get(ctx.params.identity)).payload);
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		const init = async function() {
			// Monitor revocations 
			function sleep(ms) {
				return new Promise(resolve => setTimeout(resolve, ms));
			}
			const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
			const sc = new ethers.Contract(process.env.REVOKE_CONTRACT, require("./_revoke.abi.json"), provider);  

			while(true) {				
				const identities = await db.allDocs({include_docs:false});	
				
				for(let i=0;i<identities.total_rows;i++) {
					try {
						const rcp = await sc.revocations(identities.rows[i].id);
						let ts =  rcp.toString() * 1;   
						if(ts > 0) {
							// in case the revoke callback fails and throws error, the remove will not be called.
							if((process.env.REVOKE_WEBHOOK)&&(process.env.REVOKE_WEBHOOK.length > 0)) {
								let url = process.env.REVOKE_WEBHOOK;
								if(url.indexOf("?")<0) {
									url += "?";
								}
								url += "&identity="+identities.rows[i].id;
								await axios.get(url);
							}
							console.debug("Revoked",identities.rows[i].id);							
							await db.remove({_id:identities.rows[i].id,_rev:identities.rows[i].value.rev});						
						}	
					} catch(e) {
						console.error("Error in Revoke Check",e);
					}
					await sleep(1 * process.env.REVOKE_CHECK_DELAY);				
				}

				await sleep(5000);
			}			
		}
		init();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
