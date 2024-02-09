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

    #Medical History Fields
    allergies = fields.Text(string='Allergies')
    medications = fields.Text(string='Medications')

    # Dental Records Fields
    oral_health_information = fields.Text(string='Oral Health Information')
    past_treatments = fields.Text(string='Past Treatments')
    x_rays = fields.Binary(string='X-Rays')
    photos = fields.Binary(string='Photos')
    treatment_plans = fields.Text(string='Treatment Plans')
    notes = fields.Text(string='Notes')
    progress_updates = fields.Text(string='Progress Updates')

    # Image Field for Dental Images
    dental_images = fields.Binary(string='Dental Images', attachment=True)