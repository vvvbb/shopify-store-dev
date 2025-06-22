class FormCustomerInfo extends HTMLElement {
	constructor() {
		super();
		this.elForm = this.querySelector("form");
		this.elBtnSubmit = this.querySelector('button[type="submit"]');
		this.keyStorefront = this.getAttribute("data-storefront-api-key");

		this.version = "2025-04";
		this.shop = "vincent-store-dev";
		this.URL_storefront = `https://${this.shop}.myshopify.com/api/${this.version}/graphql.json`;

	}

	connectedCallback() {
		this.elBtnSubmit.addEventListener("click", this.handleSubmit.bind(this));
	}

	async handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(this.elForm);
		const data = Object.fromEntries(formData.entries());

		if (!data.email || !data.password) {
			alert("Email and password are required.");
			return;
		}

		try {
			const token = await this.getAccessToken(data);
			const customer = await this.updateCustomerInfo(data, token);
			console.log("Customer updated successfully:", customer);
		} catch (error) {
			alert(error.message || "An error occurred while updating customer info.");
		}
	}

	async getAccessToken(data) {
		const { email, password } = data;

		const query = `
			mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
				customerAccessTokenCreate(input: $input) {
					customerAccessToken {
						accessToken
					}
					customerUserErrors {
						message
					}
				}
			}
		`;

		const variables = {
			input: {
				email: email,
				password: password,
			},
		};

		const response = await this.fetchData(query, variables);

		if (response.errors) {
			console.error("GraphQL errors:", response.errors);
			throw new Error("Failed to create customer access token");
		}

		const accessToken =
			response.data.customerAccessTokenCreate.customerAccessToken?.accessToken;
		if (!accessToken) {
			console.error("No access token returned");
			throw new Error("No access token returned");
		}

		return accessToken;
	}

	async updateCustomerInfo(data, token) {
		const { firstName, lastName, acceptsMarketing } = data;

		const query = `
			mutation customerUpdate($customer: CustomerUpdateInput!, $customerAccessToken: String!) {
				customerUpdate(customer: $customer, customerAccessToken: $customerAccessToken) {
					customer {
						acceptsMarketing
						firstName
						lastName
						email
						displayName
					}
					customerAccessToken {
						# CustomerAccessToken fields
						accessToken
					}
					customerUserErrors {
						# CustomerUserError fields
						field
						message
					}
					userErrors {
						field
						message
					}
				}
			}
		`;

		const variables = {
			customer: {
				firstName: firstName,
				lastName: lastName,
				acceptsMarketing: acceptsMarketing === "on",
			},
			customerAccessToken: token,
		};

		const response = await this.fetchData(query, variables);

		if (response.errors) {
			console.error("GraphQL errors:", response.errors);
			throw new Error("Failed to update customer");
		}

			const customer = response.data.customerUpdate.customer;
			if (!customer) {
				console.error("No access token returned");
				throw new Error("No access token returned");
			}

			return customer;
	}

	async fetchData(query, variables = {}) {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": this.keyStorefront,
			},
			body: JSON.stringify({ query, variables }),
		};
		return fetch(this.URL_storefront, options)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				// console.log("response", response);
				return response.json();
			})
			.catch((error) => console.error("Error fetching data:", error));
	}
}

customElements.define("form-customer-info", FormCustomerInfo);
