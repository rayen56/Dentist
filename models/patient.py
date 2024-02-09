from odoo import models, fields

class DentistPatient(models.Model):
    _name = 'dentist.patient'
    _description = 'Dentist Patient'

    name = fields.Char(string='Patient Name', required=True)
    address = fields.Text(string="Address")
    phone = fields.Char(string='Phone')
    email = fields.Char(string='Email')
    date_of_birth = fields.Date(string='Date of Birth')
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')],
        string='Gender')
    image = fields.Image(string='Image')

    allergies = fields.Text(string='Allergies')
    medications = fields.Text(string='Medications')
    health_conditions = fields.Text(string='Health Conditions')
