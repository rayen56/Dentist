from odoo import models, fields


class Tooth(models.Model):
    _name = 'dentist.tooth'
    _description = 'Tooth Model'

    name = fields.Char(string='Tooth Name', required=True)
    image = fields.Binary(string='Tooth Image', help="Image of the tooth")

    universal_number = fields.Char(string='Universal Number')

    tooth_type = fields.Selection(
        [('incisor', 'Incisor'), ('canine', 'Canine'), ('premolar', 'Premolar'), ('molar', 'Molar')],
        string='Tooth Type', help="Type of the tooth")

    position = fields.Selection(
        [('upper right', 'Upper Right'), ('upper left', 'Upper Left'), ('lower right', 'Lower Right'),('lower left', 'Lower Left')],
        string='Position', help="Position of the tooth")

