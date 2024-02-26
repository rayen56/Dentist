from odoo import models, fields, api


class Treatment(models.Model):
    _name = 'dentist.treatment'
    _description = 'Tooth Treatment Model'

    name = fields.Char(string='Treatment Name')
    patient_ids = fields.Many2many('dentist.patient', string="Patient")
    description = fields.Text(string='Treatment Description', help="Description of the treatment")
    duration = fields.Float(string='Treatment Duration', help="Estimated time in minutes or hours")
    total_cost = fields.Float(
        string='Total Cost',
        compute='_compute_total_cost',
        store=True,
        help="Total cost of the treatment including procedure costs"
    )
    notes = fields.Text(string='Treatment Notes', help="Additional information about the treatment")
    treatment_data_ids = fields.One2many('treatment.data', 'treatment_id', string='Treatment Data')

    @api.depends('treatment_data_ids.cost')
    def _compute_total_cost(self):
        for treatment in self:
            total_cost = sum(data.cost for data in treatment.treatment_data_ids)
            treatment.total_cost = total_cost

    def action_show_tooth_custom(self):
        patient_names = ', '.join(self.patient_ids.mapped('name'))
        self.name = f'{patient_names} Treatment'

        return {
            'type': 'ir.actions.client',
            'tag': 'tooth_cust',
            'name': f'Tooth  - Patient: {patient_names}',
            'target': 'new',
            'context': {'active_id': self.id, 'patient': patient_names, 'total_cost': self.total_cost},
        }
