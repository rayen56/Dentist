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
            'click .save_button': '_onSaveButtonClick',
        },
        init: function (parent, action) {
            this._super(parent, action);
            this.selectedTeeth = []; // Keep track of selected teeth
            this.treatmentId = action.context.active_id;  // Get treatment ID from the context
        },
        start: function () {
            var self = this;
            self.load_data();
            self.loadSelectedTeeth();  // Load selected teeth on start
        },
        load_data: function () {
            var self = this;
            self._rpc({
                model: 'dentist.tooth',
                method: 'get_tooth_data',
                args: [],
            }).then(function (datas) {
                console.log("dataaaaaa", datas)
                self.$('.table_view').html(QWeb.render('ToothTable', {
                    tooth_lines: datas,
                }));
                // Call the method to update UI with initially selected teeth
                self.updateUIToSelectedTeeth();
            });
        },
        loadSelectedTeeth: function () {
            var self = this;

            // Fetch the selected_teeth data from the backend
            self._rpc({
                model: 'dentist.treatment',
                method: 'read',
                args: [[this.treatmentId], ['selected_teeth']],
            }).then(function (result) {
                var selectedTeethData = result[0].selected_teeth;

                if (selectedTeethData) {
                    // Parse the string to get the selected teeth
                    self.selectedTeeth = selectedTeethData.split(',').map(function (toothData) {
                        var toothInfo = toothData.split(':');
                        return {
                            id: toothInfo[0],
                        };
                    });

                    // Display the previously selected teeth in the console
                    console.log('Previously Selected Teeth:', self.selectedTeeth);

                    // You can update the UI to visually represent the previously selected teeth
                    // For example, you can add a CSS class to the corresponding buttons.
                    self.updateUIToSelectedTeeth();
                }
            });
        },
        updateUIToSelectedTeeth: function () {
            var self = this;

            // Remove the 'selected' class from all buttons
            self.$('.tooth_button').removeClass('selected');

            // Add a CSS class to buttons corresponding to selected teeth
            self.selectedTeeth.forEach(function (tooth) {
                self.$(`.tooth_button[data-id="${tooth.id}"]`).addClass('selected');
            });
        },

        _onToothButtonClick: function (ev) {
            var toothId = $(ev.currentTarget).data('id');

            // Check if the tooth is already selected
            var existingToothIndex = this.selectedTeeth.findIndex(function (tooth) {
                return tooth.id === toothId.toString().trim();
            });

            if (existingToothIndex !== -1) {
                // Remove the tooth if it's already selected
                this.selectedTeeth.splice(existingToothIndex, 1);

                // Update the UI to reflect the changes
                this.$(`.tooth_button[data-id="${toothId}"]`).removeClass('selected');
            } else {
                // Add the tooth if it's not selected
                this.selectedTeeth.push({
                    id: toothId.toString().trim(),
                });

                // Update the UI to reflect the changes
                this.$(`.tooth_button[data-id="${toothId}"]`).addClass('selected');
            }

            // Display the selected teeth (you can customize this part)
            console.log('Selected Teeth:', this.selectedTeeth);
        },
        _onSaveButtonClick: function () {
            var self = this;

            // Prepare the selected teeth data as a string
            var selectedTeethData = this.selectedTeeth.map(function (tooth) {
                return `${tooth.id}`;
            }).join(',');

            // Update the selected_teeth field in the backend
            self._rpc({
                model: 'dentist.treatment',
                method: 'write',
                args: [[this.treatmentId], {selected_teeth: selectedTeethData}],
            }).then(function (result) {
                // Handle the result as needed (e.g., show a success message)
                console.log('Saved Selected Teeth:', result);
            });
        },
    });

    core.action_registry.add("tooth_cust", ToothCustom);
    return ToothCustom;
});
