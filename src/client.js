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
		"x-api-client-token": "test",
		"x-validation-token": "83541740c5804c084cc123d4b7e08037920beb87fc45f352341fba4710978829",
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
	.post("/users/registration", data)
	.then((response) => {
		const { status, data } = response;
		console.log(response.data)
	})
	.catch((error) => {
		console.log(error.response.data);
	});
