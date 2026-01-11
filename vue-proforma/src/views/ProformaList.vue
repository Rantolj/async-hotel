<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1>Liste des proformas</h1>
      <div class="header-actions">
        <button class="btn btn-outline-primary" @click="showFilterModal = true">
          <i class="fa fa-filter"></i> Filtre <span class="badge bg-primary" v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</span>
        </button>
        <button class="btn btn-outline-secondary" @click="showColumnModal = true">
          <i class="fa fa-columns"></i> Colonne
        </button>
        <button class="btn btn-success" @click="exportData">
          <i class="fa fa-download"></i> Exporter
        </button>
        <router-link to="/create" class="btn btn-primary">
          <i class="fa fa-plus"></i> Nouveau
        </router-link>
      </div>
    </section>

    <div class="filter-info" v-if="filters.dateMin || filters.dateMax">
      <span class="badge bg-secondary">Date min : {{ filters.dateMin }}</span>
      <span class="badge bg-secondary">Date max : {{ filters.dateMax }}</span>
    </div>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <!-- Récapitulation -->
        <div class="recap-section mb-4">
          <h4>Récapitulation</h4>
          <table class="table table-bordered recap-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Somme Montant</th>
                <th>Somme Montant Payé</th>
                <th>Somme Montant Reste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total</td>
                <td>{{ recap.count }}</td>
                <td>{{ formatMontant(recap.sommeMontant) }}</td>
                <td>{{ formatMontant(recap.sommeMontantPaye) }}</td>
                <td>{{ formatMontant(recap.sommeMontantReste) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table des proformas -->
        <table class="table table-hover" v-if="!errorMessage && proformas.length > 0">
          <thead>
            <tr>
              <th v-for="col in visibleColumns" :key="col.key" @click="sortBy(col.key)" class="sortable">
                {{ col.label }}
                <i v-if="sortColumn === col.key" :class="sortDirection === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down'"></i>
                <i v-else class="fa fa-sort text-muted"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="proforma in paginatedProformas" :key="proforma.id">
              <tr class="proforma-row">
                <td v-for="col in visibleColumns" :key="col.key">
                  <template v-if="col.key === 'id'">
                    <a href="#" @click.prevent="toggleDetails(proforma.id)" class="text-primary">
                      <i :class="expandedRows.includes(proforma.id) ? 'fa fa-minus' : 'fa fa-plus'"></i>
                    </a>
                    <router-link :to="`/detail/${proforma.id}`" class="text-primary ms-2">
                      {{ proforma.id }}
                    </router-link>
                  </template>
                  <template v-else-if="col.key === 'etatPaymentLib'">
                    <span :class="getEtatPaymentClass(proforma.etatPaymentLib)">
                      {{ proforma.etatPaymentLib || '-' }}
                    </span>
                  </template>
                  <template v-else-if="col.key === 'montant' || col.key === 'montantPaye' || col.key === 'montantReste'">
                    {{ formatMontant(proforma[col.key]) }}
                  </template>
                  <template v-else>
                    {{ proforma[col.key] ?? '-' }}
                  </template>
                </td>
              </tr>
              <!-- Détails expandés -->
              <tr v-if="expandedRows.includes(proforma.id)" class="detail-row">
                <td :colspan="visibleColumns.length">
                  <ProformaDetailsTable :proformaId="proforma.id" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <p v-if="!errorMessage && proformas.length === 0" class="text-muted text-center">
          Aucune proforma trouvée.
        </p>

        <!-- Pagination -->
        <div class="pagination-wrapper" v-if="totalPages > 1">
          <span>{{ filteredProformas.length }} résultats sur {{ proformas.length }}</span>
          <div class="pagination-controls">
            <span>Page: {{ currentPage }} sur {{ totalPages }}</span>
            <button class="btn btn-sm btn-outline-secondary" @click="prevPage" :disabled="currentPage === 1">
              &lt;
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="nextPage" :disabled="currentPage === totalPages">
              &gt;
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="toggleFullscreen">
              ⛶
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Filtre -->
    <div class="modal-overlay" v-if="showFilterModal" @click.self="showFilterModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Filtre</h5>
          <button class="btn-close" @click="showFilterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Id</label>
                <input v-model="tempFilters.id" type="text" class="form-control" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>Magasin</label>
                <select v-model="tempFilters.idMagasin" class="form-control">
                  <option value="">Tous</option>
                  <option v-for="m in magasins" :key="m.id" :value="m.id">{{ m.val }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Client</label>
                <input v-model="tempFilters.client" type="text" class="form-control" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>Date Min</label>
                <input v-model="tempFilters.dateMin" type="date" class="form-control" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Date Max</label>
                <input v-model="tempFilters.dateMax" type="date" class="form-control" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="resetFilters">Reset</button>
          <button class="btn btn-primary" @click="applyFilters">Afficher</button>
        </div>
      </div>
    </div>

    <!-- Modal Colonnes -->
    <div class="modal-overlay" v-if="showColumnModal" @click.self="showColumnModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Choix des colonnes à afficher</h5>
          <button class="btn-close" @click="showColumnModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6" v-for="(col, index) in tempColumnSelection" :key="index">
              <div class="form-group">
                <label>Colonne {{ index + 1 }}</label>
                <select v-model="tempColumnSelection[index]" class="form-control">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="c in allColumns" :key="c.key" :value="c.key">{{ c.label }}</option>
                </select>
              </div>
            </div>
          </div>
          <hr />
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Tri</label>
                <h6>Colonne</h6>
                <select v-model="tempSortColumn" class="form-control">
                  <option v-for="c in allColumns" :key="c.key" :value="c.key">{{ c.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>&nbsp;</label>
                <h6>Ordre</h6>
                <select v-model="tempSortDirection" class="form-control">
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="resetColumns">Reset</button>
          <button class="btn btn-primary" @click="applyColumns">Afficher</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'
import ProformaDetailsTable from '../components/ProformaDetailsTable.vue'

export default {
  name: 'ProformaList',
  components: {
    ProformaDetailsTable
  },
  data() {
    return {
      proformas: [],
      loading: true,
      errorMessage: '',
      showFilterModal: false,
      showColumnModal: false,
      expandedRows: [],
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Filtres
      filters: {
        id: '',
        idMagasin: '',
        client: '',
        dateMin: this.getDefaultDateMin(),
        dateMax: this.getTodayDate()
      },
      tempFilters: {},
      
      // Colonnes
      allColumns: [
        { key: 'id', label: 'Id' },
        { key: 'daty', label: 'Date' },
        { key: 'client', label: 'Client' },
        { key: 'magasin', label: 'Magasin' },
        { key: 'montant', label: 'Montant' },
        { key: 'montantPaye', label: 'Montant Payé' },
        { key: 'montantReste', label: 'Montant Restant' },
        { key: 'etatPaymentLib', label: 'État Payment' }
      ],
      selectedColumns: ['id', 'daty', 'client', 'magasin', 'montant', 'montantPaye', 'montantReste', 'etatPaymentLib'],
      tempColumnSelection: [],
      
      // Tri
      sortColumn: 'daty',
      sortDirection: 'desc',
      tempSortColumn: 'daty',
      tempSortDirection: 'desc',
      
      // Données de référence
      magasins: []
    }
  },
  computed: {
    visibleColumns() {
      return this.allColumns.filter(col => this.selectedColumns.includes(col.key))
    },
    filteredProformas() {
      let result = [...this.proformas]
      
      if (this.filters.id) {
        result = result.filter(p => p.id?.toLowerCase().includes(this.filters.id.toLowerCase()))
      }
      if (this.filters.client) {
        result = result.filter(p => p.client?.toLowerCase().includes(this.filters.client.toLowerCase()))
      }
      if (this.filters.idMagasin) {
        result = result.filter(p => p.idMagasin === this.filters.idMagasin)
      }
      if (this.filters.dateMin) {
        result = result.filter(p => p.daty >= this.filters.dateMin)
      }
      if (this.filters.dateMax) {
        result = result.filter(p => p.daty <= this.filters.dateMax)
      }
      
      // Tri
      if (this.sortColumn) {
        result.sort((a, b) => {
          let valA = a[this.sortColumn]
          let valB = b[this.sortColumn]
          
          if (typeof valA === 'number' && typeof valB === 'number') {
            return this.sortDirection === 'asc' ? valA - valB : valB - valA
          }
          
          valA = valA?.toString() || ''
          valB = valB?.toString() || ''
          return this.sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA)
        })
      }
      
      return result
    },
    paginatedProformas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredProformas.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      return Math.ceil(this.filteredProformas.length / this.itemsPerPage)
    },
    recap() {
      const data = this.filteredProformas
      return {
        count: data.length,
        sommeMontant: data.reduce((sum, p) => sum + (p.montant || 0), 0),
        sommeMontantPaye: data.reduce((sum, p) => sum + (p.montantPaye || 0), 0),
        sommeMontantReste: data.reduce((sum, p) => sum + (p.montantReste || 0), 0)
      }
    },
    activeFiltersCount() {
      let count = 0
      if (this.filters.id) count++
      if (this.filters.client) count++
      if (this.filters.idMagasin) count++
      return count
    }
  },
  mounted() {
    this.loadProformas()
    this.loadMagasins()
    this.initTempFilters()
    this.initTempColumns()
  },
  methods: {
    getTodayDate() {
      return new Date().toISOString().split('T')[0]
    },
    getDefaultDateMin() {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 5)
      return date.toISOString().split('T')[0]
    },
    async loadProformas() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await proformaService.getAll()
        this.proformas = response.data.map(p => ({
          ...p,
          daty: p.daty ?? p.date,
          montant: p.montant ?? p.montantTotal,
          montantPaye: p.montantPaye || 0,
          montantReste: (p.montantReste ?? ((p.montantTotal || 0) - (p.montantPaye || 0))),
          etatPayment: p.etatPayment,
          etatPaymentLib: p.etatPaymentLib || this.getEtatPaymentLabel(p),
          magasin: p.magasin || p.idMagasinLib || 'ATIPIK'
        }))
      } catch (e) {
        console.error('Erreur chargement proformas', e)
        this.errorMessage = 'Impossible de charger les proformas: ' + (e.response?.data?.error || e.message)
      } finally {
        this.loading = false
      }
    },
    async loadMagasins() {
      try {
        const response = await proformaService.getMagasins()
        this.magasins = response.data
      } catch (e) {
        console.error('Erreur chargement magasins', e)
        this.magasins = [{ id: 'PNT000086', val: 'Ankorahotra' }]
      }
    },
    getEtatPaymentLabel(p) {
      // Use montantReste from backend (already calculated), fallback to computing it
      const reste = p.montantReste !== undefined ? p.montantReste : ((p.montantTotal || 0) - (p.montantPaye || 0))
      const montantPaye = p.montantPaye || 0
      
      if (reste <= 0) return 'PAYE TOTALITE'
      if (montantPaye > 0) return 'ACOMPTE'
      return 'NON PAYE'
    },
    getEtatPaymentClass(etat) {
      if (etat === 'PAYE TOTALITE') return 'badge bg-success'
      if (etat === 'ACOMPTE') return 'badge bg-warning'
      return 'badge bg-danger'
    },
    formatMontant(val) {
      if (val == null) return '-'
      return new Intl.NumberFormat('fr-FR').format(val)
    },
    toggleDetails(id) {
      const index = this.expandedRows.indexOf(id)
      if (index === -1) {
        this.expandedRows.push(id)
      } else {
        this.expandedRows.splice(index, 1)
      }
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    initTempFilters() {
      this.tempFilters = { ...this.filters }
    },
    applyFilters() {
      this.filters = { ...this.tempFilters }
      this.currentPage = 1
      this.showFilterModal = false
    },
    resetFilters() {
      this.tempFilters = {
        id: '',
        idMagasin: '',
        client: '',
        dateMin: this.getDefaultDateMin(),
        dateMax: this.getTodayDate()
      }
    },
    initTempColumns() {
      this.tempColumnSelection = [...this.selectedColumns]
      this.tempSortColumn = this.sortColumn
      this.tempSortDirection = this.sortDirection
    },
    applyColumns() {
      this.selectedColumns = this.tempColumnSelection.filter(c => c)
      this.sortColumn = this.tempSortColumn
      this.sortDirection = this.tempSortDirection
      this.showColumnModal = false
    },
    resetColumns() {
      this.tempColumnSelection = ['id', 'daty', 'client', 'magasin', 'montant', 'montantPaye', 'montantReste', 'etatPaymentLib']
      this.tempSortColumn = 'daty'
      this.tempSortDirection = 'desc'
    },
    exportData() {
      const headers = this.visibleColumns.map(c => c.label).join(',')
      const rows = this.filteredProformas.map(p => 
        this.visibleColumns.map(c => p[c.key] ?? '').join(',')
      ).join('\n')
      
      const csv = headers + '\n' + rows
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'proformas.csv'
      link.click()
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-info {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.recap-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.recap-table {
  margin-bottom: 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table th, .table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background: #e9ecef;
}

.proforma-row:hover {
  background: #f8f9fa;
}

.detail-row {
  background: #f0f0f0;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}

.bg-primary { background-color: #007bff !important; color: white; }
.bg-secondary { background-color: #6c757d !important; color: white; }
.bg-success { background-color: #28a745 !important; color: white; }
.bg-warning { background-color: #ffc107 !important; color: #000; }
.bg-danger { background-color: #dc3545 !important; color: white; }

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.pagination-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

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
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.col-md-6 {
  flex: 1;
  min-width: 200px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-sm { padding: 4px 8px; font-size: 12px; }
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-outline-primary { background: white; color: #007bff; border: 1px solid #007bff; }
.btn-outline-secondary { background: white; color: #6c757d; border: 1px solid #6c757d; }

.text-primary { color: #007bff; text-decoration: none; }
.text-primary:hover { text-decoration: underline; }
.text-muted { color: #6c757d; }
.text-center { text-align: center; }
.ms-2 { margin-left: 8px; }
</style>

