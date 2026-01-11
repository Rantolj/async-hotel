<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1><i class="fa fa-file-text-o"></i>&nbsp;&nbsp;&nbsp;Fiche Réservation</h1>
    </section>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-else class="box box-primary">
        <!-- Informations de la réservation -->
        <div class="box-header with-border">
          <h3 class="box-title">Réservation N° {{ reservation.id }}</h3>
          <div class="box-tools">
            <span :class="['badge', getStatusBadgeClass(reservation.etatNom)]">
              {{ reservation.etatNom }}
            </span>
          </div>
        </div>
        <div class="box-body">
          <div class="row">
            <div class="col-md-6">
              <table class="table table-bordered">
                <tr>
                  <th style="width: 150px;">Client</th>
                  <td>{{ reservation.clientNom }}</td>
                </tr>
                <tr>
                  <th>Chambre</th>
                  <td>{{ reservation.chambreNom }}</td>
                </tr>
                <tr>
                  <th>Type Chambre</th>
                  <td>{{ reservation.typeChambreNom }}</td>
                </tr>
                <tr>
                  <th>Formule</th>
                  <td>{{ reservation.formuleNom }}</td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-bordered">
                <tr>
                  <th style="width: 150px;">Date Début</th>
                  <td>{{ reservation.dateDebut }}</td>
                </tr>
                <tr>
                  <th>Date Fin</th>
                  <td>{{ reservation.dateFin }}</td>
                </tr>
                <tr>
                  <th>Nb Nuits</th>
                  <td>{{ reservation.nbreNuit }}</td>
                </tr>
                <tr>
                  <th>Prix Total</th>
                  <td>{{ formatMontant(reservation.prixTotal) }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Onglets -->
        <div class="nav-tabs-custom">
          <ul class="nav nav-tabs">
            <li :class="{ active: activeTab === 'checkins' }">
              <a href="#" @click.prevent="activeTab = 'checkins'">
                <i class="fa fa-sign-in"></i> Check-ins ({{ checkins.length }})
              </a>
            </li>
            <li :class="{ active: activeTab === 'checkouts' }">
              <a href="#" @click.prevent="activeTab = 'checkouts'">
                <i class="fa fa-sign-out"></i> Check-outs ({{ checkouts.length }})
              </a>
            </li>
            <li :class="{ active: activeTab === 'cautions' }">
              <a href="#" @click.prevent="activeTab = 'cautions'">
                <i class="fa fa-money"></i> Cautions ({{ cautions.length }})
              </a>
            </li>
          </ul>

          <div class="tab-content">
            <!-- Tab Check-ins -->
            <div v-show="activeTab === 'checkins'" class="tab-pane active">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date Check-in</th>
                      <th>Type Pension</th>
                      <th>Nb Adultes</th>
                      <th>Nb Enfants</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="checkin in checkins" :key="checkin.id">
                      <td>{{ checkin.dateCheckin }}</td>
                      <td>{{ checkin.typePensionNom }}</td>
                      <td>{{ checkin.nbreAdulte }}</td>
                      <td>{{ checkin.nbreEnfant }}</td>
                      <td>{{ checkin.observation }}</td>
                    </tr>
                    <tr v-if="checkins.length === 0">
                      <td colspan="5" class="text-center">Aucun check-in</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button class="btn btn-primary" @click="goToCheckin">
                <i class="fa fa-plus"></i> Nouveau Check-in
              </button>
            </div>

            <!-- Tab Check-outs -->
            <div v-show="activeTab === 'checkouts'" class="tab-pane active">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date Check-out</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="checkout in checkouts" :key="checkout.id">
                      <td>{{ checkout.dateCheckout }}</td>
                      <td>{{ checkout.observation }}</td>
                    </tr>
                    <tr v-if="checkouts.length === 0">
                      <td colspan="2" class="text-center">Aucun check-out</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button class="btn btn-warning" @click="goToCheckout">
                <i class="fa fa-plus"></i> Nouveau Check-out
              </button>
            </div>

            <!-- Tab Cautions -->
            <div v-show="activeTab === 'cautions'" class="tab-pane active">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Type</th>
                      <th>Observation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="caution in cautions" :key="caution.id">
                      <td>{{ caution.daty }}</td>
                      <td>{{ formatMontant(caution.montant) }}</td>
                      <td>{{ caution.typeNom }}</td>
                      <td>{{ caution.observation }}</td>
                      <td>
                        <button class="btn btn-info btn-sm" @click="openCautionDetail(caution.id)">
                          <i class="fa fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="cautions.length === 0">
                      <td colspan="5" class="text-center">Aucune caution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button class="btn btn-success" @click="goToCaution">
                <i class="fa fa-plus"></i> Nouvelle Caution
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="box-footer">
          <button class="btn btn-default" @click="$router.push('/reservation/calendar')">
            <i class="fa fa-arrow-left"></i> Retour au calendrier
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import reservationService from '../services/reservationService'
import cautionService from '../services/cautionService'

export default {
  name: 'ReservationFiche',
  data() {
    return {
      reservation: {},
      checkins: [],
      checkouts: [],
      cautions: [],
      activeTab: 'checkins',
      loading: true,
      errorMessage: ''
    }
  },
  async mounted() {
    await this.loadReservation()
  },
  methods: {
    async loadReservation() {
      this.loading = true
      this.errorMessage = ''
      const id = this.$route.params.id
      try {
        // Charger la réservation d'abord (obligatoire)
        const resaResp = await reservationService.getById(id)
        this.reservation = resaResp.data

        // Charger les données secondaires en parallèle (non bloquant)
        const [checkinsResp, checkoutsResp, cautionsResp] = await Promise.allSettled([
          reservationService.getCheckins(id),
          reservationService.getCheckouts(id),
          cautionService.getByReservation(id)
        ])

        this.checkins = checkinsResp.status === 'fulfilled' ? (checkinsResp.value.data || []) : []
        this.checkouts = checkoutsResp.status === 'fulfilled' ? (checkoutsResp.value.data || []) : []
        this.cautions = cautionsResp.status === 'fulfilled' ? (cautionsResp.value.data || []) : []
      } catch (e) {
        console.error('Erreur chargement réservation:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    formatMontant(montant) {
      if (!montant) return '0 Ar'
      return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar'
    },
    getStatusBadgeClass(etat) {
      if (!etat) return 'bg-secondary'
      const etatLower = etat.toLowerCase()
      if (etatLower.includes('confirmé') || etatLower.includes('expedie')) return 'bg-success'
      if (etatLower.includes('annulé') || etatLower.includes('boucle')) return 'bg-danger'
      if (etatLower.includes('attente') || etatLower.includes('preparer')) return 'bg-warning'
      return 'bg-info'
    },
    goToCheckin() {
      this.$router.push(`/reservation/${this.reservation.id}/checkin`)
    },
    goToCheckout() {
      this.$router.push(`/reservation/${this.reservation.id}/checkout`)
    },
    goToCaution() {
      this.$router.push(`/reservation/${this.reservation.id}/caution`)
    },
    openCautionDetail(id) {
      this.$router.push(`/mvtcaisse/${id}`)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 10px;
}

.box-footer {
  padding: 10px;
  border-top: 1px solid #f4f4f4;
}

.nav-tabs-custom {
  margin: 20px 0;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-tabs li {
  margin-bottom: -1px;
}

.nav-tabs li a {
  display: block;
  padding: 10px 15px;
  color: #444;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
}

.nav-tabs li.active a {
  color: #3c8dbc;
  border-color: #dee2e6 #dee2e6 #fff;
  background: #fff;
}

.tab-content {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-top: none;
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 8px;
  vertical-align: top;
  border: 1px solid #dee2e6;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.table th {
  background-color: #f8f9fa;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  color: #fff;
}

.bg-success { background-color: #28a745; }
.bg-danger { background-color: #dc3545; }
.bg-warning { background-color: #ffc107; color: #333; }
.bg-info { background-color: #17a2b8; }
.bg-secondary { background-color: #6c757d; }

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 15px;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
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
  margin-right: 5px;
}

.btn-primary {
  color: #fff;
  background-color: #3c8dbc;
  border-color: #367fa9;
}

.btn-warning {
  color: #fff;
  background-color: #f39c12;
  border-color: #e08e0b;
}

.btn-success {
  color: #fff;
  background-color: #00a65a;
  border-color: #008d4c;
}

.btn-info {
  color: #fff;
  background-color: #00c0ef;
  border-color: #00acd6;
}

.btn-default {
  color: #444;
  background-color: #f4f4f4;
  border-color: #ddd;
}

.btn-sm {
  padding: 3px 6px;
  font-size: 12px;
}
</style>
