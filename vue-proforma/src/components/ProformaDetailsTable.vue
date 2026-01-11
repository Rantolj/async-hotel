<template>
  <div class="details-table-wrapper">
    <div v-if="loading" class="text-center py-2">Chargement des détails...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <table v-else-if="details.length > 0" class="table table-sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Produit</th>
          <th>Désignation</th>
          <th>Image</th>
          <th>Quantité (Article)</th>
          <th>Quantité (En Jour)</th>
          <th>Date de début</th>
          <th>Prix Unitaire</th>
          <th>Montant de la remise</th>
          <th>Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in details" :key="d.id">
          <td>{{ d.id }}</td>
          <td>{{ d.produitLib || d.idProduitLib || '-' }}</td>
          <td>{{ d.designation || '-' }}</td>
          <td>
            <img v-if="d.image" :src="d.image" alt="Image" class="detail-image" />
            <span v-else>-</span>
          </td>
          <td>{{ d.nombre || d.quantiteArticle || 1 }}</td>
          <td>{{ d.qte || d.quantite || 1 }}</td>
          <td>{{ d.dateDebut || '-' }}</td>
          <td>{{ formatMontant(d.pu || d.prixUnitaire) }}</td>
          <td>{{ formatMontant(d.remiseMontant || 0) }}</td>
          <td>{{ formatMontant(d.montantTotal || calculateMontant(d)) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-muted text-center">Aucun détail trouvé</p>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaDetailsTable',
  props: {
    proformaId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      details: [],
      loading: true,
      error: ''
    }
  },
  mounted() {
    this.loadDetails()
  },
  methods: {
    async loadDetails() {
      this.loading = true
      this.error = ''
      try {
        const response = await proformaService.getById(this.proformaId)
        this.details = response.data.details || []
      } catch (e) {
        console.error('Erreur chargement détails', e)
        this.error = 'Erreur: ' + (e.response?.data?.error || e.message)
      } finally {
        this.loading = false
      }
    },
    formatMontant(val) {
      if (val == null) return '-'
      return new Intl.NumberFormat('fr-FR').format(val)
    },
    calculateMontant(d) {
      const pu = d.pu || d.prixUnitaire || 0
      const qte = d.qte || d.quantite || 1
      const nombre = d.nombre || 1
      const remise = d.remise || 0
      const montant = pu * qte * nombre
      return montant - (montant * remise / 100)
    }
  }
}
</script>

<style scoped>
.details-table-wrapper {
  padding: 10px;
}

.table-sm th, .table-sm td {
  padding: 8px;
  font-size: 13px;
}

.detail-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.text-center { text-align: center; }
.text-muted { color: #6c757d; }
.text-danger { color: #dc3545; }
.py-2 { padding: 10px 0; }
</style>
