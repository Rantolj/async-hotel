<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1><i class="fa fa-truck"></i>&nbsp;&nbsp;&nbsp;Enregistrement de Livraison/Récupération</h1>
    </section>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-else class="box box-primary">
        <!-- Infos Réservation -->
        <div class="box-header with-border">
          <h3 class="box-title">Check-in pour Réservation N° {{ reservation.id }}</h3>
        </div>
        <div class="box-body">
          <div class="row info-row">
            <div class="col-md-4">
              <strong>Client:</strong> {{ reservation.clientNom }}
            </div>
            <div class="col-md-4">
              <strong>Date début:</strong> {{ reservation.datePrevisionDepart }}
            </div>
            <div class="col-md-4">
              <strong>Date fin:</strong> {{ reservation.datePrevisionRetour }}
            </div>
          </div>
        </div>

        <!-- Formulaire Check-in -->
        <form @submit.prevent="submitCheckin">
          <div class="box-body">
            <div v-if="produits.length === 0" class="alert alert-info">
              Aucun produit à livrer pour cette réservation.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th>Produit</th>
                    <th>Référence</th>
                    <th style="width: 120px;">Quantité besoin</th>
                    <th style="width: 120px;">Quantité</th>
                    <th style="width: 150px;">Date Livraison</th>
                    <th style="width: 100px;">Heure</th>
                    <th style="width: 50px;">Livrer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(produit, index) in produits" :key="produit.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ produit.produit }}</td>
                    <td>{{ produit.reference || '-' }}</td>
                    <td class="text-center">{{ produit.qteBesoin }}</td>
                    <td>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model.number="produit.qte" 
                        :max="produit.qteBesoin"
                        min="0"
                        :disabled="!produit.selected"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        class="form-control" 
                        v-model="produit.daty"
                        :disabled="!produit.selected"
                      />
                    </td>
                    <td>
                      <input 
                        type="time" 
                        class="form-control" 
                        v-model="produit.heure"
                        :disabled="!produit.selected"
                      />
                    </td>
                    <td class="text-center">
                      <input 
                        type="checkbox" 
                        v-model="produit.selected"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="box-footer">
            <button type="button" class="btn btn-default" @click="goBack">
              <i class="fa fa-arrow-left"></i> Retour
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="submitting || !hasSelectedProduits"
            >
              <i class="fa fa-save"></i> 
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
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
  name: 'CheckinSaisie',
  data() {
    return {
      reservation: {},
      produits: [],
      loading: true,
      submitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    hasSelectedProduits() {
      return this.produits.some(p => p.selected && p.qte > 0)
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
        const [resaResp, initResp] = await Promise.all([
          reservationService.getById(idReservation),
          reservationService.initCheckin(idReservation)
        ])
        this.reservation = resaResp.data
        
        // Préparer les produits disponibles pour le check-in
        const produitsData = initResp.data.produits || []
        const today = new Date().toISOString().split('T')[0]
        const now = new Date().toTimeString().slice(0, 5)
        
        this.produits = produitsData.map(p => ({
          id: p.id,
          idProduit: p.idProduit,
          produit: p.produit,
          reference: p.reference,
          qteBesoin: p.qte,
          qte: p.qte,
          daty: today,
          heure: now,
          selected: true
        }))
      } catch (e) {
        console.error('Erreur chargement données check-in:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    async submitCheckin() {
      this.submitting = true
      this.errorMessage = ''
      this.successMessage = ''
      
      const idReservation = this.$route.params.id
      
      try {
        // Préparer les données à envoyer
        const selectedProduits = this.produits.filter(p => p.selected && p.qte > 0)
        
        const data = {
          idReservation: idReservation,
          lignes: selectedProduits.map(p => ({
            idResDetail: p.id,
            idProduit: p.idProduit,
            qte: p.qte,
            daty: p.daty,
            heure: p.heure,
            idMagasin: 'PNT000086'  // Magasin par défaut (Atipik)
          }))
        }
        
        await reservationService.createCheckin(idReservation, data)
        this.successMessage = 'Check-in enregistré avec succès!'
        
        // Rediriger vers la fiche réservation après 1.5 secondes
        setTimeout(() => {
          this.$router.push(`/reservation/${idReservation}`)
        }, 1500)
      } catch (e) {
        console.error('Erreur enregistrement check-in:', e)
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

.box-primary {
  border-top: 3px solid #3c8dbc;
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
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
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
  border-color: #3c8dbc;
  outline: 0;
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(60,141,188,.6);
}

.form-control:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.btn {
  display: inline-block;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
}

.btn-primary {
  color: #fff;
  background-color: #3c8dbc;
  border-color: #367fa9;
}

.btn-primary:disabled {
  background-color: #6c9fc1;
  cursor: not-allowed;
}

.btn-default {
  color: #444;
  background-color: #f4f4f4;
  border-color: #ddd;
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

.table-responsive {
  min-height: .01%;
  overflow-x: auto;
}

.text-center {
  text-align: center;
}
</style>
