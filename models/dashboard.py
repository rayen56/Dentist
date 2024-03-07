from odoo import models, fields


class Dashboard(models.Model):
    _name = 'dentist.dashboard'
    _description = 'Dentist Dashboard'

    name = fields.Char(string='Dashboard Name', required=True, track_visibility='onchange')

