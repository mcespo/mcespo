<template>
  <layout>


    <span>This was a mistake.</span>

    <!-- <p class="home-links">
      <a href="https://gridsome.org/docs" target="_blank" rel="noopener">Gridsome Docs</a>
      <a href="https://github.com/gridsome/gridsome" target="_blank" rel="noopener">GitHub</a>
    </p> -->

  </layout>
</template>

<script>
export default {
 // ..
}
</script>

<style lang="scss">
.layout {
    margin: 0 auto;
    width: 80vw;
    @media screen and (min-width: 55rem) {
        width: 75ch;
    }
}
span {
    font-weight: 200;
    text-align: center;
    margin: 3rem 0;
    font-size: 2.25rem;
    line-height: 2.25rem;
    @media screen and (min-width: 55rem) {
        font-size: 3.5rem;
        line-height: 3.25rem;
    }
}
</style>
