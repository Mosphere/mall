// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/login.css'
import './assets/css/product.css'
import lazyLoad from 'vue-lazy-load'
import Vuex from 'vuex'
import {currency} from './util/currency.js'
Vue.config.productionTip = false
Vue.use(lazyLoad,{
  loading: './static/loading-svg/loading-bars.svg',
  error: './static/loading-svg/loading-balls.svg'
})

Vue.use(Vuex)
Vue.filter("currency",currency)
const store = new Vuex.Store({
  state: {
    nickName: '',
    cartCount: 0
  },
  mutations:{
    getUser(state,nickName){
      state.nickName = nickName
    },
    updateCartCount(state,count){
      state.cartCount += parseInt(count);
    },
    initCartCount(state,count){
      state.cartCount = parseInt(count);
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store:store,
  template: '<App/>',
  components: { App }
})
