<template>
  <div class="content-wrapper">
    <h2>Saisie Proforma</h2>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="saveProforma">
      <!-- Section principale -->
      <div class="box-fiche">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Date</label>
              <input v-model="proforma.daty" type="date" class="form-control" required />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Désignation</label>
              <input v-model="proforma.designation" type="text" class="form-control" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Remarque</label>
              <input v-model="proforma.remarque" type="text" class="form-control" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Client</label>
              <div class="input-group">
                <input v-model="proforma.idClientLib" type="text" class="form-control" readonly placeholder="Sélectionner un client" />
                <input v-model="proforma.idClient" type="hidden" />
                <button type="button" class="btn btn-outline-secondary" @click="showClientModal = true">
                  🔍
                </button>
                <button type="button" class="btn btn-outline-primary" @click="showAddClientModal = true">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Remise (En%)</label>
              <input v-model.number="proforma.remise" type="number" class="form-control" min="0" max="100" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Lieu de location</label>
              <input v-model="proforma.lieuLocation" type="text" class="form-control" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Caution (En%)</label>
              <input v-model.number="proforma.caution" type="number" class="form-control" min="0" max="100" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Date de début de réservation</label>
              <input v-model="proforma.datePrevRes" type="date" class="form-control" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Magasin</label>
              <input v-model="proforma.idMagasinLib" type="text" class="form-control" readonly />
              <input v-model="proforma.idMagasin" type="hidden" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="resetForm">Réinitialiser</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">Enregistrer</button>
        </div>
      </div>

      <!-- Section Import Excel -->
      <div class="box-fiche mt-4">
        <div class="form-group">
          <label>Entrez le chemin de votre fichier Excel</label>
          <div class="input-group">
            <input type="file" ref="excelFile" class="form-control" accept=".xlsx,.xls" @change="handleFileChange" />
            <button type="button" class="btn btn-secondary" @click="loadExcel">Load</button>
          </div>
        </div>
      </div>

      <!-- Section Détails (lignes multiples) -->
      <div class="box-fiche mt-4">
        <div class="details-header">
          <div class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></div>
          <div class="col-produit">Produit</div>
          <div class="col-designation">Désignation</div>
          <div class="col-dimension">Dimension</div>
          <div class="col-qte-article">Quantité (Article)</div>
          <div class="col-qte-jour">Quantité (En Jour)</div>
          <div class="col-pu">Prix Unitaire</div>
          <div class="col-unite">Unité</div>
          <div class="col-date">Date De Début</div>
          <div class="col-image">Image</div>
          <div class="col-action"></div>
        </div>

        <div class="detail-row" v-for="(detail, index) in details" :key="index">
          <div class="col-check">
            <input type="checkbox" v-model="detail.selected" />
          </div>
          <div class="col-produit">
            <div class="input-group-sm">
              <input v-model="detail.idProduitLib" type="text" class="form-control form-control-sm" readonly placeholder="Produit" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="openProduitModal(index)">🔍</button>
            </div>
            <input v-model="detail.idProduit" type="hidden" />
          </div>
          <div class="col-designation">
            <input v-model="detail.designation" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-dimension">
            <input v-model="detail.dimension" type="text" class="form-control form-control-sm" readonly />
          </div>
          <div class="col-qte-article">
            <input v-model.number="detail.nombre" type="number" class="form-control form-control-sm" min="1" />
          </div>
          <div class="col-qte-jour">
            <input v-model.number="detail.qte" type="number" class="form-control form-control-sm" min="1" />
          </div>
          <div class="col-pu">
            <input v-model.number="detail.pu" type="number" class="form-control form-control-sm" min="0" />
          </div>
          <div class="col-unite">
            <input v-model="detail.unite" type="text" class="form-control form-control-sm" readonly />
          </div>
          <div class="col-date">
            <input v-model="detail.dateDebut" type="date" class="form-control form-control-sm" />
          </div>
          <div class="col-image">
            <img v-if="detail.image" :src="detail.image" class="detail-image-preview" />
            <span v-else class="no-image">📷</span>
          </div>
          <div class="col-action">
            <button type="button" class="btn btn-sm btn-danger" @click="removeLine(index)">×</button>
          </div>
        </div>

        <div class="details-footer">
          <button type="button" class="btn btn-danger" @click="removeSelectedLines">Supprimer</button>
          <div class="footer-actions">
            <button type="button" class="btn btn-link" @click="addLines(10)">Ajouter dix lignes</button>
            <button type="button" class="btn btn-link" @click="addLines(1)">Ajouter une ligne</button>
            <button type="button" class="btn btn-secondary" @click="resetDetails">Réinitialiser</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">Enregistrer</button>
          </div>
        </div>
      </div>
    </form>

    <!-- Modal Client -->
    <div class="modal-overlay" v-if="showClientModal" @click.self="showClientModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h5>Sélectionner un client</h5>
          <button class="btn-close" @click="showClientModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input v-model="clientSearch" type="text" class="form-control" placeholder="Rechercher..." @input="debouncedSearchClients" />
            <button type="button" class="btn btn-outline-primary" @click="showAddClientModal = true">+</button>
          </div>
          <div v-if="loadingClients" class="text-center">Chargement...</div>
          <table v-else class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in clients" :key="client.id" @click="selectClient(client)" class="clickable-row">
                <td>{{ client.id }}</td>
                <td>{{ client.nom }}</td>
                <td>{{ client.contact }}</td>
              </tr>
              <tr v-if="clients.length === 0">
                <td colspan="3" class="text-center">Aucun client trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Produit -->
    <div class="modal-overlay" v-if="showProduitModal" @click.self="showProduitModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h5>Sélectionner un produit</h5>
          <button class="btn-close" @click="showProduitModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <input v-model="produitSearch" type="text" class="form-control mb-3" placeholder="Rechercher..." @input="debouncedSearchProduits" />
          <div v-if="loadingProduits" class="text-center">Chargement...</div>
          <table v-else class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Libellé</th>
                <th>Prix</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produit in produits" :key="produit.id" @click="selectProduit(produit)" class="clickable-row">
                <td>{{ produit.id }}</td>
                <td>{{ produit.libelle }}</td>
                <td>{{ formatMontant(produit.pu) }}</td>
                <td>{{ produit.unite }}</td>
              </tr>
              <tr v-if="produits.length === 0">
                <td colspan="4" class="text-center">Aucun produit trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import proformaService from '../services/proformaService'

