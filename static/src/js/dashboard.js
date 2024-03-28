odoo.define('dentist.dashboard_cust', function (require) {
    "use strict";

    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var QWeb = core.qweb;
    var _t = core._t;

    var MyDashboardAction = AbstractAction.extend({
        template: 'dentist_dashboard',
        init: function (parent, context) {
            this._super(parent, context);
        },
        start: function (parent, action) {
            this._super.apply(this, arguments);
            this.loadDashboardData();
            this.loadRevenueChart();
            this.loadTotalRevenue();
            this.loadTreatment();
            this.loadDemographicsChart();
        },
        loadDashboardData: function () {
            var self = this;
            // Fetch Procedure Data
            self._rpc({
                model: 'dentist.procedure',
                method: 'search_read',
                args: [],
            }).then(function (procedureData) {
                self.$('.procedureStats').text(procedureData.length);
            });
            // Fetch Appointment Data
            self._rpc({
                model: 'dentist.appointment',
                method: 'search_read',
                args: [],
            }).then(function (appointmentData) {
                self.$('.appointmentStats').text(appointmentData.length);
            });
            // Fetch Patient Data
            rpc.query({
                model: 'dentist.patient',
                method: 'search_read',
                args: [],
            }).then(function (patientData) {
                self.$('.patientStats').text(patientData.length);
            });
            self._rpc({
                model: 'dentist.appointment',
                method: 'get_today_appointments',
                args: [],
            }).then(function (todayPatientData) {
                var todayAppointmentList = $('.todayAppointmentStats');
                var todayAppointmentCount = $('.todayAppointmentCount');
                todayAppointmentCount.text(todayPatientData.length);
                todayAppointmentList.empty();
                if (todayPatientData.length > 0) {
                    var maxAppointments = 30;
                    var itemsPerPage = 6;
                    var totalPages = Math.ceil(todayPatientData.length / itemsPerPage);
                    var currentPage = 1;
                    displayAppointments(getAppointmentsForCurrentPage());
                    // Display pagination buttons
                    displayPaginationButtons();
                    // Update progress bar width and color based on the count of today's appointments
                    updateProgressBar(todayPatientData.length, maxAppointments);
                    // Event handlers for next and previous page buttons
                    $('.nextPageBtn').click(function () {
                        updatePage(1);
                    });
                    $('.prevPageBtn').click(function () {
                        updatePage(-1);
                    });
                    self.$('.appointments-section').click(function () {
                var today = new Date();
                var startDate = today.toISOString().slice(0, 10) + ' 00:00:00';
                var endDate = today.toISOString().slice(0, 10) + ' 23:59:59';

                self.do_action({
                    name: _t('Today Appointment'),
                    type: 'ir.actions.act_window',
                    res_model: 'dentist.appointment',
                    views: [[false, 'list'], [false, 'form'], [false, 'kanban'], [false, 'calendar']],
                    target: 'main',
                    domain: [['appointment_date', '>=', startDate], ['appointment_date', '<=', endDate]], // Apply the domain filter
                });
            });
                } else {
                    todayAppointmentList.append('<li class="list-group-item text-center">' + _t('No appointments for today') + '</li>');
                    $('.pagination').hide();
                }

                function updatePage(change) {
                    currentPage += change;
                    displayAppointments(getAppointmentsForCurrentPage());
                }

                function updateProgressBar(appointmentCount, maxCount) {
                    var progressBarWidth = (appointmentCount / maxCount) * 100;
                    $('.progress-bar').css('width', progressBarWidth + '%').attr('aria-valuenow', progressBarWidth);
                    // Dynamically change progress bar color based on the progress
                    var progressBarColorClass = getProgressBarColorClass(progressBarWidth);
                    $('.progress-bar').removeClass('bg-success bg-warning bg-danger').addClass(progressBarColorClass);
                }

                function getProgressBarColorClass(width) {
                    if (width < 33) {
                        return 'bg-success';
                    } else if (width < 66) {
                        return 'bg-warning';
                    } else {
                        return 'bg-danger';
                    }
                }

                function displayAppointments(appointments) {
                    todayAppointmentList.empty();

                    appointments.forEach(function (appointment) {
                        var formattedTime = formatAppointmentTime(appointment.appointment_date);
                        var statusBadge = getStatusBadge(appointment.state);
                        todayAppointmentList.append(
                            '<li class="list-group-item appointment-item d-flex justify-content-between align-items-center bg-100">' +
                            '<div class="appointment-details">' +
                            '<h5 class="mb-1">' + appointment.name + '</h5>' +
                            '<p class="mb-1">' + formattedTime + '</p>' +
                            '</div>' +
                            '<div class="status-badge">' + statusBadge + '</div>' +
                            '</li>'
                        );
                    });
                }

                function getStatusBadge(status) {
                    switch (status) {
                        case 'confirmed':
                            return '<span class="badge bg-success">✔ Confirmed</span>';
                        case 'cancelled':
                            return '<span class="badge bg-danger">✖ Canceled</span>';
                        case 'draft':
                            return '<span class="badge bg-warning">Draft</span>';
                        case 'done':
                            return '<span class="badge bg-info">Done</span>';
                        default:
                            return '<span class="badge bg-secondary"></span>';
                    }
                }


                function formatAppointmentTime(appointmentDate) {
                    var date = new Date(appointmentDate);
                    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                }

                function formatAppointmentStatus(status) {
                    switch (status) {
                        case 'draft':
                            return 'Draft';
                        case 'confirmed':
                            return 'Confirmed';
                        case 'done':
                            return 'Done';
                        case 'canceled':
                            return 'Canceled';
                        default:
                            return status;
                    }
                }

                function getAppointmentsForCurrentPage() {
                    var startIndex = (currentPage - 1) * itemsPerPage;
                    var endIndex = startIndex + itemsPerPage;
                    return todayPatientData.slice(startIndex, endIndex);
                }

                function displayPaginationButtons() {
                    var paginationHtml =
                        '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';
                    for (var i = 1; i <= totalPages; i++) {
                        var activeClass = i === currentPage ? 'active' : ''; // Add 'active' class for the current page
                        paginationHtml += '<li class="page-item ' + activeClass + '"><a class="page-link">' + i + '</a></li>';
                    }
                    paginationHtml +=
                        '</ul></nav>';

                    $('.pagination-container').html(paginationHtml);

                    $('.pagination a.page-link').click(function (event) {
                        event.preventDefault();  // Prevent the default behavior
                        currentPage = parseInt($(this).text());
                        displayAppointments(getAppointmentsForCurrentPage());
                        displayPaginationButtons(); // Re-render pagination buttons to update the 'active' class
                    });
                }

            });
            rpc.query({
                model: 'treatment.data',
                method: 'get_revenue_breakdown_with_currency',
                args: ['daily'],
            }).then(function (data) {
                var dailyRevenueData = data.revenue_data;
                var currency = data.currency;

                // Calculate total daily revenue
                var totalDailyRevenue = Object.values(dailyRevenueData)
                    .filter(revenue => revenue !== null)
                    .reduce((acc, revenue) => acc + revenue, 0);

                // Display total daily revenue with currency on the card
                self.$('.dailyRevenue').text(totalDailyRevenue.toFixed(2) + ' ' + currency);
            });

        },
        loadDemographicsChart: function () {
            var self = this;

            // Fetch Patient Demographics Data
            rpc.query({
                model: 'dentist.patient',
                method: 'get_demographics_data',
                args: [],
            }).then(function (demographicsData) {
                // Extract data for the chart
                var labels = Object.keys(demographicsData);
                var data = Object.values(demographicsData);

                // Create a pie chart for patient demographics
                var demographicsChart = new Chart("demographicsChart", {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: ['#36A2EB', '#f82251'],
                            hoverOffset: 4
                        }],
                    },
                    options: {},
                });
            });
        },
        loadTreatment: function () {
            var self = this;

            // Fetch Treatment Data
            rpc.query({
                model: 'treatment.data',
                method: 'search_read',
                args: [],
            }).then(function (treatmentData) {
                self.$('.treatmentStats').text(treatmentData.length);
                // Process treatment data
                var completedCount = 0;
                var inProgressCount = 0;

                treatmentData.forEach(function (treatment) {
                    if (treatment.status === 'completed') {
                        completedCount++;
                    } else if (treatment.status === 'in_progress') {
                        inProgressCount++;
                    }
                });

                var statusChart = new Chart("treatment_status_chart", {
                    type: 'bar',
                    data: {
                        labels: ['Completed', 'In Progress'],
                        datasets: [{
                            data: [completedCount, inProgressCount],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)', // Blue color for Completed
                                'rgba(242, 34, 81, 1)', // Red color for In Progress
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(242, 34, 81, 1)',
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    precision: 0
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: false // Hide legend
                            },
                        },
                    }
                });

            });
        },
        loadTotalRevenue:
            function () {
                var self = this;

                // Load Total Revenue
                rpc.query({
                    model: 'treatment.data',
                    method: 'get_total_revenue',
                    args: [],
                }).then(function (totalRevenue) {
                    self.$('.revenueStats').text(totalRevenue);
                });
            }
        ,
        loadRevenueChart: function () {
            var self = this;
            var revenueChart;

            // Function to fetch and render chart based on time frame
            function fetchAndRenderChart(timeFrame) {
                rpc.query({
                    model: 'treatment.data',
                    method: 'get_revenue_breakdown',
                    args: [timeFrame],
                }).then(function (revenueData) {
                    // Destroy existing chart if it exists
                    if (revenueChart) {
                        revenueChart.destroy();
                    }

                    // Extract data for the chart
                    var dates = Object.keys(revenueData);
                    var revenueValues = Object.values(revenueData);

                    if (revenueValues.length == 0) {
                        // Update text when there's no data
                        $('.no-data-text').text(_t('No data available for the selected time frame'));

                        setActiveButton(timeFrame);

                        // Hide canvas element
                        $('revenue_chart').hide();
                    } else {
                        // Show canvas element
                        $('revenue_chart').show();
                        $('.no-data-text').text("");
                        // Create a line chart for revenue breakdown
                        configureAndRenderChart(dates, revenueValues);
                        setActiveButton(timeFrame);
                    }

                    console.log(timeFrame, "Line Chart", dates, revenueValues);
                });
            }


            // Function to configure and render the chart
            function configureAndRenderChart(labels, data) {
                // Filter out null values from the data and corresponding labels
                var filteredData = data.filter((value, index) => value !== null);
                var filteredLabels = labels.filter((label, index) => data[index] !== null);

                revenueChart = new Chart("revenue_chart", {
                    type: 'line',
                    data: {
                        labels: filteredLabels, // Use the filtered labels
                        datasets: [{
                            label: _t('Total Earning'),
                            data: filteredData, // Use the filtered data
                            fill: 'start',
                            pointRadius: 1,
                            pointHoverRadius: 5,
                            backgroundColor: '#d1d1e261', // Light Blue
                            borderColor: '#8584b291', // Teal
                            borderWidth: 2,
                            tension: 0.4,
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 200,
                                },
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.1)', // Light grid color

                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: false,
                            }
                        },
                    },
                });
            }


            // Set the active class to the clicked button
            function setActiveButton(activeTimeFrame) {
                self.$('.chart-btn').removeClass('active'); // Remove active class from all buttons
                self.$('.chart-btn[data-time-frame="' + activeTimeFrame + '"]').addClass('active'); // Add active class to the clicked button
            }

            // Initial chart load
            fetchAndRenderChart('monthly');

            // Button click event handlers
            self.$('.chart-btn').click(function () {
                var timeFrame = $(this).data('time-frame');
                fetchAndRenderChart(timeFrame);
            });
        },
    });

    core.action_registry.add('dashboard_cust', MyDashboardAction);

    return MyDashboardAction;
})
;