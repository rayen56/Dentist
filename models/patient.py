from odoo import models, fields

class DentistPatient(models.Model):
    _name = 'dentist.patient'
    _description = 'Dentist Patient'

    name = fields.Char(string='Patient Name', required=True)
    address = fields.Text(string="Address")
    phone = fields.Char(string='Phone')
    email = fields.Char(string='Email')
    date_of_birth = fields.Date(string='Date of Birth', help='Enter the patient\'s date of birth')
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')],
        string='Gender')

    # Personal Image
    image_1920 = fields.Image(string='Image')

    # Medical History Fields
    allergies = fields.Text(string='Allergies')
    medications = fields.Text(string='Medications')

    # Dental Records Fields
    oral_health_information = fields.Text(string='Oral Health Information')
    past_treatments = fields.Text(string='Past Treatments')

    # Image Fields for Dental Records
    x_rays = fields.Image(string='X-Rays', help='Upload X-Ray images')
    dental_images = fields.Image(string='Dental Images', attachment=True, help='Upload dental images')

    treatment_plans = fields.Text(string='Treatment Plans')
    notes = fields.Text(string='Notes')
    progress_updates = fields.Text(string='Progress Updates')