export default {
  name: 'ProformaForm',
  data() {
    return {
      proforma: {
        daty: this.getTodayDate(),
        designation: '',
        remarque: '',
        idClient: '',
        idClientLib: '',
        remise: 0,
        caution: 50,
        lieuLocation: '',
        datePrevRes: this.getTodayDate(),
        idMagasin: 'PNT000086',
        idMagasinLib: 'Ankorahotra'
      },
      details: [],
      nombreLignes: 10,
      selectAll: false,
      errorMessage: '',
      saving: false,
      
      // Modals
      showClientModal: false,
      showAddClientModal: false,
      showProduitModal: false,
      currentDetailIndex: null,
      
      // Data
      clients: [],
      produits: [],
      clientSearch: '',
      produitSearch: '',
      loadingClients: false,
      loadingProduits: false,
      searchTimeout: null
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id
    }
  },
  async mounted() {
    this.initDetails()
    await this.loadClients()
    await this.loadProduits()
    
    if (this.isEdit) {
      await this.loadProforma()
    }
  },
  methods: {
    getTodayDate() {
      return new Date().toISOString().split('T')[0]
    },
    initDetails() {
      this.details = []
      for (let i = 0; i < this.nombreLignes; i++) {
        this.details.push(this.createEmptyDetail())
      }
    },
    createEmptyDetail() {
      return {
        selected: false,
        idProduit: '',
        idProduitLib: '',
        designation: '',
        dimension: '',
        nombre: 1,
        qte: 1,
        pu: 0,
        unite: '',
        dateDebut: this.getTodayDate(),
        image: '',
        tva: 0,
        remise: 0
      }
    },
    async loadProforma() {
      try {
        const response = await proformaService.getById(this.$route.params.id)
        const data = response.data
        
        this.proforma = {
          daty: data.date || data.daty,
          designation: data.designation || '',
          remarque: data.description || data.remarque || '',
          idClient: data.idClient || '',
          idClientLib: data.client || data.idClientLib || '',
          remise: data.remise || 0,
          caution: data.caution || 50,
          lieuLocation: data.lieuLocation || '',
          datePrevRes: data.datePrevRes || this.getTodayDate(),
          idMagasin: data.idMagasin || 'PNT000086',
          idMagasinLib: data.idMagasinLib || 'Ankorahotra'
        }
        
        if (data.details && data.details.length > 0) {
          this.details = data.details.map(d => ({
            selected: false,
            idProduit: d.idProduit || '',
            idProduitLib: d.idProduitLib || d.produitLib || '',
            designation: d.designation || '',
            dimension: d.dimension || '',
            nombre: d.nombre || d.quantiteArticle || 1,
            qte: d.qte || d.quantite || 1,
            pu: d.pu || d.prixUnitaire || 0,
            unite: d.unite || '',
            dateDebut: d.dateDebut || this.getTodayDate(),
            image: d.image || '',
            tva: d.tva || 0,
            remise: d.remise || 0
          }))
          
          // Ajouter des lignes vides si moins de 10
          while (this.details.length < this.nombreLignes) {
            this.details.push(this.createEmptyDetail())
          }
        }
      } catch (e) {
        this.errorMessage = 'Impossible de charger le proforma: ' + (e.response?.data?.error || e.message)
      }
    },
    async loadClients(search = '') {
      this.loadingClients = true
      try {
        const response = await proformaService.getClients(search)
        this.clients = response.data || []
      } catch (e) {
        console.error('Erreur chargement clients', e)
        this.clients = []
      } finally {
        this.loadingClients = false
      }
    },
    async loadProduits(search = '') {
      this.loadingProduits = true
      try {
        const response = await proformaService.getProduits(search)
        this.produits = response.data || []
      } catch (e) {
        console.error('Erreur chargement produits', e)
        this.produits = []
      } finally {
        this.loadingProduits = false
      }
    },
    debouncedSearchClients() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadClients(this.clientSearch)
      }, 300)
    },
    debouncedSearchProduits() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadProduits(this.produitSearch)
      }, 300)
    },
    selectClient(client) {
      this.proforma.idClient = client.id
      this.proforma.idClientLib = client.nom
      this.showClientModal = false
    },
    openProduitModal(index) {
      this.currentDetailIndex = index
      this.produitSearch = ''
      this.showProduitModal = true
    },
    selectProduit(produit) {
      if (this.currentDetailIndex !== null) {
        const detail = this.details[this.currentDetailIndex]
        detail.idProduit = produit.id
        detail.idProduitLib = produit.libelle
        detail.designation = produit.libelle
        detail.pu = produit.pu || produit.puVente || 0
        detail.unite = produit.unite || ''
        detail.tva = produit.tva || 0
        detail.dimension = produit.dimension || ''
        detail.image = produit.image || ''
      }
      this.showProduitModal = false
    },
    addLines(count) {
      for (let i = 0; i < count; i++) {
        this.details.push(this.createEmptyDetail())
      }
    },
    removeLine(index) {
      this.details.splice(index, 1)
    },
    toggleSelectAll() {
      this.details.forEach(d => d.selected = this.selectAll)
    },
    removeSelectedLines() {
      this.details = this.details.filter(d => !d.selected)
      this.selectAll = false
      
      if (this.details.length === 0) {
        this.initDetails()
      }
    },
    resetForm() {
      this.proforma = {
        daty: this.getTodayDate(),
        designation: '',
        remarque: '',
        idClient: '',
        idClientLib: '',
        remise: 0,
        caution: 50,
        lieuLocation: '',
        datePrevRes: this.getTodayDate(),
        idMagasin: 'PNT000086',
        idMagasinLib: 'Ankorahotra'
      }
      this.initDetails()
    },
    resetDetails() {
      this.initDetails()
    },
    handleFileChange(e) {
      // Handle Excel file upload if needed
    },
    loadExcel() {
      // Load data from Excel file
      alert('Fonctionnalité import Excel à implémenter')
    },
    formatMontant(val) {
      if (val == null) return '-'
      return new Intl.NumberFormat('fr-FR').format(val)
    },
    async saveProforma() {
      this.errorMessage = ''
      this.saving = true
      
      try {
        // Filter only filled details - must have idProduit OR a real designation (not empty/placeholder)
        const filledDetails = this.details.filter(d => 
          d.idProduit || (d.designation && d.designation.trim() !== '' && d.designation.trim() !== 'Produit')
        )
        
        const payload = {
          ...this.proforma,
          date: this.proforma.daty,
          client: this.proforma.idClient,
          description: this.proforma.remarque,
          details: filledDetails.map(d => ({
            idProduit: d.idProduit || null,
            designation: d.designation || '',
            quantite: d.qte || 1,
            nombre: d.nombre || 1,
            prixUnitaire: d.pu || 0,
            unite: d.unite || '',
            dateDebut: d.dateDebut || this.proforma.daty,
            remise: d.remise || 0,
            tva: d.tva || 0,
            dimension: d.dimension || ''
          }))
        }
        
        let response
        if (this.isEdit) {
          response = await proformaService.update(this.$route.params.id, payload)
        } else {
          response = await proformaService.create(payload)
        }
        
        // Redirect to detail page after creation
        const proformaId = response.data.id || this.$route.params.id
        this.$router.push(`/detail/${proformaId}`)
      } catch (e) {
        console.error('Erreur enregistrement proforma', e)
        this.errorMessage = "Impossible d'enregistrer: " + (e.response?.data?.error || e.message)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.box-fiche {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.col-md-6 {
  flex: 1;
  min-width: 280px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-control-sm {
  padding: 4px 8px;
  font-size: 13px;
}

.input-group {
  display: flex;
  gap: 5px;
}

.input-group .form-control {
  flex: 1;
}

.input-group-sm {
  display: flex;
  gap: 2px;
}

.input-group-sm .form-control {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Details table */
.details-header {
  display: flex;
  background: #f8f9fa;
  padding: 10px 5px;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  font-size: 13px;
}

.detail-row {
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.detail-row:hover {
  background: #f8f9fa;
}

.col-check { width: 30px; text-align: center; }
.col-produit { width: 180px; padding: 0 5px; }
.col-designation { width: 150px; padding: 0 5px; }
.col-dimension { width: 120px; padding: 0 5px; }
.col-qte-article { width: 100px; padding: 0 5px; }
.col-qte-jour { width: 100px; padding: 0 5px; }
.col-pu { width: 100px; padding: 0 5px; }
.col-unite { width: 80px; padding: 0 5px; }
.col-date { width: 130px; padding: 0 5px; }
.col-image { width: 50px; text-align: center; }
.col-action { width: 40px; text-align: center; }

.detail-image-preview {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  color: #ccc;
}

.details-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 5px;
  margin-top: 10px;
}

.footer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Buttons */
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
.btn-danger { background: #dc3545; color: white; }
.btn-outline-secondary { background: white; color: #6c757d; border: 1px solid #6c757d; }
.btn-outline-primary { background: white; color: #007bff; border: 1px solid #007bff; }
.btn-link { background: none; color: #007bff; border: none; }
.btn-link:hover { text-decoration: underline; }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-lg {
  width: 800px;
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

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
  text-align: left;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background: #e9ecef;
}

.mb-3 { margin-bottom: 15px; }
.mt-4 { margin-top: 20px; }

.text-center { text-align: center; }

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
</style>

