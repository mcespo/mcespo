<template>
  <layout>

    <!-- Learn how to use images here: https://gridsome.org/docs/images -->
    <!-- <g-image alt="Example image" src="~/favicon.png" width="135" /> -->
    <span>Oh Hai! My name is Marvin and I design and develop websites n’ stuff.</span>
    <h1>Welcome</h1>
    <p>I am a frontend developer, web designer, and aspiring fullstack developer residing in beautiful (and mostly chilly) Chicago, Illinois. I volunteer as a designer, developer, and webmaster for the nonprofit organizations, “<a href="http://a4th.org/" title="A4TH website">Artists for the Humanities</a>” and, “<a href="https://intersectionchicago.org/" title="Intersection Chicago website">Intersection</a>.” I am also an instructor/TA for, "<a href="https://www.girldevelopit.com/chapters/chicago" title="GDI Chicago Chapter website">Girl Develop It Chicago</a>", and occasionally tutor frontend development online.</p>
    <p>I also do freelance photography/video work, am at the beck and call of a <a href="https://www.instagram.com/p/BZmbSzFnZu1/?taken-by=mcespo.jpeg" title="Meli the Golden, Instagram image">golden retriever</a>, and make <a href="https://www.instagram.com/p/zpfd9aEbwo/?taken-by=mcespo.jpeg" title="Marvin Macchiato, Instagram image">wicked-good coffee</a>.</p>
    <p>Now that we have all the housekeeping taken care of, feel free to click around at some of my projects, my blog that I totally maintain consistantly, or why not <a href="mailto:mcespo@gmail.com?&amp;subject=Oh%20hello%20Marvin,%20you're%20so%20cool!&amp;body=I%20wish%20to%20be%20marginally%20as%20attractive%20as%20you%20are.%20Please%20help!%20Also,%20I%20wanted%20to%20ask..." title="Email Marvin Cespedes, and tell him all of your dreams">ask me for something</a>?</p>


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
