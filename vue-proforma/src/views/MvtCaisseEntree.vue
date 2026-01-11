<template>
  <div class="content-wrapper">
    <h1 class="page-title">Saisie du mouvement de caisse entrée</h1>

    <div v-if="loading" class="text-center py-4">Chargement...</div>
    <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div v-else class="box-fiche">
      <form @submit.prevent="submit">
        <div class="form-grid">
          <div class="form-group">
            <label>Date</label>
            <input v-model="form.daty" type="date" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Désignation</label>
            <input v-model="form.designation" type="text" class="form-control" />
          </div>

          <div class="form-group">
            <label>Caisse</label>
            <select v-model="form.idCaisse" class="form-control" required>
              <option value="" disabled>-- choisir --</option>
              <option v-for="c in caisses" :key="c.id" :value="c.id">{{ c.val || c.id }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Montant</label>
            <input v-model="form.credit" type="text" class="form-control" inputmode="numeric" />
          </div>

          <div class="form-group">
            <label>ID Proforma</label>
            <input :value="idProforma" type="text" class="form-control" readonly />
          </div>

          <div class="form-group empty"></div>
        </div>

        <div class="actions">
          <button type="button" class="btn btn-secondary" @click="resetForm">Réinitialiser</button>
          <button type="submit" class="btn btn-primary">Enregistrer et valider</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import mvtCaisseService from '../services/mvtCaisseService'

export default {
  name: 'MvtCaisseEntree',
  data() {
    return {
      loading: true,
      errorMessage: '',
      idProforma: '',
      caisses: [],
      initialForm: null,
      form: {
        daty: '',
        designation: '',
        idCaisse: '',
        idDevise: 'AR',
        credit: ''
      }
    }
  },
  async mounted() {
    this.idProforma = this.$route.query.idProforma || ''
    if (!this.idProforma) {
      this.errorMessage = 'idProforma requis'
      this.loading = false
      return
    }

    try {
      const res = await mvtCaisseService.initEntree(this.idProforma)
      const mvt = res.data?.mvt || {}
      this.caisses = res.data?.caisses || []

      this.form.daty = this.toDateInput(mvt.daty) || this.toDateInput(new Date())
      this.form.designation = mvt.designation || `Paiement du ${this.formatDateHuman(new Date())}`
      this.form.idDevise = mvt.idDevise || 'AR'
      this.form.credit = this.formatThousands(mvt.credit || 0)

      // Preselect caisse if only one
      if (this.caisses.length === 1) {
        this.form.idCaisse = this.caisses[0].id
      }

      // snapshot for "Réinitialiser"
      this.initialForm = { ...this.form }
    } catch (e) {
      this.errorMessage = e.response?.data?.error || e.message || 'Erreur inconnue'
    } finally {
      this.loading = false
    }
  },
  methods: {
    toDateInput(d) {
      if (!d) return ''
      const date = typeof d === 'string' ? new Date(d) : d
      if (Number.isNaN(date.getTime())) return ''
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },
    formatDateHuman(d) {
      const date = typeof d === 'string' ? new Date(d) : d
      return date.toLocaleDateString('fr-FR')
    },
    formatThousands(val) {
      const n = Number(val) || 0
      return new Intl.NumberFormat('fr-FR').format(n)
    },
    sanitizeNumberString(s) {
      return String(s || '').replace(/\s/g, '').trim()
    },
    resetForm() {
      if (!this.initialForm) return
      this.form = { ...this.initialForm }
    },
    async submit() {
      try {
        const payload = {
          idProforma: this.idProforma,
          daty: this.form.daty,
          designation: this.form.designation,
          idCaisse: this.form.idCaisse,
          idDevise: this.form.idDevise,
          credit: this.sanitizeNumberString(this.form.credit)
        }

        const res = await mvtCaisseService.create(payload)
        const id = res.data?.id
        if (!id) {
          throw new Error('ID mouvement caisse manquant')
        }
        this.$router.replace({ name: 'mvtcaisse-fiche', params: { id } })
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors de l\'enregistrement'
      }
    },
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.content-wrapper { padding: 20px; }
.page-title { margin-bottom: 20px; font-size: 20px; font-weight: 600; }
.box-fiche { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.empty { visibility: hidden; }
.form-control { padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; }
.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.btn { padding: 8px 12px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; }
.btn-primary { background: #0d6efd; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.alert { padding: 10px 12px; border-radius: 6px; }
.alert-danger { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
.text-center { text-align: center; }
.py-4 { padding: 16px 0; }
</style>
