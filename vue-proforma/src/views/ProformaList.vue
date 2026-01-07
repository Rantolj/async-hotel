<template>
  <div class="proforma-list">
    <h2>Liste des Proformas</h2>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <table class="table" v-if="!errorMessage && proformas.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proforma in proformas" :key="proforma.id">
            <td>{{ proforma.id }}</td>
            <td>{{ proforma.client }}</td>
            <td>{{ proforma.date }}</td>
            <td>{{ proforma.montantTotal ?? '-' }} Ar</td>
            <td>
              <router-link :to="`/detail/${proforma.id}`" class="btn btn-info">Voir</router-link>
              <router-link :to="`/edit/${proforma.id}`" class="btn btn-warning">Modifier</router-link>
              <button @click="deleteProforma(proforma.id)" class="btn btn-danger">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="!errorMessage && proformas.length === 0" class="text-muted">Aucune proforma trouvée.</p>
    </div>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaList',
  data() {
    return {
      proformas: [],
      loading: true,
      errorMessage: ''
    }
  },
  mounted() {
    this.loadProformas()
  },
  methods: {
    async loadProformas() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await proformaService.getAll()
        this.proformas = response.data
      } catch (e) {
        console.error('Erreur chargement proformas', e)
        this.errorMessage = 'Impossible de charger les proformas: ' + (e.response?.data?.error || e.message)
      } finally {
        this.loading = false
      }
    },
    async deleteProforma(id) {
      if (confirm('Voulez-vous vraiment supprimer ce proforma?')) {
        try {
          await proformaService.delete(id)
          this.loadProformas()
        } catch (e) {
          alert('Erreur lors de la suppression: ' + (e.response?.data?.error || e.message))
        }
      }
    }
  }
}
</script>

