class APIGraphQL extends HTMLElement {
  constructor() {
    super();
    this.el = this;
    this.keyStorefront = this.getAttribute('data-storefront-api-key');
    this.keyAdmin = this.getAttribute('data-admin-api-key');
    this.captcha_site_key = this.getAttribute('data-captcha-site-key');
    this.captcha_secret = this.getAttribute('data-captcha-secret');

    this.elFormStoreCustomer = this.querySelector('form[data-storefront-customer]');
    this.elBtnFormStoreCustomer = this.elFormStoreCustomer.querySelector('button[type="submit"]');

    this.elBtnStoreProduct = this.querySelector('button[data-storefront-product]');
    this.elStoreData = this.querySelector('p[data-storefront-data]');

    this.elBtnAdminCustomer = this.querySelector('button[data-admin-customer]');
    this.elBtnAdminWebhook = this.querySelector('button[data-admin-webhook]');
    this.elAdminData = this.querySelector('p[data-admin-data]');

    const version = '2025-04';
    const shop = 'vincent-store-dev';

    this.URL_admin = `https://${shop}.myshopify.com/admin/api/${version}/graphql.json`;
    this.URL_storefront = `https://${shop}.myshopify.com/api/${version}/graphql.json`;

  }

  connectedCallback() {
    this.initCaptcha();

    this.elFormStoreCustomer.addEventListener('submit', this.handleStoreCustomer.bind(this));

    this.elBtnStoreProduct.addEventListener('click', this.handleStoreProduct.bind(this));

    this.elBtnAdminCustomer.addEventListener('click', this.handleAdminCustomer.bind(this));

    this.elBtnAdminWebhook.addEventListener('click', this.handleAdminWebhook.bind(this));

    // this.handleAdminCustomer();
    // this.handleStoreCustomer();
  }

  initCaptcha() {
    this.elCaptcha = document.querySelector('#captcha_storefront_api');
    if (!this.elCaptcha) return;

    grecaptcha.render(this.elCaptcha, {
      sitekey: this.captcha_site_key,
      theme: 'light',
    });
  }

  async verifyCaptcha(captchaResponse) {
    return await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: this.captcha_secret,
        response: captchaResponse,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('Captcha verified successfully:', data);
          // Proceed with form submission or other actions
          return true;
        } else {
          console.error('Captcha verification failed:', data);
        }
      })
      .catch((error) => {
        console.error('Error verifying captcha:', error);
      })
      .finally(() => {
        grecaptcha.reset(this.elCaptcha);
      });
  }

  async handleStoreCustomer(e) {
    e.preventDefault();

    if (this.elCaptcha) {
      const captchaResponse = await grecaptcha.getResponse();
      if (!captchaResponse) {
        alert('Please complete the CAPTCHA');
        return;
      } else {
        const valide_captcha = await this.verifyCaptcha(captchaResponse);
        if (!valide_captcha) {
          alert('CAPTCHA verification failed. Please try again.');
          return;
        }
      }
    }

    const formData = new FormData(this.elFormStoreCustomer);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);

    let query = `
      mutation customerAccessTokenCreate {
        customerAccessTokenCreate(input: {email: "${data.email}", password: "${data.password}"}) {
          customerAccessToken {
            accessToken
          }
          customerUserErrors {
            message
          }
        }
      }
    `;

    let query2 = (accessToken) => `
    { 
      customer(customerAccessToken:"${accessToken}") {
          id
          firstName
          lastName
          email
          phone
          acceptsMarketing
        }
    }
    `;

    const headers = {
      'X-Shopify-Storefront-Access-Token': this.keyStorefront,
    };

    await this.fetchData(this.URL_storefront, headers, query).then(async (response) => {
      const accessToken = response.data.customerAccessTokenCreate.customerAccessToken.accessToken;
      // console.log('response1', accessToken);
      await this.fetchData(this.URL_storefront, headers, query2(accessToken)).then((response) => {
        // console.log('response2', response.data.customer);
        this.fillData(response.data.customer, this.elStoreData);
      });
      // this.fillData(response.data, this.elStoreData);
    });
  }

  async handleStoreProduct() {
    let query = `
      query {
        products(first:5) {
          edges {
            node {
              title
              id
            }
          }
        }
      }
    `;

    const headers = {
      'X-Shopify-Storefront-Access-Token': this.keyStorefront,
    };

    await this.fetchData(this.URL_storefront, headers, query).then((response) => {
      this.fillData(response.data.products, this.elStoreData);
    });
  }

  async handleAdminWebhook() {
    const query = `
      query {
        webhookSubscriptions(first: 2) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
                ... on WebhookEventBridgeEndpoint {
                  arn
                }
                ... on WebhookPubSubEndpoint {
                  pubSubProject
                  pubSubTopic
                }
              }
            }
          }
        }
      }
    `;

    const headers = {
      'X-Shopify-Access-Token': this.keyAdmin,
    };

    await this.fetchData(this.URL_admin, headers, query).then((response) => {
      console.log('response', response);
      this.fillData(response.data, this.elAdminData);
    });
  }

  async handleAdminCustomer() {
    const query = `
      query {
        customers(first:100) {
          nodes {
            id
            firstName
            lastName
            email
            phone
            tags
          }
        }
      }
    `;

    const headers = {
      'X-Shopify-Access-Token': this.keyAdmin,
    };

    await this.fetchData(this.URL_admin, headers, query).then((response) => {
      this.fillData(response.data.customers.nodes, this.elAdminData);
    });
  }

  async fetchData(url, headers, query) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ query }),
    };
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('response', response);
        return response.json();
      })
      .catch((error) => console.error('Error fetching data:', error));
  }

  fillData(data, el) {
    console.table(data);
    el.innerHTML = new Date().toLocaleString();
    el.innerHTML += JSON.stringify(data, null, 2);
  }
}

customElements.define('api-graphql', APIGraphQL);
