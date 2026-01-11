<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1><i class="fa fa-money"></i>&nbsp;&nbsp;&nbsp;Saisie Caution</h1>
    </section>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-else class="box box-success">
        <!-- Infos Réservation -->
        <div class="box-header with-border">
          <h3 class="box-title">Caution pour Réservation N° {{ reservation.id }}</h3>
        </div>
        <div class="box-body">
          <div class="row info-row">
            <div class="col-md-3">
              <strong>Client:</strong> {{ reservation.clientNom }}
            </div>
            <div class="col-md-3">
              <strong>ID Réservation:</strong> {{ reservation.id }}
            </div>
            <div class="col-md-3">
              <strong>Montant Caution:</strong> {{ formatMontant(reservation.montantCaution) }}
            </div>
            <div class="col-md-3">
              <strong>Déjà versé:</strong> {{ formatMontant(totalDejaVerse) }}
            </div>
          </div>
        </div>

        <!-- Formulaire Caution -->
        <form @submit.prevent="submitCaution">
          <div class="box-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="dateCaution">Date <span class="required">*</span></label>
                  <input 
                    type="date" 
                    id="dateCaution"
                    class="form-control" 
                    v-model="formData.daty"
                    required
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="caisse">Caisse <span class="required">*</span></label>
                  <select 
                    id="caisse"
                    class="form-control" 
                    v-model="formData.idCaisse"
                    required
                  >
                    <option value="">-- Sélectionner une caisse --</option>
                    <option v-for="caisse in caisses" :key="caisse.id" :value="caisse.id">
                      {{ caisse.nom }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="montant">Montant <span class="required">*</span></label>
                  <input 
                    type="number" 
                    id="montant"
                    class="form-control" 
                    v-model.number="formData.montant"
                    min="0"
                    step="1000"
                    required
                  />
                  <small class="help-block">Reste à verser: {{ formatMontant(resteAVerser) }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="modePaiement">Mode de Paiement <span class="required">*</span></label>
                  <select 
                    id="modePaiement"
                    class="form-control" 
                    v-model="formData.idModePaiement"
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    <option v-for="mp in modesPaiement" :key="mp.id" :value="mp.id">
                      {{ mp.nom }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12">
                <div class="form-group">
                  <label for="observation">Observation</label>
                  <textarea 
                    id="observation"
                    class="form-control" 
                    v-model="formData.observation"
                    rows="3"
                    placeholder="Observation facultative..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Historique des cautions -->
          <div class="box-body" v-if="cautionsExistantes.length > 0">
            <h4>Cautions précédentes</h4>
            <table class="table table-bordered table-sm table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Mode Paiement</th>
                  <th>Caisse</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in cautionsExistantes" :key="c.id">
                  <td>{{ c.daty }}</td>
                  <td class="text-right">{{ formatMontant(c.montant) }}</td>
                  <td>{{ c.modePaiementNom }}</td>
                  <td>{{ c.caisseNom }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <th>Total</th>
                  <td class="text-right">{{ formatMontant(totalDejaVerse) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="box-footer">
            <button type="button" class="btn btn-default" @click="goBack">
              <i class="fa fa-arrow-left"></i> Retour
            </button>
            <button type="submit" class="btn btn-success" :disabled="submitting">
              <i class="fa fa-save"></i> 
              {{ submitting ? 'Enregistrement...' : 'Enregistrer Caution' }}
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
import cautionService from '../services/cautionService'

export default {
  name: 'MvtCaisseCautionSaisie',
  data() {
    return {
      reservation: {},
      caisses: [],
      modesPaiement: [],
      cautionsExistantes: [],
      totalDejaVerse: 0,
      formData: {
        daty: new Date().toISOString().split('T')[0],
        idCaisse: '',
        montant: 0,
        idModePaiement: '',
        observation: ''
      },
      loading: true,
      submitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    resteAVerser() {
      const montantCaution = this.reservation.montantCaution || 0
      return Math.max(0, montantCaution - this.totalDejaVerse)
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
        const [resaResp, initResp, cautionsResp] = await Promise.all([
          reservationService.getById(idReservation),
          cautionService.initCaution(idReservation),
          cautionService.getByReservation(idReservation)
        ])
        
        this.reservation = resaResp.data
        this.caisses = initResp.data.caisses || []
        this.modesPaiement = initResp.data.modesPaiement || []
        this.cautionsExistantes = cautionsResp.data || []
        
        // Calculer le total déjà versé
        this.totalDejaVerse = this.cautionsExistantes.reduce((sum, c) => sum + (c.montant || 0), 0)
        
        // Pré-remplir le montant avec le reste à verser
        this.formData.montant = this.resteAVerser
        
        // Sélectionner la première caisse par défaut si disponible
        if (this.caisses.length > 0) {
          this.formData.idCaisse = this.caisses[0].id
        }
      } catch (e) {
        console.error('Erreur chargement données caution:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    formatMontant(montant) {
      if (!montant) return '0 Ar'
      return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar'
    },
    async submitCaution() {
      this.submitting = true
      this.errorMessage = ''
      this.successMessage = ''
      
      const idReservation = this.$route.params.id
      
      try {
        const data = {
          idReservation: parseInt(idReservation),
          daty: this.formData.daty,
          idCaisse: parseInt(this.formData.idCaisse),
          montant: this.formData.montant,
          idModePaiement: parseInt(this.formData.idModePaiement),
          observation: this.formData.observation || ''
        }
        
        await cautionService.createCaution(data)
        this.successMessage = 'Caution enregistrée avec succès!'
        
        // Rediriger vers la fiche réservation après 1.5 secondes
        setTimeout(() => {
          this.$router.push(`/reservation/${idReservation}`)
        }, 1500)
      } catch (e) {
        console.error('Erreur enregistrement caution:', e)
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

.box-success {
  border-top: 3px solid #00a65a;
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
  background: #e8f5e9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 3px solid #00a65a;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-3 {
  flex: 0 0 25%;
  max-width: 25%;
  padding: 0 15px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 15px;
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 0 15px;
}

@media (max-width: 768px) {
  .col-md-3,
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 10px;
  }
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.required {
  color: #dd4b39;
}

.help-block {
  display: block;
  margin-top: 5px;
  color: #737373;
  font-size: 12px;
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

.table-sm th,
.table-sm td {
  padding: 5px;
  font-size: 13px;
}

.total-row {
  font-weight: bold;
  background-color: #e8f5e9 !important;
}

.total-row th,
.total-row td {
  background-color: #e8f5e9 !important;
}

.text-right {
  text-align: right;
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
  border-color: #00a65a;
  outline: 0;
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(0,166,90,.6);
}

select.form-control {
  height: 34px;
}

textarea.form-control {
  height: auto;
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

.btn-success {
  color: #fff;
  background-color: #00a65a;
  border-color: #008d4c;
}

.btn-success:disabled {
  background-color: #5dde84;
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
</style>
