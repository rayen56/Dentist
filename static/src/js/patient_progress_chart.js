odoo.define('dentist.patient_progress_chart', function (require) {
    'use strict';

    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var QWeb = core.qweb;

    var PatientProgressChart = AbstractAction.extend({
        template: 'PatientProgressChart',
        init: function (parent, action) {
            this._super.apply(this, arguments);
            this.treatmentId = action.context.active_id;
            this.totalCost = action.context.total_cost;
            this.patient = action.context.patient;
        },
        start: function () {
            var self = this;
            this.loadTreatmentData();
            this.loadPatientAppointments();
        },
        loadPatientAppointments: function () {
            var self = this;

            // Make an RPC call to fetch patient appointments
            rpc.query({
                model: 'dentist.appointment',
                method: 'get_patient_appointments',
                args: [self.patient],  // Pass the patient ID or other identifier
            }).then(function (appointmentsData) {
                // Process the fetched appointment data
                self.renderAppointmentChart(appointmentsData);
            });
        },
        renderAppointmentChart: function (appointmentData) {
            // Process the appointment data and render the chart using Chart.js
            var labels = appointmentData.map(function (appointment) {
                return appointment.date;
            });

            var counts = appointmentData.map(function (appointment) {
                return appointment.count;
            });

            var totalCounts = [];
            var runningTotal = 0;
            for (var i = 0; i < counts.length; i++) {
                runningTotal += counts[i];
                totalCounts.push(runningTotal);
            }

            var appointmentChartCanvas = document.getElementById("appointment_chart");
            if (appointmentChartCanvas) {
                var appointmentChart = new Chart(appointmentChartCanvas, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Appointment Count',
                            data: totalCounts,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointHitRadius: 10,
                            pointBorderWidth: 2,
                            pointBorderColor: 'rgba(255, 255, 255, 1)',
                            fill: true,
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            },
                        }
                    }
                });
            }
        },
        loadTreatmentData: function () {
            var self = this;

            // Make an RPC call to fetch treatment data
            rpc.query({
                model: 'treatment.data',
                method: 'search_read',
                domain: [['treatment_id', '=', self.treatmentId]],
                args: [],
            }).then(function (treatmentData) {
                // Process the fetched data
                self.updateTreatmentStatistics(treatmentData);
            });
        },
        updateTreatmentStatistics: function (treatmentData) {
            var totalProceduresCount = treatmentData.length;
            var patientName = this.patient;
            this.$('.patient-name').text(patientName)
            var completedProceduresCount = treatmentData.filter(function (procedure) {
                return procedure.status === 'completed';
            }).length;
            var progressPercentage = (completedProceduresCount / totalProceduresCount) * 100;

            this.$('.treatment-stats').html(QWeb.render('TreatmentStats', {
                totalProceduresCount: totalProceduresCount,
                completedProceduresCount: completedProceduresCount,
                progressPercentage: progressPercentage.toFixed(2),
                totalCost: this.totalCost,  // Update with actual total cost
            }));

            var progressChartCanvas = document.getElementById("progress_chart");
            if (progressChartCanvas) {
                var progressChart = new Chart(progressChartCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'In Progress'],
                        datasets: [{
                            label: 'Progress',
                            data: [completedProceduresCount, totalProceduresCount - completedProceduresCount],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(255, 99, 132, 0.8)',
                            ],
                            hoverOffset: 4,
                            borderWidth: 0,
                        }]
                    },
                });
            }
        },
    });

    core.action_registry.add('patient_progress_chart', PatientProgressChart);

    return PatientProgressChart;
});
