class FormCustomerInfo extends HTMLElement {
  constructor() {
    super();
    this.elForm = this.querySelector('form');
    this.elBtnSubmit = this.querySelector('button[type="submit"]');
  }

  connectedCallback() {
    this.elBtnSubmit.addEventListener('click', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.elForm);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);
    this.elForm.reset();
  }
}

customElements.define('form-customer-info', FormCustomerInfo);
