<template>
  <div id="app">
    <nav class="navbar">
      <h1>Gestion Hôtel</h1>
      <div class="nav-section">
        <span class="nav-label">Proforma:</span>
        <router-link to="/">Liste</router-link>
        <router-link to="/create">Nouveau</router-link>
      </div>
      <div class="nav-section">
        <span class="nav-label">Réservation:</span>
        <router-link to="/reservation/calendar">Calendrier</router-link>
      </div>
      <div class="nav-section">
        <span class="nav-label">Caisse:</span>
        <router-link to="/caisse/mvt/entree">Entrée</router-link>
      </div>
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

<style>
.navbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  background: #3c8dbc;
  color: white;
}

.navbar h1 {
  margin: 0;
  font-size: 20px;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-label {
  font-weight: bold;
  font-size: 13px;
  opacity: 0.8;
}

.navbar a {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
}

.navbar a:hover,
.navbar a.router-link-active {
  background: rgba(255,255,255,0.2);
}

.container {
  padding: 20px;
}
</style>

