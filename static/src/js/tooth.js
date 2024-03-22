odoo.define('dentist.tooth_cust', function (require) {
    'use strict';
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var QWeb = core.qweb;


    var ToothCustom = AbstractAction.extend({
            template: 'ToothCust',
            events: {
                'click .tooth_button': '_onToothButtonClick',
                'click .mark-completed-button': '_onMarkCompletedButtonClick',
                'click .mark-in-progress-button': '_onMarkInProgressButtonClick',
                'click .save-button': '_onSaveButtonClick',
                'click .close-button': '_onCloseButtonClick',
                'click .procedure_button': '_onProcedureButtonClick',
                'click .remove_tooth_button': '_onRemoveToothButtonClick'
            },
            init: function (parent, action) {
                this._super(parent, action);
                this.selectedTeeth = [];
                this.selectedProcedures = [];
                this.treatmentId = action.context.active_id;  // Get treatment ID from the context
                this.patient = action.context.patient;  // Get patient names from the context
                this.totalCost = action.context.total_cost;  // Get total cost from the context
            },
            start: function () {
                var self = this;
                self.load_data();
                self.loadTeeth();
                self.loadTreatmentData();
            },
            load_data: function () {
                var self = this;
                self._rpc({
                    model: 'dentist.procedure',
                    method: 'search_read',
                    args: [],
                }).then(function (procedures_data) {
                    self.$('.Procedure_table_view').html(QWeb.render('ProcedureTable', {
                        procedure_lines: procedures_data,
                    }));
                    console.log("procedures_data", procedures_data);
                });
                self._rpc({
                    model: 'dentist.tooth',
                    method: 'get_tooth_data',
                    args: [],
                }).then(function (datas) {
                    self.$('.table_view').html(QWeb.render('ToothTable', {
                        tooth_lines: datas,
                    }));
                    // Update UI
                    self.updateUIToLoadTeeth();
                });
            },
            // Function to load treatment data
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
                    self.displayTreatmentData(treatmentData);
                });
            }
            ,
            _onRemoveToothButtonClick: function (ev) {
                var self = this;
                var toothId = $(ev.currentTarget).data('id');
                console.log("toothId", toothId);

                    self._rpc({
                        model: 'treatment.data',
                        method: 'unlink',
                        args: [[toothId]],
                    }).then(function (result) {
                        self.loadTeeth();
                        self.showAlert('Tooth deleted successfully!', 'danger');
                    });
            },
            // Function to display treatment data in the UI
            displayTreatmentData: function (treatmentData) {
                var self = this;

                // Check if there is treatment data
                if (treatmentData && treatmentData.length > 0) {
                    // Render treatment data in the UI (you can use QWeb or other methods)
                    self.$('.treatment_table_view').html(QWeb.render('TreatmentTable', {
                        treatment_lines: treatmentData,
                        totalCost: self.totalCost,  // Add total cost to the template context
                    }));
                }
            },
            loadTeeth: function () {
                var self = this;

                // Fetch the selected_teeth data from the backend
                self._rpc({
                    model: 'treatment.data',
                    method: 'search_read',
                    domain: [['treatment_id', '=', self.treatmentId]],
                    fields: ['tooth_id', 'status', 'procedure', 'cost', 'universal_number'],
                }).then(function (result) {
                    console.log("Fetched data from backend:", result);

                    // Map the result to selectedTeeth
                    self.loadedTeeth = result.map(function (record) {
                        return {
                            id: record.tooth_id.toString().trim(),
                            status: record.status,
                            procedure: record.procedure,
                            cost: record.cost,
                            universal_number: record.universal_number,
                        };
                    });
                    console.log("Updated selectedTeeth:", self.loadedTeeth);
                });
            },

            updateUIToLoadTeeth: function () {
                var self = this;

                // Remove the 'selected', 'completed', and 'in-progress' classes from all buttons
                self.$('.tooth_button').removeClass('selected completed in-progress');

                // Add 'selected' class to all buttons corresponding to loaded teeth
                self.loadedTeeth.forEach(function (tooth) {
                    var toothButton = self.$(`.tooth_button[data-id="${tooth.id}"]`);
                    toothButton.addClass('selected');

                    // Toggle the 'completed' and 'in-progress' classes based on the tooth status
                    toothButton.toggleClass('completed', tooth.status === 'completed');
                    toothButton.toggleClass('in-progress', tooth.status === 'in_progress');
                });
            },
            _onProcedureButtonClick: function (ev) {
                var procedureId = $(ev.currentTarget).data('id');
                var procedureName = $(ev.currentTarget).data('name');
                var procedureCost = $(ev.currentTarget).data('cost');

                console.log("Procedure ID:", procedureId);
                console.log("Procedure Name:", procedureName);
                console.log("Procedure Cost:", procedureCost);
                // Checking if no teeth are selected
                if (this.selectedTeeth.length === 0) {
                    window.alert('Please select a tooth first!');
                    return;
                }

                var self = this;
                // Iterate over selected teeth and add procedure-related data
                this.selectedTeeth.forEach(function (tooth) {
                    var procedureData = {
                        procedure_id: procedureId.toString().trim(),
                        name: procedureName.toString().trim(),
                        cost: procedureCost,
                    };
                    tooth.procedureData = procedureData;  // Save procedure data with the tooth
                    self.selectedProcedures.push(procedureData);
                });
                // Logging the selected procedures for debugging or tracking purposes
                console.log("Selected Procedures", this.selectedProcedures);
                console.log("Selected Teeth", this.selectedTeeth);
            },
            _onToothButtonClick: function (ev) {
                var self = this;
                var toothId = $(ev.currentTarget).data('id');
                var toothNumber = $(ev.currentTarget).data('universal_number');


                // Check if the tooth is already selected
                var existingToothIndex = this.selectedTeeth.findIndex(function (tooth) {
                    return tooth.id === toothId.toString().trim();
                });

                // Define an array of possible statuses
                var possibleStatuses = ['completed', 'in_progress'];

                if (existingToothIndex !== -1) {
                    // Tooth is already selected, change its status or perform other actions
                    console.log("Tooth already selected. Existing status:", this.selectedTeeth[existingToothIndex].status);

                    // Find the index of the current status in the array
                    var currentStatusIndex = possibleStatuses.indexOf(this.selectedTeeth[existingToothIndex].status);

                    // Calculate the next status index
                    var nextStatusIndex = (currentStatusIndex + 1) % possibleStatuses.length;

                    // Update the status to the next one in the array
                    this.selectedTeeth[existingToothIndex].status = possibleStatuses[nextStatusIndex];

                    // Update the UI to reflect the changes with the corresponding status
                    self.updateUIToTeethStatus(this.selectedTeeth, 'selected');
                } else {
                    // Add the tooth if it's not already selected
                    this.selectedTeeth.push({
                        id: toothId.toString().trim(),
                        status: '',
                        toothNumber: toothNumber.toString().trim(),
                        // Initialize with the first status
                    });

                    console.log("Tooth added. Updated selectedTeeth:", this.selectedTeeth);

                    // Update the UI to reflect the changes with the corresponding status
                    self.updateUIToTeethStatus(this.selectedTeeth, 'selected');
                }
            },
            showAlert: function (message, type = 'success') {
                var self = this;
                var alertClasses = {
                    'success': 'alert-success',
                    'info': 'alert-info',
                    'warning': 'alert-warning',
                    'danger': 'alert-danger'
                };

                var $alert = $('<div class="alert ' + alertClasses[type] + ' position-absolute" role="alert">' + message + '</div>');
                $('.alert-container').append($alert);

                $alert.css({
                    top: '14px',
                    right: '17px',
                    zIndex: '1200'
                });

                setTimeout(function () {
                    $alert.fadeOut('slow', function () {
                        $(this).remove();
                    });
                }, 2000); // Alert disappears after 2 seconds (adjust as needed)
            },


            _onMarkCompletedButtonClick: function () {
                var self = this;
                var selectedForCompletion = JSON.parse(JSON.stringify(self.selectedTeeth));
                // Set status as 'completed' for selected teeth
                selectedForCompletion.forEach(function (tooth) {
                    tooth.status = 'completed';
                });

                console.log("Teeth selected for completion:", selectedForCompletion);

                // Save completed teeth directly to the backend
                self.saveTeeth(selectedForCompletion);

                // Update the UI for teeth marked as completed
                self.updateUIToTeethStatus(selectedForCompletion, 'completed');

                // Clear the selectedTeeth array (original one remains unchanged)
                self.selectedTeeth = [];
                self.showAlert('Teeth marked as completed successfully!', 'success');

            },
            _onMarkInProgressButtonClick: function () {
                var self = this;
                var selectedForProgress = JSON.parse(JSON.stringify(self.selectedTeeth));
                console.log("Selected for progress:", selectedForProgress);

                // Set status as 'in_progress' for selected teeth
                selectedForProgress.forEach(function (tooth) {
                    tooth.status = 'in_progress';
                });

                console.log("Teeth selected for progress:", selectedForProgress);

                // Save in-progress teeth directly to the backend
                self.saveTeeth(selectedForProgress);

                // Update the UI for teeth marked as in-progress
                self.updateUIToTeethStatus(selectedForProgress, 'in-progress');

                // Clear the selectedTeeth array (original one remains unchanged)
                self.selectedTeeth = [];
                self.showAlert('Teeth marked as in-progress successfully!', 'warning');

            },
            saveTeeth: function (teeth) {
                var self = this;

                // Save data to the backend
                teeth.forEach(function (tooth) {
                    // Check if procedure data is available
                    if (tooth.procedureData) {
                        self._rpc({
                            model: 'treatment.data',
                            method: 'create',
                            args: [{
                                treatment_id: self.treatmentId,
                                tooth_id: tooth.id,
                                universal_number: tooth.toothNumber,
                                status: tooth.status,
                                procedure: tooth.procedureData.name,
                                cost: tooth.procedureData.cost,
                                patient_id: self.patient,
                                // Add additional fields if needed
                            }],
                        });
                    } else {
                        // If no procedure data, save only tooth-related data
                        self._rpc({
                            model: 'treatment.data',
                            method: 'create',
                            args: [{
                                treatment_id: self.treatmentId,
                                tooth_id: tooth.id,
                                universal_number: tooth.toothNumber,
                                status: tooth.status,
                                patient_id: self.patient,  // Add patient_id to the data

                            }],
                        });
                    }
                });
            },

            updateUIToTeethStatus: function (teeth, statusClass) {
                var self = this;

                // Add a CSS class to buttons corresponding to teeth with the specified status
                teeth.forEach(function (tooth) {
                    var $toothButton = self.$(`.tooth_button[data-id="${tooth.id}"]`);

                    // Remove the status classes and then add the new one
                    $toothButton.removeClass('selected completed in-progress').addClass(statusClass);
                });
            },
        })
    ;

    core.action_registry.add("tooth_cust", ToothCustom);
    return ToothCustom;
});