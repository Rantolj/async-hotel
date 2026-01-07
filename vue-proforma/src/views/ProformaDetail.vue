<template>
  <div class="proforma-detail" v-if="proforma">
    <h2>Proforma #{{ proforma.id }}</h2>
    <p><strong>Client:</strong> {{ proforma.client }}</p>
    <p><strong>Date:</strong> {{ proforma.date }}</p>
    <p><strong>Description:</strong> {{ proforma.description }}</p>

    <h3>Détails</h3>
    <table class="table" v-if="Array.isArray(proforma.details)">
      <thead>
        <tr>
          <th>Désignation</th>
          <th>Quantité</th>
          <th>Prix Unitaire</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in proforma.details" :key="d.id || d.designation">
          <td>{{ d.designation }}</td>
          <td>{{ d.quantite }}</td>
          <td>{{ d.prixUnitaire }} Ar</td>
          <td>{{ (d.quantite || 0) * (d.prixUnitaire || 0) }} Ar</td>
        </tr>
      </tbody>
    </table>

    <p v-if="proforma.montantTotal != null"><strong>Montant Total:</strong> {{ proforma.montantTotal }} Ar</p>
    <router-link to="/" class="btn btn-secondary">Retour</router-link>
  </div>
  <div v-else>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else>Chargement...</p>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaDetail',
  data() {
    return { proforma: null, errorMessage: '' }
  },
  async mounted() {
    try {
      const { id } = this.$route.params
      const response = await proformaService.getById(id)
      this.proforma = response.data
    } catch (e) {
      console.error('Erreur chargement proforma:', e)
      this.errorMessage = e.response?.data?.error || e.message || 'Erreur inconnue lors du chargement'
    }
  }
}
</script>
