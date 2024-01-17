const axios = require("axios");
const crypto = require("crypto");
const qs = require("qs");


const buildHmacSha256Signature = (parameters) => {
	const dataQueryString = qs.stringify(parameters); // .replace("%20", "+");
	// @ts-ignore
	return crypto
		.createHmac("sha256", "bgLkjKcXC8Zkgsfr4ftDxxgEnKbj4ZBUjTk6GCqjA6HvQ2eTZT")
		.update(dataQueryString)
		.digest("hex");
};
const validateHmacSha256Signature = (token, data) => {
	const signature = buildHmacSha256Signature(data);
	return signature === token;
};

const instance = axios.create({
	baseURL: "http://localhost:5000/",
	headers: {
		"x-access-token": "MAReTqRkP9D5g4BQ3gARz6HhU6h2Gsd8HMHfqXjFpf8Xhf3VA2",
		"x-api-client-token": "asdfASDFI234",
		"x-validation-token": "439c6cb53fb4dd65cd286c0ca080a29aa56277e59b379a017915a1e51cbb321d",
	},
});

// const data = {
// 	data: {authKey: "JuAw1GCrubIkonI8bTe41Ox4DSGix4M6kTCBi0MT5MXGOMw5BM"},
// 	token: ""
// }
const data = {
	data: {},
	token: ""
}
data.token = buildHmacSha256Signature(data.data);
console.log(data);


instance
	.post("/api/users/new-user", data)
	.then((response) => {
		const { status, data } = response;
		console.log(response.data)
	})
	.catch((error) => {
		console.log(error.response.data);
	});
