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
            'click .procedure_button': '_onProcedureButtonClick',

        },
        init: function (parent, action) {
            this._super(parent, action);
            this.selectedTeeth = []; // Keep track of selected teeth
            this.completedTeeth = []; // Keep track of completed teeth
            this.inProgressTeeth = []; // Keep track of in-progress teeth
            this.selectedProcedures = []; // Keep track of selected procedures
            this.completedProcedure = []; // Keep track of completed procedures
            this.progressProcedure = []; // Keep track of in-progress procedures
            this.treatmentId = action.context.active_id;  // Get treatment ID from the context
        },
        start: function () {
            var self = this;
            self.load_data();
            self.loadSelectedTeeth();

        },
        compute_total_cost: function (treatment) {
            var totalCost = 0;
            var completedProcedures = treatment.completed_procedure.split(',').map(function (procedure) {
                return procedure.trim();
            });

            // Assuming procedures is an array of objects with 'id' and 'tooth_id' properties
            var procedures = this.procedure_lines || [];

            completedProcedures.forEach(function (procedureId) {
                var matchedProcedure = procedures.find(function (proc) {
                    return proc.id === procedureId;
                });

                if (matchedProcedure) {
                    totalCost += matchedProcedure.cost;
                }
            });

            return totalCost.toFixed(2);  // Adjust this based on your precision requirements
        },


        load_data: function () {
            var self = this;
            self._rpc({
                model: 'dentist.treatment',
                method: 'search_read',
                args: [[['id', '=', self.treatmentId]], ['completed_procedure', 'progress_procedure']],
            }).then(function (treatments) {
                self.$('.treatment_table_view').html(QWeb.render('TreatmentTable', {
                    treatment_lines: treatments,
                }));

                console.log("treatments", treatments)
            });


            self._rpc({
                model: 'dentist.procedure',
                method: 'search_read',
                args: [],
            }).then(function (procedures_data) {
                self.$('.Procedure_table_view').html(QWeb.render('ProcedureTable', {
                    procedure_lines: procedures_data,
                }));
            });

            self._rpc({
                model: 'dentist.tooth',
                method: 'get_tooth_data',
                args: [],
            }).then(function (datas) {
                self.$('.table_view').html(QWeb.render('ToothTable', {
                    tooth_lines: datas,
                }));

                // Fetch the completed and in-progress teeth data from the backend
                self._rpc({
                    model: 'dentist.treatment',
                    method: 'read',
                    args: [[self.treatmentId], ['tooth_completed', 'tooth_in_progress', 'progress_procedure', 'completed_procedure']],
                }).then(function (result) {
                    var completedTeethData = result[0].tooth_completed;
                    var inProgressTeethData = result[0].tooth_in_progress;
                    var progressProcedureData = result[0].progress_procedure;
                    var completedProcedureData = result[0].completed_procedure;


                    // Parse the string to get the completed teeth
                    var completedTeeth = completedTeethData ? completedTeethData.split(',').map(function (tooth) {
                        return tooth.trim();
                    }) : [];

                    // Parse the string to get the in-progress teeth
                    var inProgressTeeth = inProgressTeethData ? inProgressTeethData.split(',').map(function (tooth) {
                        return tooth.trim();
                    }) : [];
                    // Parse the progressProcedureData string into an array of objects
                    var progressProcedureArray = progressProcedureData ? progressProcedureData.split(',').reduce(function (accumulator, currentValue, currentIndex, array) {
                        if (currentIndex % 2 === 0) {
                            accumulator.push({
                                id: currentValue,
                                tooth_id: array[currentIndex + 1]
                            });
                        }
                        return accumulator;
                    }, []) : [];
                    var completedProcedureArray = completedProcedureData ? completedProcedureData.split(',').reduce(function (accumulator, currentValue, currentIndex, array) {
                        if (currentIndex % 2 === 0) {
                            accumulator.push({
                                id: currentValue,
                                tooth_id: array[currentIndex + 1]
                            });
                        }
                        return accumulator;
                    }, []) : [];

                    // Update UI based on completed and in-progress teeth
                    self.completedTeeth = completedTeeth;
                    self.inProgressTeeth = inProgressTeeth;
                    self.progressProcedure = progressProcedureArray;
                    self.completedProcedure = completedProcedureArray;
                    self.updateUIToCompletedTeeth();
                    self.updateUIToInProgressTeeth();
                    self.updateUiToInProgressProcedure();
                    self.updateUiToCompletedProcedure();
                });
            });
        },

        loadSelectedTeeth:

            function () {
                var self = this;

                // Fetch the selected_teeth data from the backend
                self._rpc({
                    model: 'dentist.treatment',
                    method: 'read',
                    args: [[this.treatmentId], ['tooth_completed', 'tooth_in_progress']],
                }).then(function (result) {
                    var completedTeethData = result[0].tooth_completed;
                    var inProgressTeethData = result[0].tooth_in_progress;
                    if (completedTeethData) {
                        self.completedTeeth = completedTeethData.split(',').map(function (tooth) {
                            return tooth.trim();
                        });
                    }

                    if (inProgressTeethData) {
                        self.inProgressTeeth = inProgressTeethData.split(',').map(function (tooth) {
                            return tooth.trim();
                        });
                    }

                    // Update UI based on completed and in-progress teeth
                    self.updateUIToCompletedTeeth();
                    self.updateUIToInProgressTeeth();
                });
            }

        ,

        updateUIToSelectedTeeth: function () {
            var self = this;

            // Remove the 'selected' class from all buttons
            self.$('.tooth_button').removeClass('selected');

            // Add a CSS class to buttons corresponding to selected teeth
            self.selectedTeeth.forEach(function (tooth) {
                self.$(`.tooth_button[data-id="${tooth.id}"]`).addClass('selected');
            });
        }
        ,

        updateUIToCompletedTeeth: function () {
            var self = this;

            // Remove the 'completed' class from all buttons
            self.$('.tooth_button').removeClass('completed');

            // Add a CSS class to buttons corresponding to completed teeth
            self.completedTeeth.forEach(function (toothId) {
                self.$(`.tooth_button[data-id="${toothId}"]`).addClass('completed');
            });
        }
        ,
        updateUiToCompletedProcedure: function () {
            var self = this;
            self.completedProcedure.forEach(function (procedure) {
                self.$(`.procedure_button[data-name="${procedure.id}"]`).addClass('btn-success');
            });
        }
        ,
        updateUiToInProgressProcedure: function () {
            var self = this;
            self.progressProcedure.forEach(function (procedure) {
                self.$(`.procedure_button[data-name="${procedure.id}"]`).addClass('btn-warning');
            });
        }
        ,

        updateUIToInProgressTeeth: function () {
            var self = this;

            // Remove the 'in-progress' class from all buttons
            self.$('.tooth_button').removeClass('in-progress');

            // Add a CSS class to buttons corresponding to in-progress teeth
            self.inProgressTeeth.forEach(function (toothId) {
                self.$(`.tooth_button[data-id="${toothId}"]`).addClass('in-progress');
            });
        }
        ,
        _onProcedureButtonClick: function (ev) {
            // Extracting the procedure ID from the clicked button's data attribute
            var procedureId = $(ev.currentTarget).data('name');


            if (this.selectedTeeth.length === 0) {
                this.showAlert("Please select teeth first");
                return;
            }
            this.selectedTeeth.forEach(function (tooth) {
                this.selectedProcedures.push({
                    id: procedureId.toString().trim(),
                    tooth_id: tooth.id
                });
            }, this);
            this.$(`.procedure_button[data-name="${procedureId}"]`).addClass('selected');

            // Logging the selected procedures for debugging or tracking purposes
        }
        ,
        _onToothButtonClick: function (ev) {
            var toothId = $(ev.currentTarget).data('id');
            var isSelected = this.selectedTeeth.some(function (tooth) {
                return tooth.id === toothId.toString().trim();
            });
            // Check if the tooth is already completed or in progress
            var isCompleted = this.completedTeeth.includes(toothId);
            var isInProgress = this.inProgressTeeth.includes(toothId);
            var isCompletedProcedure = this.completedProcedure.some(function (procedure) {
                    return procedure.tooth_id === toothId.toString().trim();
                }
            );
            var isInProgressProcedure = this.progressProcedure.some(function (procedure) {
                return procedure.tooth_id === toothId.toString().trim();
            });
            console.log("isCompletedProcedure", isCompletedProcedure, 'isCompleted', isCompleted, 'isInProgress', isInProgress, 'isInProgressProcedure', isInProgressProcedure);
            // Remove the tooth if it's already selected
            if (isSelected) {
                this.removeFromCompletedTeeth(toothId);
                this.removeFromInProgressTeeth(toothId);

                // Update the UI to reflect the changes
                this.$(`.tooth_button[data-id="${toothId}"]`).removeClass('selected');

                // Remove the tooth from the selectedTeeth array
                this.selectedTeeth = this.selectedTeeth.filter(function (tooth) {
                    return tooth.id !== toothId.toString().trim();
                });
                this.showAlert("Tooth removed", 1100, 800)

            } else {
                // Add the tooth if it's not selected and not completed or in progress
                if (!isCompleted && !isInProgress) {
                    this.selectedTeeth.push({
                        id: toothId.toString().trim(),
                    });

                    // Update the UI to reflect the changes
                    this.$(`.tooth_button[data-id="${toothId}"]`).addClass('selected');
                }
            }
        }
        ,
        showAlert: function (message, zinedx, timeout) {
            var self = this;
            var $alert = $('<div class="alert alert-danger   position-absolute " role="alert">' + message + '</div>');
            $('.container').append($alert);
            $alert.css({
                top: '14px',
                right: '17px',
                zIndex: zinedx
            });
            setTimeout(function () {
                $alert.fadeOut('slow', function () {
                    $(this).remove();
                });
            }, timeout);
        }
        ,
        removeProceduresByToothId: function (toothId, procedureType) {
            var proceduresArray = this[procedureType];
            var updatedProcedures = proceduresArray.filter(function (procedure) {
                return procedure.tooth_id !== toothId.toString().trim();
            });

            // Update the original procedures array
            this[procedureType] = updatedProcedures;

            // Update UI based on the procedureType
            if (procedureType === 'completedProcedure') {
                this.updateUiToCompletedProcedure();
            } else if (procedureType === 'progressProcedure') {
                this.updateUiToInProgressProcedure();
            }
        }
        ,
        removeFromCompletedTeeth: function (toothId) {
            var index = this.completedTeeth.indexOf(toothId.toString().trim());
            if (index !== -1) {
                this.removeProceduresByToothId(toothId, 'completedProcedure');

                this.completedTeeth.splice(index, 1);
                this.updateUIToCompletedTeeth();
                this.updateUiToCompletedProcedure();
            }
        }
        ,

        removeFromInProgressTeeth: function (toothId) {
            var index = this.inProgressTeeth.indexOf(toothId.toString().trim());
            if (index !== -1) {
                this.removeProceduresByToothId(toothId, 'progressProcedure')
                this.inProgressTeeth.splice(index, 1);
                this.updateUiToInProgressProcedure();
                this.updateUIToInProgressTeeth();
            }
        }
        ,
        _onMarkCompletedButtonClick: function () {
            var self = this;

            // Add the selected teeth to the completedTeeth array
            self.selectedTeeth.forEach(function (tooth) {
                if (!self.completedTeeth.includes(tooth.id)) {
                    self.completedTeeth.push(tooth.id);
                }
                // Remove from inProgressTeeth if it exists
                self.removeFromInProgressTeeth(tooth.id);
            });
            self.selectedProcedures.forEach(function (procedure) {
                self.completedProcedure.push({
                    id: procedure.id,
                    tooth_id: procedure.tooth_id
                });
            });
            // Update the UI to reflect the changes
            self.updateUIToCompletedTeeth();
            self.updateUiToCompletedProcedure();
            self.selectedTeeth = [];
            self.selectedProcedures = [];
            self.updateUIToSelectedTeeth();
        }
        ,


        _onMarkInProgressButtonClick: function () {
            var self = this;
            // Add the selected teeth to the inProgressTeeth array
            self.selectedTeeth.forEach(function (tooth) {
                if (!self.inProgressTeeth.includes(tooth.id)) {
                    self.inProgressTeeth.push(tooth.id);
                }
                // Remove from completedTeeth if it exists
                self.removeFromCompletedTeeth(tooth.id);
            });

            self.selectedProcedures.forEach(function (procedure) {
                self.progressProcedure.push({
                    id: procedure.id,
                    tooth_id: procedure.tooth_id
                });
            });

            // Update the UI to reflect the changes
            self.updateUIToInProgressTeeth();
            self.updateUiToInProgressProcedure();

            // Clear the selectedTeeth and selectedProcedures arrays
            self.selectedTeeth = [];
            self.selectedProcedures = [];
            self.updateUIToSelectedTeeth();
        }
        ,
        _onSaveButtonClick: function () {
            var self = this;

            // Prepare the selected teeth data as a string
            var selectedTeethData = this.selectedTeeth.map(function (tooth) {
                return `${tooth.id}`;
            }).join(',');

            // Prepare the completed teeth data as a string
            var completedTeethData = this.completedTeeth.join(',');

            // Prepare the in-progress teeth data as a string
            var inProgressTeethData = this.inProgressTeeth.join(',');

            var progressProcedureData = this.progressProcedure.map(function (procedure) {
                return `${procedure.id},${procedure.tooth_id}`;
            }).join(',');

            var completedProcedureData = this.completedProcedure.map(function (procedure) {
                return `${procedure.id},${procedure.tooth_id}`;
            }).join(',');

            // Update the selected_teeth, tooth_completed, and tooth_in_progress fields in the backend
            self._rpc({
                model: 'dentist.treatment',
                method: 'write',
                args: [[this.treatmentId], {
                    tooth_completed: completedTeethData,
                    tooth_in_progress: inProgressTeethData,
                    progress_procedure: progressProcedureData,
                    completed_procedure: completedProcedureData,

                }],
            }).then(function (result) {
                // Handle the result as needed (e.g., show a success message)
                window.alert('Operation completed successfully!');

            });
        }
        ,
    });

    core.action_registry.add("tooth_cust", ToothCustom);
    return ToothCustom;
})
;
