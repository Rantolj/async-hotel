<template>
  <div class="content-wrapper">
    <section class="content-header">
      <h1><i class="fa fa-calendar"></i>&nbsp;&nbsp;&nbsp;Planning Mensuel</h1>
    </section>

    <section class="content">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-else class="calendar-container">
        <div class="calendar-header">
          <div class="calendar-title">{{ calendar.moisNom }} {{ calendar.annee }}</div>

          <div class="legend-container">
            <div class="legend-item">
              <div class="legend-color error"></div>
              <span>Bouclée</span>
            </div>
            <div class="legend-item">
              <div class="legend-color success"></div>
              <span>Expédiée</span>
            </div>
            <div class="legend-item">
              <div class="legend-color warning"></div>
              <span>À préparer</span>
            </div>
          </div>

          <div class="nav-controls">
            <div class="btn-groupes">
              <button @click="navigateTo(calendar.datePrecedent)">
                <i class="fa fa-chevron-left"></i>
              </button>
              <button @click="navigateTo(calendar.dateSuivant)">
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
            <div class="btn-groupes">
              <button @click="navigateTo(calendar.dateAujourdhui)">Aujourd'hui</button>
            </div>
          </div>
        </div>

        <div class="calendar-grid">
          <!-- En-têtes des jours -->
          <div class="calendar-row">
            <div class="calendar-cell-title">Lun.</div>
            <div class="calendar-cell-title">Mar.</div>
            <div class="calendar-cell-title">Mer.</div>
            <div class="calendar-cell-title">Jeu.</div>
            <div class="calendar-cell-title">Ven.</div>
            <div class="calendar-cell-title">Sam.</div>
            <div class="calendar-cell-title">Dim.</div>
          </div>

          <!-- Semaines -->
          <div class="calendar-row" v-for="(semaine, idx) in semaines" :key="idx">
            <div 
              v-for="jour in semaine" 
              :key="jour.date"
              :class="getCellClass(jour)"
            >
              <template v-if="jour">
                <div :class="['day-number', { today: jour.estAujourdhui }]">{{ jour.jour }}</div>
                <div 
                  v-for="(resa, i) in jour.reservations.slice(0, 3)" 
                  :key="resa.id"
                  class="event"
                  @click="openReservationModal(resa.id)"
                >
                  <div :class="['event-title', resa.couleur]">{{ resa.client }}</div>
                </div>
                <button 
                  v-if="jour.reservations.length > 3" 
                  class="btn btn-primary btn-more"
                  @click="showMoreReservations(jour)"
                >
                  +{{ jour.reservations.length - 3 }} de plus
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Détails Jour -->
    <div class="modal-overlay" v-if="showDayModal" @click.self="showDayModal = false">
      <div class="modal-content modal-day">
        <div class="modal-header">
          <h5>Réservations du {{ selectedDay?.date }}</h5>
          <button class="btn-close" @click="showDayModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div 
            v-for="resa in selectedDay?.reservations" 
            :key="resa.id"
            class="day-reservation-item"
            @click="openReservationModal(resa.id); showDayModal = false"
          >
            <span :class="['badge', `bg-${resa.couleur}`]">{{ resa.id }}</span>
            <span>{{ resa.client }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Fiche Réservation -->
    <div class="modal-overlay" v-if="showFicheModal" @click.self="closeFicheModal">
      <div class="modal-content modal-fiche">
        <div class="modal-header">
          <h5><i class="fa fa-angle-left" @click="closeFicheModal" style="cursor:pointer;margin-right:10px;"></i> Fiche de la réservation</h5>
          <button class="btn-close" @click="closeFicheModal">&times;</button>
        </div>
        
        <div class="modal-body" v-if="ficheLoading">
          <div class="text-center py-4">Chargement...</div>
        </div>
        
        <div class="modal-body" v-else-if="selectedReservation">
          <!-- Informations de la réservation -->
          <div class="fiche-grid">
            <div class="fiche-row">
              <div class="fiche-cell">
                <span class="fiche-label">ID</span>
                <span class="fiche-value">{{ selectedReservation.id }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Client(e)</span>
                <span class="fiche-value link">{{ selectedReservation.clientNom }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Date de Location</span>
                <span class="fiche-value">{{ selectedReservation.daty }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Date prévisionnelle de départ</span>
                <span class="fiche-value">{{ selectedReservation.datePrevisionDepart }}</span>
              </div>
            </div>
            <div class="fiche-row">
              <div class="fiche-cell">
                <span class="fiche-label">Remarque</span>
                <span class="fiche-value">{{ selectedReservation.remarque || '-' }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Montant remise</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.montantRemise) }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Montant</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.montant) }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Montant Acompte</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.paye) }}</span>
              </div>
            </div>
            <div class="fiche-row">
              <div class="fiche-cell">
                <span class="fiche-label">Reste à payer</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.resteAPayer) }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Montant caution</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.montantCaution) }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Date retour caution</span>
                <span class="fiche-value">{{ selectedReservation.datyCaution || '-' }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Montant retour caution</span>
                <span class="fiche-value">{{ formatMontant(selectedReservation.debitCaution) }}</span>
              </div>
            </div>
            <div class="fiche-row">
              <div class="fiche-cell">
                <span class="fiche-label">Proforma</span>
                <span class="fiche-value link">{{ selectedReservation.idOrigine }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Lieu de location</span>
                <span class="fiche-value">{{ selectedReservation.lieuLocation || '-' }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Date prévisionnelle de retour</span>
                <span class="fiche-value">{{ selectedReservation.datePrevisionRetour }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Période</span>
                <span class="fiche-value">{{ selectedReservation.periode }}</span>
              </div>
            </div>
            <div class="fiche-row">
              <div class="fiche-cell">
                <span class="fiche-label">Numéro du bon de livraison</span>
                <span class="fiche-value">{{ selectedReservation.numBl || '-' }}</span>
              </div>
              <div class="fiche-cell">
                <span class="fiche-label">Livraison/Récupération</span>
                <span class="fiche-value">{{ selectedReservation.modeLivraison || 'Récupération' }}</span>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="fiche-actions">
            <button v-if="selectedReservation.etat >= 11" class="btn btn-danger btn-sm" @click="annulerVisa">Annuler Visa</button>
            <button v-if="!selectedReservation.datyCaution" class="btn btn-primary btn-sm" @click="reglerCaution">Regler caution</button>
            <button v-if="selectedReservation.etat >= 11" class="btn btn-secondary btn-sm" @click="ajouterEquipe">Ajouter équipe responsable</button>
            <button v-if="selectedReservation.numBl" class="btn btn-secondary btn-sm" @click="goToCheckout">Retour</button>
            <button class="btn btn-primary btn-sm" @click="goToCheckin">Livraison/Récupération</button>
          </div>

          <!-- Onglets -->
          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li :class="{ active: activeTab === 'details' }">
                <a href="#" @click.prevent="activeTab = 'details'">Détails</a>
              </li>
              <li :class="{ active: activeTab === 'checkins' }">
                <a href="#" @click.prevent="activeTab = 'checkins'">Livraison/Récupération effectuée</a>
              </li>
              <li :class="{ active: activeTab === 'checkouts' }">
                <a href="#" @click.prevent="activeTab = 'checkouts'">Réception effectuée</a>
              </li>
              <li :class="{ active: activeTab === 'factures' }">
                <a href="#" @click.prevent="activeTab = 'factures'">Liste des Factures</a>
              </li>
              <li :class="{ active: activeTab === 'caution' }">
                <a href="#" @click.prevent="activeTab = 'caution'">Caution</a>
              </li>
            </ul>

            <div class="tab-content">
              <!-- Onglet Détails -->
              <div v-show="activeTab === 'details'" class="tab-pane">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reference</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Nombre De Jours</th>
                      <th>Date De Réservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detail in reservationDetails" :key="detail.id">
                      <td>{{ detail.idProduit }}</td>
                      <td>{{ detail.reference }}</td>
                      <td>{{ detail.produit }}</td>
                      <td>{{ detail.quantite }}</td>
                      <td>{{ detail.nbreJours }}</td>
                      <td>{{ detail.dateReservation }}</td>
                    </tr>
                    <tr v-if="reservationDetails.length === 0">
                      <td colspan="6" class="text-center">Aucune donnée trouvée</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Onglet Check-ins -->
              <div v-show="activeTab === 'checkins'" class="tab-pane">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ci in reservationCheckins" :key="ci.id">
                      <td>{{ ci.daty }}</td>
                      <td>{{ ci.produit }}</td>
                      <td>{{ ci.quantite }}</td>
                      <td>{{ ci.observation }}</td>
                    </tr>
                    <tr v-if="reservationCheckins.length === 0">
                      <td colspan="4" class="text-center">Aucune donnée trouvée</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Onglet Check-outs -->
              <div v-show="activeTab === 'checkouts'" class="tab-pane">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="co in reservationCheckouts" :key="co.id">
                      <td>{{ co.daty }}</td>
                      <td>{{ co.produit }}</td>
                      <td>{{ co.quantite }}</td>
                      <td>{{ co.observation }}</td>
                    </tr>
                    <tr v-if="reservationCheckouts.length === 0">
                      <td colspan="4" class="text-center">Aucune donnée trouvée</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Onglet Factures -->
              <div v-show="activeTab === 'factures'" class="tab-pane">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="fact in reservationFactures" :key="fact.id">
                      <td>{{ fact.id }}</td>
                      <td>{{ fact.daty }}</td>
                      <td>{{ formatMontant(fact.montant) }}</td>
                    </tr>
                    <tr v-if="reservationFactures.length === 0">
                      <td colspan="3" class="text-center">Aucune donnée trouvée</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Onglet Caution -->
              <div v-show="activeTab === 'caution'" class="tab-pane">
                <table class="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Mode Paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cau in reservationCautions" :key="cau.id">
                      <td>{{ cau.id }}</td>
                      <td>{{ cau.daty }}</td>
                      <td>{{ formatMontant(cau.montant || cau.credit) }}</td>
                      <td>{{ cau.modePaiement }}</td>
                    </tr>
                    <tr v-if="reservationCautions.length === 0">
                      <td colspan="4" class="text-center">Aucune donnée trouvée</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import reservationService from '../services/reservationService'
import cautionService from '../services/cautionService'

export default {
  name: 'ReservationCalendar',
  data() {
    return {
      calendar: {
        moisNom: '',
        annee: '',
        jours: [],
        datePrecedent: '',
        dateSuivant: '',
        dateAujourdhui: ''
      },
      loading: true,
      errorMessage: '',
      showDayModal: false,
      selectedDay: null,
      currentDate: null,
      // Fiche modal
      showFicheModal: false,
      ficheLoading: false,
      selectedReservation: null,
      reservationDetails: [],
      reservationCheckins: [],
      reservationCheckouts: [],
      reservationFactures: [],
      reservationCautions: [],
      activeTab: 'details'
    }
  },
  computed: {
    semaines() {
      const semaines = []
      const jours = this.calendar.jours || []
      for (let i = 0; i < jours.length; i += 7) {
        semaines.push(jours.slice(i, i + 7))
      }
      return semaines
    }
  },
  async mounted() {
    await this.loadCalendar()
  },
  methods: {
    async loadCalendar(date = null) {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await reservationService.getCalendar(date)
        this.calendar = response.data
        this.currentDate = date
      } catch (e) {
        console.error('Erreur chargement calendrier:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    navigateTo(date) {
      this.loadCalendar(date)
    },
    getCellClass(jour) {
      if (!jour) return 'calendar-cell-desactive'
      if (!jour.estMoisCourant) return 'calendar-cell calendar-cell-other-month'
      return 'calendar-cell'
    },
    showMoreReservations(jour) {
      this.selectedDay = jour
      this.showDayModal = true
    },
    async openReservationModal(id) {
      this.showFicheModal = true
      this.ficheLoading = true
      this.activeTab = 'details'
      this.selectedReservation = null
      this.reservationDetails = []
      this.reservationCheckins = []
      this.reservationCheckouts = []
      this.reservationFactures = []
      this.reservationCautions = []

      try {
        // Charger la réservation
        const resaResp = await reservationService.getById(id)
        this.selectedReservation = resaResp.data

        // Charger les données secondaires en parallèle
        const [detailsResp, checkinsResp, checkoutsResp, cautionsResp] = await Promise.allSettled([
          reservationService.getDetails(id),
          reservationService.getCheckins(id),
          reservationService.getCheckouts(id),
          cautionService.getByReservation(id)
        ])

        this.reservationDetails = detailsResp.status === 'fulfilled' ? (detailsResp.value.data || []) : []
        this.reservationCheckins = checkinsResp.status === 'fulfilled' ? (checkinsResp.value.data || []) : []
        this.reservationCheckouts = checkoutsResp.status === 'fulfilled' ? (checkoutsResp.value.data || []) : []
        this.reservationCautions = cautionsResp.status === 'fulfilled' ? (cautionsResp.value.data || []) : []
      } catch (e) {
        console.error('Erreur chargement fiche:', e)
        this.selectedReservation = { error: e.message }
      } finally {
        this.ficheLoading = false
      }
    },
    closeFicheModal() {
      this.showFicheModal = false
      this.selectedReservation = null
    },
    formatMontant(montant) {
      if (!montant && montant !== 0) return '0'
      return new Intl.NumberFormat('fr-FR').format(montant)
    },
    goToCheckin() {
      const id = this.selectedReservation.id
      this.closeFicheModal()
      this.$router.push(`/reservation/${id}/checkin`)
    },
    goToCheckout() {
      const id = this.selectedReservation.id
      this.closeFicheModal()
      this.$router.push(`/reservation/${id}/checkout`)
    },
    reglerCaution() {
      const id = this.selectedReservation.id
      this.closeFicheModal()
      this.$router.push(`/reservation/${id}/caution`)
    },
    ajouterEquipe() {
      alert('Fonctionnalité à implémenter')
    },
    annulerVisa() {
      alert('Fonctionnalité à implémenter')
    }
  }
}
</script>

<style scoped>
.calendar-container {
  margin: 10px 0;
  font-family: Arial, sans-serif;
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.27);
  border-radius: 10px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.calendar-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.legend-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 34px;
  height: 14px;
  border-radius: 3px;
}

.legend-color.error { background-color: #c92438; }
.legend-color.success { background-color: #5dde84; }
.legend-color.warning { background-color: #decb5d; }

.nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-groupes {
  display: flex;
  gap: 0;
  background-color: white;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 0 0 0.5px rgb(143, 143, 143);
}

.btn-groupes button {
  border: none;
  color: #666;
  background-color: white;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-groupes button:hover {
  background: #e0e0eb;
}

.calendar-grid {
  width: 100%;
  background-color: white;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 0 0 0.5px rgb(143, 143, 143);
}

.calendar-row {
  display: flex;
  width: 100%;
  gap: 1px;
}

.calendar-cell-title {
  width: calc(100% / 7);
  padding: 10px 2px;
  text-align: center;
  background-color: rgba(231, 231, 231, 0.334);
  box-shadow: 0 0 0 0.5px rgb(143, 143, 143);
}

.calendar-cell {
  box-shadow: 0 0 0 0.5px rgb(143, 143, 143);
  width: calc(100% / 7);
  min-height: 100px;
  padding: 5px;
}

.calendar-cell-other-month {
  background-color: #f5f5f5;
}

.calendar-cell-desactive {
  box-shadow: 0 0 0 0.5px rgb(143, 143, 143);
  width: calc(100% / 7);
  min-height: 100px;
  padding: 5px;
  background-color: #d5d5d5;
}

.day-number {
  font-weight: 600;
  font-size: 18px;
  color: #495057;
  margin-bottom: 8px;
  text-align: right;
  padding-right: 5px;
}

.day-number.today {
  color: #007bff;
  background-color: #e7f3ff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.event {
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 4px;
}

.event-title {
  background: #89b4ff5b;
  border-left: 3px solid #0e66ff;
  padding: 2px 6px;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-title:hover {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.75);
}

.event-title.warning {
  background-color: #fff3cd;
  border-color: #ffc107;
}

.event-title.success {
  background-color: #d4edda;
  border-color: #28a745;
}

.event-title.error {
  background-color: #f8d7da;
  border-color: #dc3545;
}

.btn-more {
  width: 100%;
  font-size: 12px;
  padding: 2px 4px;
}

.day-reservation-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
}

.day-reservation-item:hover {
  background-color: #f5f5f5;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  overflow: auto;
}

.modal-day {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
}

.modal-fiche {
  width: 60%;
  max-height: 80vh;
  padding: 15px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h5 {
  margin: 0;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* Fiche réservation */
.fiche-grid {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
}

.fiche-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.fiche-row:last-child {
  border-bottom: none;
}

.fiche-cell {
  flex: 1;
  padding: 10px 15px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.fiche-cell:last-child {
  border-right: none;
}

.fiche-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.fiche-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.fiche-value.link {
  color: #3c8dbc;
  cursor: pointer;
}

.fiche-value.link:hover {
  text-decoration: underline;
}

.fiche-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* Nav tabs */
.nav-tabs-custom {
  margin-top: 15px;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

.nav-tabs li {
  margin-bottom: -1px;
}

.nav-tabs li a {
  display: block;
  padding: 8px 12px;
  color: #444;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
  font-size: 13px;
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
  max-height: 300px;
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: left;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}

.btn {
  display: inline-block;
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-primary {
  background-color: #3c8dbc;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dd4b39;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  color: white;
}

.bg-warning { background-color: #f39c12; }
.bg-success { background-color: #00a65a; }
.bg-error { background-color: #dd4b39; }

.text-center {
  text-align: center;
}

@media (max-width: 992px) {
  .modal-fiche {
    width: 95%;
  }
  
  .fiche-row {
    flex-wrap: wrap;
  }
  
  .fiche-cell {
    flex: 0 0 50%;
    border-bottom: 1px solid #eee;
  }
}
</style>
