from odoo import models, fields, api


class Treatment(models.Model):
    _name = 'dentist.treatment'
    _description = 'Tooth Treatment Model'

    name = fields.Char(string='Treatment Name')
    patient_ids = fields.Many2many('dentist.patient', string="Patient")
    description = fields.Text(string='Treatment Description', help="Description of the treatment")
    duration = fields.Float(string='Treatment Duration', help="Estimated time in minutes or hours")
    cost = fields.Float(string='Treatment Cost', help="Estimated cost of the treatment")
    notes = fields.Text(string='Treatment Notes', help="Additional information about the treatment")

    selected_teeth = fields.Many2many('dentist.tooth', string='Selected Teeth')

    def action_show_tooth_custom(self):
        patient_names = ', '.join(self.patient_ids.mapped('name'))
        return {
            'type': 'ir.actions.client',
            'tag': 'tooth_cust',
            'name': f'Tooth  - Patient: {patient_names}',
            'target': 'new',
            'context': {'active_id': self.id},

        }

    @api.model
    def update_selected_teeth(self, treatment_id, selected_teeth):
        treatment = self.browse(treatment_id)
        treatment.write({'selected_teeth': [(6, 0, [tooth['tooth_id'] for tooth in selected_teeth])]})
        return True