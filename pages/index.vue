<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">mensauni_v2</h1>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >Documentation</a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >GitHub</a>
      </div>
      <div>
        <h1 class="title">Menu</h1>
        <ul>
          <li v-for="entry of menu" :key="entry">
            <p>{{entry.date}}</p>
            <div v-for="object of entry.dishes" :key="object">
              <p>{{object.Name}}</p>
              <p>{{object.Category}}</p>
              <p>{{object.Pricing}}</p>
              <p>{{object.Tags}}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu: []
    }
  },
  async fetch() {
    let menu = await this.$http.$get('/api');
    this.menu = menu;
  },
  methods: {
    log(message) {
      console.log(message);
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
