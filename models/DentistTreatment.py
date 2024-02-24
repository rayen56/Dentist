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

    selected_teeth = fields.Text(string='Selected Teeth')

    # New fields to track tooth status
    tooth_completed = fields.Char(string='Completed Teeth')
    tooth_in_progress = fields.Char(string='In Progress Teeth')

    progress_procedure = fields.Char(string='In Progress Procedure')
    completed_procedure = fields.Char(string='Completed Procedure')

    total_cost_info = fields.Text(string='Total Treatment Cost Information', compute='_compute_total_cost_info',
                                  store=True)

    @api.depends('completed_procedure', 'progress_procedure')
    def _compute_total_cost_info(self):
        for treatment in self:
            completed_procedure_info = self._get_procedure_info(treatment.completed_procedure)
            progress_procedure_info = self._get_procedure_info(treatment.progress_procedure)

            # Combine completed and progress procedure info
            total_info = completed_procedure_info + progress_procedure_info

            treatment.total_cost_info = total_info
            print(f"Total Cost Info for Treatment {treatment.name}:\n{total_info}")

    def _get_procedure_info(self, procedure_names):
        """Helper function to get procedure information (name, cost, and occurrence count)"""
        procedure_info = ''
        procedure_count = {}

        if procedure_names:
            procedure_name_list = procedure_names.split(',')
            procedure_objects = self.env['dentist.procedure'].search([('name', 'in', procedure_name_list)])

            for procedure in procedure_objects:
                if procedure.name not in procedure_count:
                    procedure_count[procedure.name] = 1
                else:
                    procedure_count[procedure.name] += 1

            for procedure_name, count in procedure_count.items():
                procedure_info += f"{procedure_name}: ${procedure.cost} x{count}\n"

        return procedure_info

    def action_show_tooth_custom(self):
        patient_names = ', '.join(self.patient_ids.mapped('name'))
        return {
            'type': 'ir.actions.client',
            'tag': 'tooth_cust',
            'name': f'Tooth  - Patient: {patient_names}',
            'target': 'new',
            'context': {'active_id': self.id},
        }
