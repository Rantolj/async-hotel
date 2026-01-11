<template>
  <div class="content-wrapper">
    <h1 class="box-title">
      <a href="#" class="back-link" @click.prevent="$router.back()">
        <span class="back-icon">&lt;</span>
      </a>
      Fiche du mouvement de caisse
    </h1>

    <div v-if="loading" class="text-center py-4">Chargement...</div>
    <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div v-else-if="mvt" class="box-fiche">
      <div class="fiche-grid">
        <div class="fiche-item">
          <span class="label">Id</span>
          <span class="value text-primary">{{ mvt.id }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Désignation</span>
          <span class="value">{{ mvt.designation || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Caisse</span>
          <span class="value">{{ mvt.idCaisseLib || mvt.idCaisse || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Date</span>
          <span class="value">{{ formatDate(mvt.daty) }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">IdCaisse</span>
          <span class="value text-primary">{{ mvt.idCaisse || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Débit</span>
          <span class="value">{{ formatMontant(mvt.debit) }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Crédit</span>
          <span class="value">{{ formatMontant(mvt.credit) }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">État</span>
          <span class="value" :class="etatClass">{{ mvt.etatLib || mvt.etat || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Facture</span>
          <span class="value">
            <a v-if="legacyFactureUrl" class="text-primary" :href="legacyFactureUrl" target="_blank" rel="noreferrer">{{ mvt.idOrigine }}</a>
            <span v-else class="text-primary">{{ mvt.idOrigine || '-' }}</span>
          </span>
        </div>

        <div class="fiche-item">
          <span class="label">Tiers</span>
          <span class="value">{{ mvt.tiers || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">ID OP</span>
          <span class="value">{{ mvt.idOp || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Taux</span>
          <span class="value">{{ mvt.taux ?? '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Compte</span>
          <span class="value">{{ mvt.compte || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Devise</span>
          <span class="value">{{ mvt.idDevise || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Mode de payment</span>
          <span class="value">{{ mvt.idmodepaiementlib || '-' }}</span>
        </div>

        <div class="fiche-item">
          <span class="label">Proforma</span>
          <span class="value">
            <router-link v-if="mvt.idproforma" class="text-primary" :to="`/detail/${mvt.idproforma}`">{{ mvt.idproforma }}</router-link>
            <span v-else>-</span>
          </span>
        </div>
      </div>

      <div class="fiche-actions">
        <button class="btn btn-primary" v-if="canViser" @click="viser">Viser</button>
      </div>
    </div>
  </div>
</template>

<script>
import mvtCaisseService from '../services/mvtCaisseService'

export default {
  name: 'MvtCaisseFiche',
  data() {
    return {
      loading: true,
      errorMessage: '',
      mvt: null
    }
  },
  computed: {
    canViser() {
      const e = this.mvt?.etat
      return e != null && e > 0 && e < 11
    },
    etatClass() {
      const lib = (this.mvt?.etatLib || '').toString().toLowerCase()
      const etat = this.mvt?.etat
      if (etat === 11 || lib.includes('trait')) return 'text-success'
      return ''
    },
    legacyFactureUrl() {
      const idOrigine = this.mvt?.idOrigine
      if (!idOrigine) return ''

      const legacyBase = (import.meta.env.VITE_LEGACY_BASE_URL || 'http://127.0.0.1:8080/asynclocation').replace(/\/$/, '')
      if (idOrigine.startsWith('VNT')) {
        return `${legacyBase}/module.jsp?but=vente/vente-fiche.jsp&id=${encodeURIComponent(idOrigine)}`
      }
      if (idOrigine.startsWith('FCF')) {
        return `${legacyBase}/module.jsp?but=facturefournisseur/facturefournisseur-fiche.jsp&id=${encodeURIComponent(idOrigine)}`
      }
      return ''
    }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.errorMessage = ''
      try {
        const id = this.$route.params.id
        const res = await mvtCaisseService.getById(id)
        this.mvt = res.data
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur inconnue'
      } finally {
        this.loading = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      if (Number.isNaN(date.getTime())) return String(dateStr)
      return date.toLocaleDateString('fr-FR')
    },
    formatMontant(v) {
      if (v == null) return '-'
      return new Intl.NumberFormat('fr-FR').format(v)
    },
    async viser() {
      try {
        const id = this.$route.params.id
        await mvtCaisseService.valider(id)
        await this.load()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors de la validation'
      }
    }
  }
}
</script>

<style scoped>
.content-wrapper { padding: 20px; }
.box-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 18px; }
.back-link { color: #6c757d; text-decoration: none; font-size: 20px; }
.back-icon { font-weight: bold; }
.box-fiche { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
.fiche-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.fiche-item { display: flex; flex-direction: column; }
.label { font-size: 12px; color: #6c757d; margin-bottom: 4px; }
.value { font-size: 14px; font-weight: 500; }
.text-primary { color: #0d6efd; }
.text-success { color: #198754; font-weight: 700; }
.fiche-actions { display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; padding-top: 12px; }
.btn { padding: 8px 12px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; }
.btn-primary { background: #0d6efd; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.alert { padding: 10px 12px; border-radius: 6px; }
.alert-danger { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
.text-center { text-align: center; }
.py-4 { padding: 16px 0; }
</style>
