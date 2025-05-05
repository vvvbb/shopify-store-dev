import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

class Slider extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.defaultParameters = {
      direction: 'horizontal',
      slidesPerView: 2.3,
      spaceBetween: 30,
      modules: [],
    };
    this.parameters = {};
  }

  connectedCallback() {
    const pagination = this.dataset.pagination === 'true';
    const navigation = this.dataset.navigation === 'true';
    const scrollbar = this.dataset.scrollbar === 'true';

    this.parameters = {
      ...this.defaultParameters,
      ...JSON.parse(this.getAttribute('data-params')),
    };

    if (pagination) {
      this.parameters.pagination = {
        el: '.swiper-pagination',
      };
      this.parameters.modules.push(Pagination);
    } else {
      this.parameters.pagination = false;
    }

    if (navigation) {
      this.parameters.navigation = {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      };
      this.parameters.modules.push(Navigation);
    } else {
      this.parameters.navigation = false;
    }

    if (scrollbar) {
      this.parameters.scrollbar = {
        el: '.swiper-scrollbar',
      };
      this.parameters.modules.push(Scrollbar);
    } else {
      this.parameters.scrollbar = false;
    }

    this.swiper = new Swiper(this, this.parameters);
  }

  disconnectedCallback() {
    console.log('Custom element removed from page.');
  }

  connectedMoveCallback() {
    console.log('Custom element moved with moveBefore()');
  }

  adoptedCallback() {
    console.log('Custom element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }
}

customElements.define('slider-products', Slider);
