<template>
  <div class="content-wrapper">
    <div v-if="loading" class="text-center py-4">
      <p>Chargement...</p>
    </div>
    <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-else-if="proforma" class="proforma-fiche">
      <h1 class="box-title">
        <router-link to="/" class="back-link">
          <span class="back-icon">&lt;</span>
        </router-link>
        Fiche de la facture proforma
      </h1>

      <!-- Informations principales -->
      <div class="box-fiche">
        <div class="fiche-grid">
          <div class="fiche-item">
            <span class="label">Id</span>
            <span class="value text-primary">{{ proforma.id }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Désignation</span>
            <span class="value">{{ proforma.designation || '-' }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Magasin</span>
            <span class="value">{{ proforma.magasin || proforma.idMagasinLib || 'ATIPIK' }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Date</span>
            <span class="value">{{ formatDate(proforma.date || proforma.daty) }}</span>
          </div>

          <div class="fiche-item">
            <span class="label">Remarque</span>
            <span class="value">{{ proforma.remarque || proforma.description || '-' }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">État</span>
            <span class="value">{{ proforma.etatLib || 'CREE' }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Devise</span>
            <span class="value">{{ proforma.devise || 'AR' }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Client</span>
            <span class="value text-primary">{{ proforma.client || proforma.idClientLib }}</span>
          </div>

          <div class="fiche-item">
            <span class="label">Montant sans remise</span>
            <span class="value">{{ formatMontant(proforma.montant || proforma.montantTotal) }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Montant de la remise</span>
            <span class="value">{{ formatMontant(proforma.montantRemise || 0) }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Montant restant</span>
            <span class="value">{{ formatMontant(proforma.montantReste || 0) }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Lieu de location</span>
            <span class="value">{{ proforma.lieuLocation || '-' }}</span>
          </div>

          <div class="fiche-item">
            <span class="label">Remise</span>
            <span class="value">{{ proforma.remise || 0 }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">Période</span>
            <span class="value">{{ proforma.periode || formatDate(proforma.date || proforma.daty) }}</span>
          </div>
          <div class="fiche-item">
            <span class="label">État Payment</span>
            <span :class="getEtatPaymentClass(proforma.etatPaymentLib)">
              {{ proforma.etatPaymentLib || 'ACOMPTE' }}
            </span>
          </div>
          <div class="fiche-item"></div>
        </div>

        <!-- Actions -->
        <div class="fiche-actions">
          <a :href="getPdfUrl()" class="btn btn-tertiary" target="_blank">Imprimer en PDF</a>
          <button class="btn btn-secondary" @click="createBC" v-if="proforma.etat < 11">Créer BC</button>
          <router-link :to="`/edit/${proforma.id}`" class="btn btn-secondary" v-if="proforma.etat < 11">Modifier</router-link>
          <button class="btn btn-primary" @click="goToPayer()" v-if="proforma.etat < 11 && proforma.etat > 0">Payer</button>
        </div>
      </div>

      <!-- Onglets -->
      <div class="tabs-wrapper">
        <div class="nav-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'details' }]" 
            @click="activeTab = 'details'"
          >
            Détails
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'proforma-lie' }]" 
            @click="activeTab = 'proforma-lie'"
          >
            Proforma Lié
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'reservations' }]" 
            @click="activeTab = 'reservations'"
          >
            Liste des Réservations
          </button>
        </div>

        <div class="tab-content">
          <!-- Tab Détails -->
          <div v-if="activeTab === 'details'" class="tab-pane">
            <table class="table" v-if="proforma.details && proforma.details.length > 0">
              <thead>
                <tr>
                  <th @click="sortDetailsBy('id')" class="sortable">
                    Id <i :class="getSortIcon('id')"></i>
                  </th>
                  <th @click="sortDetailsBy('produit')" class="sortable">
                    Produit <i :class="getSortIcon('produit')"></i>
                  </th>
                  <th @click="sortDetailsBy('designation')" class="sortable">
                    Désignation <i :class="getSortIcon('designation')"></i>
                  </th>
                  <th @click="sortDetailsBy('image')" class="sortable">
                    Image <i :class="getSortIcon('image')"></i>
                  </th>
                  <th @click="sortDetailsBy('nombre')" class="sortable">
                    Quantité (Article) <i :class="getSortIcon('nombre')"></i>
                  </th>
                  <th @click="sortDetailsBy('qte')" class="sortable">
                    Quantité (En Jour) <i :class="getSortIcon('qte')"></i>
                  </th>
                  <th @click="sortDetailsBy('dateDebut')" class="sortable">
                    Date de Début <i :class="getSortIcon('dateDebut')"></i>
                  </th>
                  <th @click="sortDetailsBy('pu')" class="sortable">
                    Prix Unitaire <i :class="getSortIcon('pu')"></i>
                  </th>
                  <th @click="sortDetailsBy('remiseMontant')" class="sortable">
                    Montant de la Remise <i :class="getSortIcon('remiseMontant')"></i>
                  </th>
                  <th @click="sortDetailsBy('montant')" class="sortable">
                    Montant <i :class="getSortIcon('montant')"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in sortedDetails" :key="d.id">
                  <td>
                    <a href="#" class="text-primary">{{ d.id }}</a>
                  </td>
                  <td>{{ d.produit || d.idProduitLib || '-' }}</td>
                  <td>{{ d.designation || '-' }}</td>
                  <td>
                    <img v-if="d.image" :src="d.image" class="detail-image" />
                    <span v-else>📷</span>
                  </td>
                  <td>{{ d.nombre || 1 }}</td>
                  <td>{{ d.qte || d.quantite || 1 }}</td>
                  <td>{{ d.dateDebut || '-' }}</td>
                  <td>{{ formatMontant(d.pu || d.prixUnitaire) }}</td>
                  <td>{{ formatMontant(d.remiseMontant || 0) }}</td>
                  <td>{{ formatMontant(d.montant || calculateMontant(d)) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-muted text-center">Aucun détail trouvé</p>
          </div>

          <!-- Tab Proforma Lié -->
          <div v-if="activeTab === 'proforma-lie'" class="tab-pane">
            <p class="text-muted text-center">Aucun proforma lié</p>
          </div>

          <!-- Tab Réservations -->
          <div v-if="activeTab === 'reservations'" class="tab-pane">
            <p class="text-muted text-center">Aucune réservation</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Payer -->
    <div class="modal-overlay" v-if="showPayerModal" @click.self="showPayerModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Paiement</h5>
          <button class="btn-close" @click="showPayerModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Montant à payer</label>
            <input v-model.number="paiement.montant" type="number" class="form-control" />
          </div>
          <div class="form-group">
            <label>Mode de paiement</label>
            <select v-model="paiement.mode" class="form-control">
              <option value="espece">Espèce</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showPayerModal = false">Annuler</button>
          <button class="btn btn-primary" @click="effectuerPaiement">Valider</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaDetail',
  data() {
    return { 
      proforma: null, 
      errorMessage: '',
      loading: true,
      activeTab: 'details',
      detailsSortColumn: '',
      detailsSortDirection: 'asc',
      showPayerModal: false,
      paiement: {
        montant: 0,
        mode: 'espece'
      }
    }
  },
  computed: {
    sortedDetails() {
      if (!this.proforma?.details) return []
      let details = [...this.proforma.details]
      
      if (this.detailsSortColumn) {
        details.sort((a, b) => {
          let valA = a[this.detailsSortColumn]
          let valB = b[this.detailsSortColumn]
          
          if (typeof valA === 'number' && typeof valB === 'number') {
            return this.detailsSortDirection === 'asc' ? valA - valB : valB - valA
          }
          
          valA = valA?.toString() || ''
          valB = valB?.toString() || ''
          return this.detailsSortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA)
        })
      }
      
      return details
    }
  },
  async mounted() {
    await this.loadProforma()
  },
  methods: {
    async loadProforma() {
      this.loading = true
      try {
        const { id } = this.$route.params
        const response = await proformaService.getById(id)
        this.proforma = response.data
        
        // Set default payment amount
        this.paiement.montant = this.proforma.montantReste || 
          (this.proforma.montantTotal - (this.proforma.montantPaye || 0))
      } catch (e) {
        console.error('Erreur chargement proforma:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur inconnue lors du chargement'
      } finally {
        this.loading = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const options = { day: '2-digit', month: 'long', year: 'numeric' }
      return date.toLocaleDateString('fr-FR', options)
    },
    formatMontant(val) {
      if (val == null) return '-'
      return new Intl.NumberFormat('fr-FR').format(val)
    },
    getEtatPaymentClass(etat) {
      if (etat === 'PAYE TOTALITE') return 'badge bg-success'
      if (etat === 'ACOMPTE') return 'badge bg-warning'
      return 'badge bg-danger'
    },
    calculateMontant(d) {
      const pu = d.pu || d.prixUnitaire || 0
      const qte = d.qte || d.quantite || 1
      const nombre = d.nombre || 1
      return pu * qte * nombre
    },
    sortDetailsBy(column) {
      if (this.detailsSortColumn === column) {
        this.detailsSortDirection = this.detailsSortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.detailsSortColumn = column
        this.detailsSortDirection = 'asc'
      }
    },
    getSortIcon(column) {
      if (this.detailsSortColumn !== column) return 'sort-icon'
      return this.detailsSortDirection === 'asc' ? 'sort-icon-asc' : 'sort-icon-desc'
    },
    getPdfUrl() {
      return `/rest/export/proforma?id=${this.proforma.id}`
    },
    async createBC() {
      try {
        await proformaService.valider(this.proforma.id)
        alert('Bon de commande créé avec succès')
        this.loadProforma()
      } catch (e) {
        alert('Erreur: ' + (e.response?.data?.error || e.message))
      }
    },
    async effectuerPaiement() {
      try {
        await proformaService.payer(this.proforma.id, this.paiement)
        this.showPayerModal = false
        alert('Paiement effectué avec succès')
        this.loadProforma()
      } catch (e) {
        alert('Erreur: ' + (e.response?.data?.error || e.message))
      }
    },
    goToPayer() {
      const idProforma = this.proforma?.id || this.$route.params.id
      this.$router.push({ name: 'mvtcaisse-entree', query: { idProforma } })
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

.box-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 18px;
}

.back-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 20px;
}

.back-icon {
  font-weight: bold;
}

.box-fiche {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.fiche-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.fiche-item {
  display: flex;
  flex-direction: column;
}

.fiche-item .label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.fiche-item .value {
  font-size: 14px;
  font-weight: 500;
}

.text-primary {
  color: #007bff;
}

.fiche-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

/* Tabs */
.tabs-wrapper {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.nav-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #6c757d;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #007bff;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  padding: 20px;
}

.tab-pane {
  min-height: 200px;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 13px;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background: #e9ecef;
}

.detail-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.sort-icon::after { content: '↕'; opacity: 0.3; }
.sort-icon-asc::after { content: '↑'; }
.sort-icon-desc::after { content: '↓'; }

/* Badges */
.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}

.bg-success { background-color: #28a745 !important; color: white; }
.bg-warning { background-color: #ffc107 !important; color: #000; }
.bg-danger { background-color: #dc3545 !important; color: white; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-tertiary { background: #e9ecef; color: #495057; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h5 { margin: 0; }

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body { padding: 20px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
}

.form-group { margin-bottom: 15px; }

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.text-center { text-align: center; }
.text-muted { color: #6c757d; }
.py-4 { padding: 20px 0; }

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 992px) {
  .fiche-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .fiche-grid {
    grid-template-columns: 1fr;
  }
}
</style>
