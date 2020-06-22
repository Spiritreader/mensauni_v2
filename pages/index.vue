<template>
  <div class="container">
    <section>
      <header>
        <Logo />
        <h1 class="title">mensauni_v2</h1>
        <div class="links">
          <button @click="languageDe" class="button--green">German</button>
          <button @click="languageEn" class="button--grey">Englisch</button>
          <button @click="previous" class="button--green">Previous</button>
          <button @click="next" class="button--grey">Next</button>
          <button @click="filterTest" class="button--grey">FilterTest</button>
        </div>
      </header>
      <main>
        <h1 class="title">Menu</h1>
        <p>{{formatDate}}</p>
        <div class="menu">
          <p v-if="$fetchState.pending">Fetching menu...</p>
          <card
            v-else
            v-for="menu in menus[current].dishes"
            :name="menu.Name"
            :key="menu.date"
            :category="menu.Category"
            :pricing="menu.Pricing"
            :tags="menu.Tags"
          ></card>
        </div>
      </main>
      <footer>Made with technology ❤</footer>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: "/api",
      menus: [],
      current: 0
    }
  },
  async fetch() {
    //const delay = function(ms) {
    //  return new Promise(resolve => setTimeout(resolve, ms));
    //}
    //await delay(2000);
    let menus = await this.$http.$get(this.url);
    this.menus = menus;
  },
  fetchOnServer: false,
  computed: {
    formatDate: function() {
      let d;
      if (this.menus[this.current.date]) {
        d = new Date(this.menus[this.current])
      } else {
        d = new Date();
      }
      const ye = new Intl.DateTimeFormat('de', { year: 'numeric' }).format(d);
      const mo = new Intl.DateTimeFormat('de', { month: 'long' }).format(d);
      const da = new Intl.DateTimeFormat('de', { day: '2-digit' }).format(d);
      return `${da}. ${mo} ${ye}`;
    }
  },
  methods: {
    log(message) {
      console.log(message);
    },
    languageEn() {
        this.url = "/api?lang=en";
        this.$fetch();
    },
    languageDe() {
        this.url = "/api";
        this.$fetch();
    },
    previous() {
      if (this.current > 0) {
        this.current--;
      }
    },
    next() {
      if (this.current < this.menus.length) {
        this.current++;
      }
    },
    filterMenu(menus, excludeSup, includeTags) {
      menus.forEach((menu) => {
          let filtered = [];
          menu.dishes.forEach((item) => {
              let tags = item.Tags;
              let supplements = this.getSupplements(item.Name);
              if (!excludeSup) {
                  console.log("not");
              }
              if (includeTags) {
                  if (includeTags && tags.find(m => includeTags.includes(m)) && !supplements.some(m => excludeSup.includes(m))) {
                      filtered.push(item);
                  }
              } else if (!supplements.some(m => excludeSup.includes(m))) {
                  filtered.push(item);
              }
          });
          menu.dishes = filtered;
      })
      return menus;
    },
    getSupplements(string) {
        if (!string) {
            return [];
        }
        let ingredients = string.split("|");
        let supplements = [];
        ingredients.forEach((ing) => {
            let res = ing.match(/\(\d.*\)/);
            if (res) {
                res = res[0].replace("(", "").replace(")", "");
                res.split(",").forEach((elem) => {
                    if (!supplements.includes(elem)) {
                        supplements.push(elem);
                    }
                });
            }
        })
        return supplements.sort();
    },
    filterTest() {
      this.menus = this.filterMenu(this.menus, ["25a"], false)
      console.log(this.menus);
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
