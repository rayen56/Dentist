/*odoo.define('dentist.patient', function (require) {
    "use strict";

    var rpc = require('web.rpc');
    var current_url = window.location.href;
    var myArray = current_url.split("&");
    var current_model = myArray[2].replace('model=','');
    var view_type = myArray[3].replace('view_type=','');
    console.log('Current Model:', current_model, 'View Type:', view_type);
    rpc.query({
        model: 'dentist.patient',
        method: 'search_read',
        args: [[]],
        kwargs: { fields: ['name', 'id'] },
    }).then(function (result) {
        var patientData = result.map(function (patient) {
            return {
                name: patient.name,
                id: patient.id,
            };
        });
        console.log('Patient Data:', patientData);
    });
});*/

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
        },
        init: function(parent, action) {
            this._super(parent, action);
            this.selectedTeeth = []; // Keep track of selected teeth
        },
        start: function() {
            var self = this;
            self.load_data();
        },
        load_data: function () {
            var self = this;
            self._rpc({
                model: 'dentist.tooth',
                method: 'get_tooth_data',
                args: [],
            }).then(function(datas) {
                console.log("dataaaaaa", datas)
                self.$('.table_view').html(QWeb.render('ToothTable', {
                    tooth_lines: datas,
                }));
            });
        },
        _onToothButtonClick: function (ev) {
            var self = this;
            var tooth_id = $(ev.currentTarget).data('id');
            var tooth_name = $(ev.currentTarget).data('name');
            var tooth_data = {
                tooth_id: tooth_id,
                tooth_name: tooth_name,
            };

            console.log('Selected Teeth:', self.selectedTeeth);
        },
    });

    core.action_registry.add("tooth_cust", ToothCustom);
    return ToothCustom;
});

