
from odoo import models, fields

class Procedure(models.Model):
    _name = 'dentist.procedure'
    _description = 'Dentist Procedure'

    name = fields.Char(string='Procedure Name', required=True)
    cost = fields.Float(string='Procedure Cost', required=True)
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.ref('base.TND').id,readonly=True)


