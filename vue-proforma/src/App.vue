<template>
  <div id="app">
    <nav class="navbar">
      <h1>Gestion Proforma</h1>
      <router-link to="/">Liste</router-link>
      <router-link to="/create">Nouveau</router-link>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

