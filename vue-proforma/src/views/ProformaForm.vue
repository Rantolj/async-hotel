<template>
  <div class="proforma-form">
    <h2>{{ isEdit ? 'Modifier' : 'Nouveau' }} Proforma</h2>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="saveProforma">
      <div class="form-group">
        <label>Client</label>
        <input v-model="proforma.client" type="text" class="form-control" required />
      </div>
      <div class="form-group">
        <label>Date</label>
        <input v-model="proforma.date" type="date" class="form-control" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="proforma.description" class="form-control"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Enregistrer</button>
      <router-link to="/" class="btn btn-secondary">Annuler</router-link>
    </form>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaForm',
  data() {
    return {
      proforma: {
        client: '',
        date: '',
        description: ''
      },
      errorMessage: ''
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id
    }
  },
  async mounted() {
    if (this.isEdit) {
      try {
        const response = await proformaService.getById(this.$route.params.id)
        this.proforma = response.data
      } catch (e) {
        this.errorMessage = 'Impossible de charger le proforma: ' + (e.response?.data?.error || e.message)
      }
    }
  },
  methods: {
    async saveProforma() {
      this.errorMessage = ''
      try {
        if (this.isEdit) {
          await proformaService.update(this.$route.params.id, this.proforma)
        } else {
          await proformaService.create(this.proforma)
        }
        this.$router.push('/')
      } catch (e) {
        console.error('Erreur enregistrement proforma', e)
        this.errorMessage = 'Impossible d\'enregistrer: ' + (e.response?.data?.error || e.message)
      }
    }
  }
}
</script>

