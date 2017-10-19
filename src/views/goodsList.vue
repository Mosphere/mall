<template>
<div>
  <nav-header></nav-header>
  <nav-bread><span slot="first-level">Home</span><span slot="second-level">Goods</span></nav-bread>
  <div class="accessory-result-page accessory-page">
    <div class="container">
      <div class="filter-nav">
        <span class="sortby">Sort by:</span>
        <a href="javascript:void(0)" class="default cur">Default</a>
        <a href="javascript:;" class="price" @click="sortGoods()">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
        <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterBy()">Filter by</a>
      </div>
      <div class="accessory-result">
        <!-- filter -->
        <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterByFlag}">
          <dl class="filter-price">
            <dt>Price:</dt>
            <dd><a href="javascript:void(0)" v-bind:class = "{'cur':priceChecked == 'All'}" @click="setPriceFilter('All')">All</a></dd>
            <dd v-for="(filter,index) in priceFilter">
              <a href="javascript:void(0)" v-bind:class = "{'cur':priceChecked == index}" @click="setPriceFilter(index)">{{filter.startPrice}} - {{filter.endPrice}}</a>
            </dd>
          </dl>
        </div>

        <!-- search result accessories list -->
        <div class="accessory-list-wrap">
          <div class="accessory-list col-4">
            <ul>
              <li v-for="(good,key) in goodsList">
                <div class="pic">
                  <a href="#"><img v-bind:src=" 'static/' + good.productImage" alt=""></a>
                </div>
                <div class="main">
                  <div class="name">{{good.productName}}</div>
                  <div class="price">{{good.salePrice}}</div>
                  <div class="btn-area">
                    <a href="javascript:;" class="btn btn--m" @click="addCart(good.productId)">加入购物车</a>
                  </div>
                </div>
              </li>
              <infinite-loading @infinite="infiniteHandler">
                <span slot="no-more">我是有底线的 :(</span>
              </infinite-loading>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <modal v-show="mdShow">
    <p slot="message">请先登录，否则无法加入到购物车中</p>
    <div slot="btnGroup">
      <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
    </div>
  </modal>
  <modal v-bind:mdShow="mdShow" v-on:close="closeModal()">
    <p slot="message">{{mdShowMsg}}</p>
    <div slot="btnGroup">
      <p v-if="mdShowCart">
        <a class="btn btn--m" href="javascript:;" @click="mdShow = false">继续购物</a>
        <router-link class="btn btn--m btn-red" href="javascript:;" @click="mdShow = false" to="/cart">查看购物车</router-link>
      </p>
      <p v-else>
        <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
      </p>
    </div>
  </modal>

  <nav-footer></nav-footer>
</div>
</template>
<script>
import NavHeader from '@/components/NavHeader'
import NavFooter from '@/components/NavFooter'
import NavBread from '@/components/NavBread'
import Modal from '@/components/Modal'
import axios from 'axios'
import infiniteLoading from 'vue-infinite-loading'
export default{
  data () {
    return {
      goodsList:[],
      priceFilter:[
        {
          startPrice:"0.00",
          endPrice:"500.00"
        },
        {
          startPrice:"500.00",
          endPrice:"1000.00"
        },
        {
          startPrice:"1000.00",
          endPrice:"2000.00"
        },
        {
          startPrice:"2000.00",
          endPrice:"5000.00"
        }
      ],
      priceChecked:"All",
      overLayFlag: false,
      filterByFlag: false,
      sortFlag: true,
      page:1,
      pageSize:8,
      priceLevel:"All",
      startPrice: '',
      endPrice: '',
      isConcat: false,
      loadComplete: false,
      mdShow: false,
      mdShowCart:false,
      mdShowMsg: '',
      mdBtnGroup:[],
    }
  },
  components:{
    NavHeader,
    NavBread,
    NavFooter,
    Modal,
    infiniteLoading
  },
  mounted () {
    this.getGoodsList()
  },
  methods: {
    addCart(productId){
      axios.post('/user/addCart',{pId:productId}).then(response=>{
        const res = response.data;
        if(res.status == 200){
          this.$store.commit("updateCartCount",1);
          this.mdShow = true;
          this.mdShowCart = true;
          this.mdShowMsg = '加入购物车成功';
        }else{
          this.mdShow = true;
          this.mdShowMsg = '请先登录，否则无法加入到购物车';
        }
      }).catch(err=>{
          console.log(err);
      })
    },
    getGoodsList(){
      var query = {
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sortFlag?1:-1,
          priceLevel:this.priceLevel,
          startPrice: this.startPrice,
          endPrice: this.endPrice,
      }
      axios.get("/goods/list",{params:query}).then(res=>{
        const result = res.data
        if(this.isConcat){
          this.goodsList = this.goodsList.concat(result.goods.list);
          if(result.goods.list.length < this.pageSize){
            this.loadComplete = true;
          }else{
            this.loadComplete = false;
          }
        }else{
          this.goodsList = result.goods.list;
          this.loadComplete = false;
        }
      }).catch(error=>{
        console.log(error)
      })
    },
    sortGoods(){
      this.sortFlag = !this.sortFlag;
      this.getGoodsList();
    },
    setPriceFilter(index){
      this.priceChecked = index;
      this.priceLevel = index;
      if(this.priceLevel != 'All'){
          this.startPrice = this.priceFilter[index].startPrice;
          this.endPrice = this.priceFilter[index].endPrice;
      }
      this.page = 1;
      this.isConcat = false;
      this.getGoodsList();
      this.closePop();
    },
    showFilterBy(){
      this.filterByFlag = true;
      this.overLayFlag = true;
    },
    closePop(){
      this.filterByFlag = false;
      this.overLayFlag = false;
    },
    infiniteHandler($state){
      this.page++;
      this.isConcat = true;
      setTimeout(() => {
        if(this.loadComplete){
          $state.complete();
        }else{
          this.getGoodsList();
          $state.loaded();
        }
      }, 1000);
    },
    closeModal(){
      this.mdShow = false;
    }
  }
}
</script>