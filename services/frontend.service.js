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
	name: "frontend",

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
		 * Submit a new consent by a webform submit to this server /frontend/submit
		 *
		 * @returns
		 */
		submit: {
			rest: {
				method: "POST",
				path: "/submit"
			},
			async handler(ctx) {							
				// try to get SSI Identity
				let identity = null;				
				if(typeof ctx.params.consent !== 'undefined') {
					identity = ctx.params.consent;		
				}
				if(typeof ctx.params[process.env.CONSENT_FIELD] != 'undefined') {
					identity = ctx.params[process.env.CONSENT_FIELD];		
				}
				if(typeof ctx.params[process.env.IDENTITY_FIELD] != 'undefined') {
					identity = ctx.params[process.env.IDENTITY_FIELD];		
				}
				if((identity == null)||((""+identity).length !== 42)) {
					throw new MoleculerError("Invalid Identity ("+identity+")", 400, "INVALID_IDENTITY");
				}

				let signature = null;
				if(typeof ctx.params.signature !== 'undefined') {
					signature = ctx.params.signature;		
				}
				if(typeof ctx.params[process.env.SIGNATURE_FIELD] != 'undefined') {
					signature = ctx.params[process.env.SIGNATURE_FIELD];		
				}

				let payload = null;
				if(typeof ctx.params.payload !== 'undefined') {
					payload = ctx.params.payload;		
				}
				if(typeof ctx.params[process.env.PAYLOAD_FIELD] != 'undefined') {
					payload = ctx.params[process.env.PAYLOAD_FIELD];		
				}

				// in case payload and signature is defined validate the signature
				if((payload !== null) && (signature !== null)) {
					const account = ethers.utils.verifyMessage(payload,signature);
					if(account !== identity) {
						throw new MoleculerError("Invalid Signature ("+account+"!=="+identity+")", 400, "INVALID_SIGNATURE");
					}				
				} else {
					// Validation could not be done! 
					console.warn("Submitted Data does not contain payload and signature. Check fields exists as configured in .env");
				}

				// In case payload & signature is not given - we use all parameters as payload.
				if(payload == null) {
					payload = ctx.params;
				}
				// validate consent is given (published)
				const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
				const bn = (await provider.getBlockNumber()).toString() * 1;					
				let sc = new ethers.Contract(process.env.PUBLISH_CONTRACT, require("./_publish.abi.json"), provider);   				
				let rcp = await sc.publishs(identity);				
				let ts =  rcp.toString() * 1;   
				if(ts == 0) {
					throw new MoleculerError("Identity not published", 400, "MISSING_IDENTITY");
				}

				// validate consent is not revoked
				sc = new ethers.Contract(process.env.REVOKE_CONTRACT, require("./_revoke.abi.json"), provider);      
				rcp = await sc.revocations(identity);
				ts =  rcp.toString() * 1;   
				if(ts > 0) {
					throw new MoleculerError("Consent revoked", 400, "CONSENT_REVOKED");
				}

				// Create,sign and store Consent object
				const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);		
				const consent = {
					_id:identity,
					signature:signature,
					payload:payload,
					blockNumber:bn,
					iat:new Date().getTime(),					
					confirmation:await wallet.signMessage(identity)					
				};
				
				await db.put(consent);

				ctx.params.consent_confirmation = consent.confirmation;
				
				// forward to configured entity or return result.
				let res = {};
				if(process.env.MODE=="forward") {
					res = await axios.post(process.env.FORWARD_URL,ctx.params,{ 
							headers: {
								'Cookie': ctx.meta.cookie,
								'User-Agent': ctx.meta['user-agent']
							}
						});					
					ctx.meta.$statusCode = 302;						
					ctx.meta.$location = res.request.res.responseUrl;
					return;
				}		
				if(process.env.MODE=="redirect") {		
					ctx.meta.$statusCode = 302;	
					let url = process.env.REDIRECT_URL;
					if(url.indexOf("?")<0) {
						url += "?";
					}
					url += "&identity="+identity;
					ctx.meta.$location = url;
				}
				return;			
			}
		},


		status: {
			rest: {
				method: "GET",
				path: "/status"
			},
			params: {
				identity: "string"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
				const bn = (await provider.getBlockNumber()).toString() * 1;					
				let sc = new ethers.Contract(process.env.PUBLISH_CONTRACT, require("./_publish.abi.json"), provider);   				
				let rcp = await sc.publishs(ctx.params.identity);				
				let ts =  rcp.toString() * 1;   
				if(ts == 0) {
					throw new MoleculerError("Identity not published", 400, "MISSING_IDENTITY");
				}
				
				sc = new ethers.Contract(process.env.REVOKE_CONTRACT, require("./_revoke.abi.json"), provider);      
				rcp = await sc.revocations(ctx.params.identity);
				ts =  rcp.toString() * 1;   
				if(ts > 0) {
					throw new MoleculerError("Consent revoked", 400, "CONSENT_REVOKED");
				}				
				const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);	
				let res = { blockNumber:bn, iat:new Date().getTime() };
				res.confirmation = await wallet.signMessage(JSON.stringify(res));
				return res;
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

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
