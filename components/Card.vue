<template>
  <div>
    <div class="menuCard">
      <h4 class="title">{{category}}</h4>
      <div class="menuName">{{name}}</div>
      <div class="menuPricing">{{pricing}}</div>
      <div class="menuTags">
        <span v-for="tag in tags" :key="tag">{{tag}} </span>
      </div>
    </div>
  </div>
</template>


<script>
export default {
    props: {
        category: String,
        name: String,
        pricing: String,
        tags: Array
    }
}
</script>

<style lang="scss">
$opacity: 0.4;
$transition: 0.2s;
$shadow-bri: 90;
$shadow: 2px 2px 9px 0px rgba($shadow-bri, $shadow-bri, $shadow-bri, $opacity);

h4 {
  font-weight: 400 !important;
  transition: $transition;
}

.menuCard {
  display: grid;
  //-webkit-box-shadow: $shadow;
  //-moz-box-shadow:    $shadow;
  //box-shadow:         $shadow;
  border-radius: 7px;
  border: 1px solid #35495e;
  background: #ffffff;
  grid-template-columns: [c1]50% [c2]25% [c3]25% [end];
  grid-template-rows: auto;
  margin: 15px auto;
  padding: 15px;
  text-align: left;
  transition: $transition;

  &:hover {
    color: #fff;
    background-color: #35495e;
    transition: $transition;
  }
  &:hover h4 {
    color: #fff;
    transition: $transition;
  }
}

.menuName {
  grid-column: c1 / c2;
}

.menuPricing {
  grid-column: c2 / c3;
  text-align: right;
}

.menuTags {
  grid-column: c3 / end;
  text-align: right;
}
</style>