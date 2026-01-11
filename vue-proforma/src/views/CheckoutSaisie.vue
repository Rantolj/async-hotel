<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1><i class="fa fa-sign-out"></i>&nbsp;&nbsp;&nbsp;Enregistrement de la réception (Check-out)</h1>
    </section>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-else class="box box-warning">
        <!-- Infos Réservation -->
        <div class="box-header with-border">
          <h3 class="box-title">Check-out pour Réservation N° {{ initData.idReservation }}</h3>
        </div>
        <div class="box-body">
          <div class="row info-row">
            <div class="col-md-4">
              <strong>Client:</strong> {{ initData.clientNom }}
            </div>
            <div class="col-md-4">
              <strong>Date Départ:</strong> {{ initData.dateDebut }}
            </div>
            <div class="col-md-4">
              <strong>Date Retour prévue:</strong> {{ initData.dateFin }}
            </div>
          </div>
        </div>

        <!-- Formulaire Check-out - Liste des checkins à réceptionner -->
        <form @submit.prevent="submitCheckout">
          <div class="box-body">
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style="width: 40px;">
                      <input type="checkbox" @change="toggleAll" :checked="allSelected" title="Sélectionner tout">
                    </th>
                    <th>Réf. Produit</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Date réception</th>
                    <th>Heure</th>
                    <th>Responsable</th>
                    <th>Jour de retard</th>
                    <th>Retenue (%)</th>
                    <th>État matériel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ligne, index) in lignesCheckout" :key="index" :class="{'already-checked': ligne.alreadyCheckedOut}">
                    <td>
                      <input 
                        type="checkbox" 
                        v-model="ligne.selected"
                        :disabled="ligne.alreadyCheckedOut"
                      />
                    </td>
                    <td>{{ ligne.refProduit }}</td>
                    <td>{{ ligne.produit }}</td>
                    <td>
                      <input 
                        type="number" 
                        class="form-control form-control-sm" 
                        v-model.number="ligne.quantite"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                        min="1"
                        style="width: 80px;"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        class="form-control form-control-sm" 
                        v-model="ligne.dateReception"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                      />
                    </td>
                    <td>
                      <input 
                        type="time" 
                        class="form-control form-control-sm" 
                        v-model="ligne.heureReception"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        v-model="ligne.responsable"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                        placeholder="Responsable..."
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        class="form-control form-control-sm" 
                        v-model.number="ligne.jourRetard"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                        min="0"
                        @change="calculerRetenue(index)"
                        style="width: 80px;"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        class="form-control form-control-sm" 
                        v-model.number="ligne.retenue"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                        min="0"
                        max="100"
                        style="width: 80px;"
                      />
                    </td>
                    <td>
                      <select 
                        class="form-control form-control-sm" 
                        v-model="ligne.etatMateriel"
                        :disabled="ligne.alreadyCheckedOut || !ligne.selected"
                      >
                        <option value="BON">Bon état</option>
                        <option value="USAGE">Usagé</option>
                        <option value="ENDOMMAGE">Endommagé</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="lignesCheckout.length === 0" class="alert alert-info">
              Aucun check-in à réceptionner pour cette réservation.
            </div>

            <div v-if="allAlreadyCheckedOut" class="alert alert-success">
              <i class="fa fa-check-circle"></i> Tous les produits ont déjà été réceptionnés.
            </div>
          </div>

          <div class="box-footer">
            <button type="button" class="btn btn-default" @click="goBack">
              <i class="fa fa-arrow-left"></i> Retour
            </button>
            <button 
              type="submit" 
              class="btn btn-warning" 
              :disabled="submitting || !hasSelectedLines || allAlreadyCheckedOut"
            >
              <i class="fa fa-save"></i> 
              {{ submitting ? 'Enregistrement...' : 'Enregistrer et Valider' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Message de succès -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </section>
  </div>
</template>

<script>
import reservationService from '../services/reservationService'

export default {
  name: 'CheckoutSaisie',
  data() {
    return {
      initData: {},
      lignesCheckout: [],
      modesPaiement: [],
      loading: true,
      submitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    hasSelectedLines() {
      return this.lignesCheckout.some(l => l.selected && !l.alreadyCheckedOut)
    },
    allSelected() {
      const selectables = this.lignesCheckout.filter(l => !l.alreadyCheckedOut)
      return selectables.length > 0 && selectables.every(l => l.selected)
    },
    allAlreadyCheckedOut() {
      return this.lignesCheckout.length > 0 && this.lignesCheckout.every(l => l.alreadyCheckedOut)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      this.errorMessage = ''
      const idReservation = this.$route.params.id
      
      try {
        const response = await reservationService.initCheckout(idReservation)
        const data = response.data
        
        this.initData = {
          idReservation: data.idReservation,
          clientNom: data.clientNom,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin
        }
        
        this.modesPaiement = data.modesPaiement || []
        
        // Transformer les checkins en lignes de checkout
        const checkins = data.checkins || []
        const today = new Date().toISOString().split('T')[0]
        const currentTime = new Date().toTimeString().slice(0, 5)
        
        this.lignesCheckout = checkins.map(ci => ({
          idCheckin: ci.id,
          refProduit: ci.refProduit || '',
          produit: ci.produit,
          quantite: ci.qte || 1,
          dateReception: today,
          heureReception: currentTime,
          responsable: '',
          jourRetard: 0,
          retenue: 0,
          etatMateriel: 'BON',
          selected: !ci.checkOut, // Pré-sélectionner si pas encore réceptionné
          alreadyCheckedOut: !!ci.checkOut
        }))
        
      } catch (e) {
        console.error('Erreur chargement données check-out:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    
    toggleAll(event) {
      const checked = event.target.checked
      this.lignesCheckout.forEach(ligne => {
        if (!ligne.alreadyCheckedOut) {
          ligne.selected = checked
        }
      })
    },
    
    calculerRetenue(index) {
      const ligne = this.lignesCheckout[index]
      const jourRetard = ligne.jourRetard || 0
      // Règle: 5% par jour de retard, max 100%
      const montant = jourRetard * 5
      ligne.retenue = Math.min(montant, 100)
    },
    
    async submitCheckout() {
      this.submitting = true
      this.errorMessage = ''
      this.successMessage = ''
      
      const idReservation = this.$route.params.id
      
      try {
        const lignesSelected = this.lignesCheckout
          .filter(l => l.selected && !l.alreadyCheckedOut)
          .map(l => ({
            idCheckin: l.idCheckin,
            quantite: l.quantite,
            dateReception: l.dateReception,
            heureReception: l.heureReception,
            responsable: l.responsable,
            jourRetard: l.jourRetard,
            retenue: l.retenue,
            etatMateriel: l.etatMateriel
          }))
        
        if (lignesSelected.length === 0) {
          this.errorMessage = 'Veuillez sélectionner au moins un produit à réceptionner.'
          this.submitting = false
          return
        }
        
        const data = {
          idReservation: parseInt(idReservation),
          lignes: lignesSelected
        }
        
        await reservationService.createCheckout(idReservation, data)
        this.successMessage = 'Check-out enregistré avec succès!'
        
        // Rediriger vers la fiche réservation après 1.5 secondes
        setTimeout(() => {
          this.$router.push(`/reservation/${idReservation}`)
        }, 1500)
      } catch (e) {
        console.error('Erreur enregistrement check-out:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors de l\'enregistrement'
      } finally {
        this.submitting = false
      }
    },
    
    goBack() {
      const idReservation = this.$route.params.id
      this.$router.push(`/reservation/${idReservation}`)
    }
  }
}
</script>

<style scoped>
.box {
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.box-warning {
  border-top: 3px solid #f39c12;
}

.box-header {
  padding: 10px;
  border-bottom: 1px solid #f4f4f4;
}

.box-header.with-border {
  border-bottom: 1px solid #f4f4f4;
}

.box-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.box-body {
  padding: 15px;
}

.box-footer {
  padding: 10px 15px;
  border-top: 1px solid #f4f4f4;
  display: flex;
  gap: 10px;
}

.info-row {
  background: #fef8e7;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 3px solid #f39c12;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-4 {
  flex: 0 0 33.333%;
  max-width: 33.333%;
  padding: 0 15px;
}

@media (max-width: 768px) {
  .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 10px;
  }
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 8px;
  vertical-align: middle;
  border: 1px solid #dee2e6;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.already-checked {
  background-color: #e8f5e9 !important;
  opacity: 0.7;
}

.already-checked td {
  text-decoration: line-through;
  color: #6c757d;
}

.form-control-sm {
  padding: 4px 8px;
  font-size: 13px;
}

.form-control {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #f39c12;
  outline: 0;
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(243,156,18,.6);
}

.form-control:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  text-decoration: none;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-warning {
  color: #fff;
  background-color: #f39c12;
  border-color: #e08e0b;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e08e0b;
}

.btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}

.btn-default:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.alert-danger {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}

.alert-success {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}

.alert-info {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
}
</style>
